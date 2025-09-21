# backend/app/netlist_generator.py
"""
Enhanced netlist generator with comprehensive component support and error handling.
Converts parsed JSON into a SPICE netlist string with validation and fallback handling.
"""
from typing import Dict, Any, List, Tuple
import logging
import re

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Extended component mapping with fallbacks and aliases
COMPONENT_MAPPING = {
    # Resistors
    'resistor': 'R',
    'r': 'R',
    'resistor-adjustable': 'R',
    'resistor-photo': 'R',
    'varistor': 'R',  # Treated as resistor with special model
    
    # Capacitors
    'capacitor': 'C',
    'c': 'C',
    'capacitor-polarized': 'C',
    'capacitor-unpolarized': 'C',
    
    # Inductors
    'inductor': 'L',
    'l': 'L',
    'transformer': 'T',  # Special case - needs custom handling
    
    # Voltage sources
    'voltagesource': 'V',
    'voltage-dc': 'V',
    'voltage-dc_ac': 'V',
    'voltage-dc_regulator': 'V',
    'v': 'V',
    'voltage': 'V',
    'battery': 'V',  # Treat battery as voltage source
    
    # Current sources
    'currentsource': 'I',
    'i': 'I',
    'current': 'I',
    
    # Diodes
    'diode': 'D',
    'd': 'D',
    'diode-light_emitting': 'D',
    'led': 'D',
    
    # Transistors
    'transistor': 'Q',
    'npn': 'Q',
    'pnp': 'Q',
    'bjt': 'Q',
    'transistor-photo': 'Q',
    'mosfet': 'M',  # MOSFET uses M prefix
    'mosfet-n': 'M',
    'mosfet-p': 'M',
    
    # Special components
    'ground': 'GND',
    'gnd': 'GND',
    'vss': 'GND',
    'diac': 'D',  # Treat as special diode
    'triac': 'Q',  # Treat as special transistor
    'thyristor': 'Q',  # Treat as special transistor
    
    # Active components (with warnings)
    'operational_amplifier': 'OP',
    'opamp': 'OP',
    'schmitt_trigger': 'ST',
    'integrated_circuit': 'IC',
    'integrated_cricuit-ne555': 'IC',  # Note: typo in original
    
    # Passive/mechanical (with fallbacks)
    'fuse': 'R',  # Treat as small resistor
    'switch': 'SW',
    'relay': 'SW',
    'antenna': 'R',  # Treat as small resistor
    'speaker': 'R',  # Treat as resistor for DC analysis
    'microphone': 'R',
    'motor': 'R',  # Simplified as resistor
    'lamp': 'R',   # Treat as resistor
    'probe-current': 'PROBE',
    'optocoupler': 'OC',
    
    # Connectors
    'terminal': 'TERM',
    'socket': 'TERM',
    'crossover': 'CROSS',
    
    # Logic gates (simplified)
    'and': 'LOGIC',
    'or': 'LOGIC',
    'not': 'LOGIC',
    'nand': 'LOGIC',
    'nor': 'LOGIC',
    'xor': 'LOGIC',
}

# Default values for components
DEFAULT_VALUES = {
    'R': '1k',      # 1 kΩ
    'C': '1u',      # 1 μF
    'L': '1m',      # 1 mH
    'V': '5',       # 5V
    'I': '1m',      # 1 mA
    'D': 'D1N4148',  # Generic diode model
    'Q': 'Q2N2222',  # Generic NPN model
    'M': 'IRF540',   # Generic NMOS model
}

def normalize_value(v: str) -> str:
    """
    Enhanced value normalization with unit conversion and validation.
    """
    if not v or v.lower() in ['unknown', 'n/a', 'auto']:
        return None
    
    # Convert common unit formats
    v = str(v).strip().upper()
    
    # Handle common units and conversions
    conversions = {
        'Ω': '',      # Remove ohm symbol
        'OHM': '',    # Remove ohm word
        'OHMS': '',   # Remove ohms word
        'V': '',      # Remove volt for resistor values
        'A': '',      # Remove ampere
        'F': '',      # Farad (keep for capacitors)
        'H': '',      # Henry (keep for inductors)
        'UF': 'u',    # Microfarad
        'PF': 'p',    # Picofarad
        'NF': 'n',    # Nanofarad
        'MH': 'm',    # Millihenry
        'UH': 'u',    # Microhenry
        'NH': 'n',    # Nanohenry
    }
    
    for old, new in conversions.items():
        v = v.replace(old, new)
    
    # Validate format
    if re.match(r'^[\d.]+[kmgtpnumKMGTPNU]*$', v):
        return v.lower()
    
    # If we can't parse it, try to extract the numeric part
    numeric_match = re.search(r'[\d.]+', v)
    if numeric_match:
        return numeric_match.group()
    
    return None

