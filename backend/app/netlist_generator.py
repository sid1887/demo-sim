# backend/app/netlist_generator.py
"""
Convert parsed JSON into a SPICE netlist string. Supports basic components and will raise for unknown types.
"""
from typing import Dict, Any

def normalize_value(v: str) -> str:
    # minimal normalization: keep units like k, M, m, u, n, p, V
    return v

def json_to_netlist(parsed_json: Dict[str, Any]) -> str:
    comps = parsed_json.get("components", [])
    lines = [".title CircuitSim-AI Generated"]
    # Map basic components
    for c in comps:
        t = c.get("type", "").lower()
        name = c.get("name")
        nodes = c.get("nodes", [])
        value = c.get("value", "")
        if t in ("resistor", "r"):
            # SPICE: Rname node1 node2 value
            lines.append(f"{name} {nodes[0]} {nodes[1]} {normalize_value(value)}")
        elif t in ("voltagesource", "v", "voltage"):
            # Vname node+ node- DC value
            lines.append(f"{name} {nodes[0]} {nodes[1]} DC {normalize_value(value)}")
        elif t in ("capacitor", "c"):
            lines.append(f"{name} {nodes[0]} {nodes[1]} {normalize_value(value)}")
        elif t in ("inductor", "l"):
            lines.append(f"{name} {nodes[0]} {nodes[1]} {normalize_value(value)}")
        elif t in ("diode",):
            lines.append(f"{name} {nodes[0]} {nodes[1]} {c.get('model','D')}")
        elif t in ("npn", "pnp", "transistor"):
            # Generic BJT mapping (may need model lines)
            # Expect nodes order: collector base emitter
            lines.append(f"{name} {nodes[0]} {nodes[1]} {nodes[2]} {c.get('model','QMODEL')}")
        else:
            raise ValueError(f"Unsupported component type: {c.get('type')}")

    lines.append(".op")
    lines.append(".end")
    return "\n".join(lines)