def validate_component(component: Dict[str, Any]) -> Tuple[bool, str]:
    """
    Validate a component and return (is_valid, error_message).
    """
    if not isinstance(component, dict):
        return False, "Component must be a dictionary"
    
    if 'type' not in component:
        return False, "Component missing 'type' field"
    
    if 'name' not in component:
        return False, "Component missing 'name' field"
    
    if 'nodes' not in component or not isinstance(component['nodes'], list):
        return False, "Component missing or invalid 'nodes' field"
    
    comp_type = component['type'].lower()
    nodes = component['nodes']
    
    # Check node requirements by component type
    spice_type = COMPONENT_MAPPING.get(comp_type)
    
    if not spice_type:
        return False, f"Unsupported component type: {component['type']}"
    
    # Node count validation
    if spice_type in ['R', 'C', 'L', 'V', 'I', 'D']:
        if len(nodes) != 2:
            return False, f"{component['type']} requires exactly 2 nodes, got {len(nodes)}"
    elif spice_type == 'Q':  # Transistors
        if len(nodes) not in [3, 4]:  # BJT: 3 nodes (C,B,E), MOSFET: 4 nodes (D,G,S,B)
            return False, f"Transistor requires 3 or 4 nodes, got {len(nodes)}"
    elif spice_type == 'M':  # MOSFET
        if len(nodes) not in [3, 4]:
            return False, f"MOSFET requires 3 or 4 nodes, got {len(nodes)}"
    
    return True, ""

def get_component_spice_line(component: Dict[str, Any], component_counters: Dict[str, int]) -> str:
    """
    Generate a SPICE line for a component with enhanced error handling.
    """
    comp_type = component.get("type", "").lower()
    name = component.get("name", "")
    nodes = component.get("nodes", [])
    value = component.get("value", "")
    
    # Get SPICE type
    spice_type = COMPONENT_MAPPING.get(comp_type)
    
    if not spice_type:
        logger.warning(f"Unknown component type '{comp_type}', skipping")
        return None
    
    # Handle special cases
    if spice_type == 'GND':
        # Ground doesn't generate a line, just ensures node 0 exists
        return None
    
    if spice_type in ['LOGIC', 'OP', 'ST', 'IC']:
        logger.warning(f"Complex component '{comp_type}' simplified as subcircuit")
        # For now, treat as a voltage-controlled voltage source (buffer)
        return f"E{component_counters.get('E', 1)} {nodes[0]} 0 {nodes[1]} 0 1"
    
    if spice_type in ['PROBE', 'TERM', 'CROSS', 'SW', 'OC']:
        logger.warning(f"Component '{comp_type}' simplified as wire/resistor")
        # Treat as small resistor
        return f"R{component_counters.get('R', 1)} {nodes[0]} {nodes[1]} 1m"
    
    # Normalize value
    normalized_value = normalize_value(value)
    if not normalized_value:
        normalized_value = DEFAULT_VALUES.get(spice_type, '1')
        logger.info(f"Using default value '{normalized_value}' for {name}")
    
    # Generate SPICE line based on type
    if spice_type == 'R':
        return f"{name if name.startswith('R') else 'R' + str(component_counters.get('R', 1))} {nodes[0]} {nodes[1]} {normalized_value}"
    
    elif spice_type == 'C':
        return f"{name if name.startswith('C') else 'C' + str(component_counters.get('C', 1))} {nodes[0]} {nodes[1]} {normalized_value}"
    
    elif spice_type == 'L':
        return f"{name if name.startswith('L') else 'L' + str(component_counters.get('L', 1))} {nodes[0]} {nodes[1]} {normalized_value}"
    
    elif spice_type == 'V':
        # Check if it's AC or DC
        source_type = component.get('source_type', 'DC').upper()
        if source_type == 'AC':
            return f"{name if name.startswith('V') else 'V' + str(component_counters.get('V', 1))} {nodes[0]} {nodes[1]} AC {normalized_value} 0"
        else:
            return f"{name if name.startswith('V') else 'V' + str(component_counters.get('V', 1))} {nodes[0]} {nodes[1]} DC {normalized_value}"
    
    elif spice_type == 'I':
        return f"{name if name.startswith('I') else 'I' + str(component_counters.get('I', 1))} {nodes[0]} {nodes[1]} DC {normalized_value}"
    
    elif spice_type == 'D':
        model = component.get('model', normalized_value if normalized_value else 'DGENERIC')
        return f"{name if name.startswith('D') else 'D' + str(component_counters.get('D', 1))} {nodes[0]} {nodes[1]} {model}"
    
    elif spice_type == 'Q':
        if len(nodes) >= 3:
            model = component.get('model', normalized_value if normalized_value else 'QGENERIC')
            line = f"{name if name.startswith('Q') else 'Q' + str(component_counters.get('Q', 1))} {nodes[0]} {nodes[1]} {nodes[2]} {model}"
            # Add 4th node if provided (substrate for some transistors)
            if len(nodes) >= 4:
                line += f" {nodes[3]}"
            return line
    
    elif spice_type == 'M':
        if len(nodes) >= 3:
            model = component.get('model', normalized_value if normalized_value else 'MGENERIC')
            line = f"{name if name.startswith('M') else 'M' + str(component_counters.get('M', 1))} {nodes[0]} {nodes[1]} {nodes[2]} {model}"
            # Add 4th node if provided (bulk/substrate)
            if len(nodes) >= 4:
                line += f" {nodes[3]}"
            return line
    
    elif spice_type == 'T':  # Transformer
        # Simplified transformer as coupled inductors
        if len(nodes) >= 4:
            l1_name = f"L{component_counters.get('L', 1)}"
            l2_name = f"L{component_counters.get('L', 1) + 1}"
            k_name = f"K{component_counters.get('K', 1)}"
            return f"{l1_name} {nodes[0]} {nodes[1]} {normalized_value}\n{l2_name} {nodes[2]} {nodes[3]} {normalized_value}\n{k_name} {l1_name} {l2_name} 0.99"
    
    logger.warning(f"Could not generate SPICE line for component type '{spice_type}'")
    return None

def json_to_netlist(parsed_json: Dict[str, Any]) -> str:
    """
    Enhanced JSON to netlist conversion with comprehensive error handling.
    """
    components = parsed_json.get("components", [])
    
    if not components:
        logger.warning("No components found in parsed JSON")
        return ".title Empty Circuit\n.end"
    
    lines = [".title CircuitSim-AI Generated", ""]
    errors = []
    warnings = []
    component_counters = {
        'R': 1, 'C': 1, 'L': 1, 'V': 1, 'I': 1, 
        'D': 1, 'Q': 1, 'M': 1, 'E': 1, 'K': 1
    }
    
    # Process each component
    for i, component in enumerate(components):
        try:
            # Validate component
            is_valid, error_msg = validate_component(component)
            
            if not is_valid:
                error_detail = f"Component {i+1}: {error_msg}"
                errors.append(error_detail)
                logger.error(error_detail)
                continue
            
            # Generate SPICE line
            spice_line = get_component_spice_line(component, component_counters)
            
            if spice_line:
                # Handle multi-line components (like transformers)
                if '\n' in spice_line:
                    lines.extend(spice_line.split('\n'))
                else:
                    lines.append(spice_line)
                
                # Update counters
                comp_type = COMPONENT_MAPPING.get(component.get("type", "").lower())
                if comp_type in component_counters:
                    component_counters[comp_type] += 1
            
        except Exception as e:
            error_detail = f"Component {i+1} ({component.get('name', 'unnamed')}): {str(e)}"
            errors.append(error_detail)
            logger.error(error_detail)
    
    # Add model definitions for components that need them
    lines.append("")
    lines.append("* Component Models")
    lines.append(".model DGENERIC D(IS=1e-12 N=1.4)")
    lines.append(".model QGENERIC NPN(BF=100 IS=1e-14)")
    lines.append(".model MGENERIC NMOS(VTO=1 KP=1e-3)")
    lines.append("")
    
    # Add analysis command
    lines.append(".op")
    lines.append(".end")
    
    netlist_str = "\n".join(lines)
    
    # Log summary
    valid_components = len([line for line in lines if not line.startswith('.') and not line.startswith('*') and line.strip()])
    logger.info(f"Generated netlist with {valid_components} components")
    
    if errors:
        logger.warning(f"Encountered {len(errors)} errors during conversion:")
        for error in errors:
            logger.warning(f"  - {error}")
    
    return netlist_str

def validate_netlist_string(netlist: str) -> Tuple[bool, List[str]]:
    """
    Validate a generated netlist string for common issues.
    """
    lines = netlist.strip().split('\n')
    errors = []
    
    # Check for basic structure
    has_title = any(line.startswith('.title') for line in lines)
    has_end = any(line.startswith('.end') for line in lines)
    
    if not has_title:
        errors.append("Missing .title statement")
    
    if not has_end:
        errors.append("Missing .end statement")
    
    # Check for at least one component
    component_lines = [line for line in lines if line and not line.startswith('.') and not line.startswith('*')]
    if not component_lines:
        errors.append("No components found in netlist")
    
    # Check for ground reference (node 0)
    netlist_text = netlist.lower()
    if '0' not in netlist_text and 'gnd' not in netlist_text:
        errors.append("No ground reference (node 0) found")
    
    return len(errors) == 0, errors
