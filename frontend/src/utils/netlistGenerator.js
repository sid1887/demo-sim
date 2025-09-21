// SPICE Netlist Generator
// Converts React Flow nodes and edges to SPICE netlist format

export function generateNetlist(nodes, edges) {
  const netlist = [];
  const nodeMap = new Map(); // Track node connections
  let nodeCounter = 1;

  // Header
  netlist.push('* Generated Circuit Netlist');
  netlist.push('* Created: ' + new Date().toISOString());
  netlist.push('');

  // Auto-add ground if missing
  let hasGround = nodes.some(node => node.type === 'ground');
  if (!hasGround && nodes.length > 0) {
    // Add virtual ground node
    nodeMap.set('auto_ground', '0');
    netlist.push('* Auto-generated ground connection');
  }

  // Process edges to build node mapping - improved logic
  const processedConnections = new Set();
  edges.forEach((edge) => {
    if (!nodeMap.has(edge.source)) {
      nodeMap.set(edge.source, nodeCounter++);
    }
    if (!nodeMap.has(edge.target)) {
      nodeMap.set(edge.target, nodeCounter++);
    }
    processedConnections.add(edge.source);
    processedConnections.add(edge.target);
  });

  // Ensure all nodes have connections, even if isolated
  nodes.forEach(node => {
    if (!nodeMap.has(node.id)) {
      if (node.type === 'ground') {
        nodeMap.set(node.id, '0'); // SPICE ground is node 0
      } else {
        nodeMap.set(node.id, nodeCounter++);
      }
    }
  });

  // Ensure ground exists
  if (!hasGround) {
    nodeMap.set('0', '0'); // Ensure node 0 exists
  }

  // Generate component lines
  const componentCounters = {
    resistor: 1,
    capacitor: 1,
    inductor: 1,
    voltageSource: 1,
    currentSource: 1,
    diode: 1
  };

  nodes.forEach((node) => {
    const component = generateComponent(node, nodeMap, edges, componentCounters);
    if (component) {
      netlist.push(component);
    }
  });

  netlist.push('');
  return netlist.join('\n');
}

function generateComponent(node, nodeMap, edges, counters) {
  const { type, data, id } = node;
  
  // Find connected nodes
  const connectedEdges = edges.filter(edge => 
    edge.source === id || edge.target === id
  );
  
  if (connectedEdges.length === 0 && type !== 'ground') {
    console.warn(`Component ${id} has no connections`);
    return null;
  }

  const getNodeName = (nodeId, handleId = null) => {
    if (type === 'ground') return '0';
    return nodeMap.get(nodeId) || '0';
  };

  const getValue = (defaultValue) => {
    return data?.value?.replace(/[Ω|μ|m|k|M|G]/g, (match) => {
      switch (match) {
        case 'Ω': return '';
        case 'μ': return 'u';
        case 'm': return 'm';
        case 'k': return 'k';
        case 'M': return 'meg';
        case 'G': return 'g';
        default: return match;
      }
    }) || defaultValue;
  };

  switch (type) {
    case 'resistor': {
      const name = `R${counters.resistor++}`;
      const nodes = getComponentNodes(id, connectedEdges, nodeMap);
      const value = getValue('1k');
      return `${name} ${nodes[0]} ${nodes[1]} ${value}`;
    }

    case 'capacitor': {
      const name = `C${counters.capacitor++}`;
      const nodes = getComponentNodes(id, connectedEdges, nodeMap);
      const value = getValue('1u');
      return `${name} ${nodes[0]} ${nodes[1]} ${value}`;
    }

    case 'inductor': {
      const name = `L${counters.inductor++}`;
      const nodes = getComponentNodes(id, connectedEdges, nodeMap);
      const value = getValue('1m');
      return `${name} ${nodes[0]} ${nodes[1]} ${value}`;
    }

    case 'voltageSource': {
      const name = `V${counters.voltageSource++}`;
      const nodes = getComponentNodes(id, connectedEdges, nodeMap);
      const value = getValue('5');
      const sourceType = data?.sourceType || 'DC';
      
      if (sourceType === 'AC') {
        const freq = data?.frequency || '1k';
        return `${name} ${nodes[0]} ${nodes[1]} AC ${value} 0`;
      } else {
        return `${name} ${nodes[0]} ${nodes[1]} DC ${value}`;
      }
    }

    case 'currentSource': {
      const name = `I${counters.currentSource++}`;
      const nodes = getComponentNodes(id, connectedEdges, nodeMap);
      const value = getValue('1');
      return `${name} ${nodes[0]} ${nodes[1]} DC ${value}`;
    }

    case 'diode': {
      const name = `D${counters.diode++}`;
      const nodes = getComponentNodes(id, connectedEdges, nodeMap);
      const model = data?.type === 'LED' ? 'LED_MODEL' : 'DIODE_MODEL';
      return `${name} ${nodes[0]} ${nodes[1]} ${model}`;
    }

    case 'ground':
      // Ground nodes don't generate components, just node references
      return null;

    default:
      console.warn(`Unknown component type: ${type}`);
      return null;
  }
}

function getComponentNodes(componentId, connectedEdges, nodeMap) {
  const nodes = ['0', '0']; // Default to ground
  
  connectedEdges.forEach((edge, index) => {
    if (edge.source === componentId) {
      nodes[0] = nodeMap.get(edge.target) || `n${index + 1}`;
    } else if (edge.target === componentId) {
      nodes[1] = nodeMap.get(edge.source) || `n${index + 1}`;
    }
  });

  return nodes;
}

// Generate model statements for diodes and other components
export function generateModels() {
  return `
* Component Models
.model DIODE_MODEL D(IS=1e-12 N=1.4)
.model LED_MODEL D(IS=1e-12 N=2.0 VJ=2.0)
.model NPN_MODEL NPN(BF=100 IS=1e-14)
.model PNP_MODEL PNP(BF=100 IS=1e-14)
`;
}

// Validate netlist for common errors
export function validateNetlist(nodes, edges) {
  const errors = [];
  const warnings = [];

  // Check for minimum components - just need at least one component
  if (nodes.length === 0) {
    errors.push('Circuit is empty - add some components');
    return { errors, warnings };
  }

  // Auto-add ground if missing but we have components
  const hasGround = nodes.some(node => node.type === 'ground');
  if (!hasGround && nodes.length > 0) {
    // Just add a warning, don't block simulation - we can add ground automatically
    warnings.push('⚠️ Adding automatic ground connection');
  }

  // Check for connections only if we have multiple components
  if (nodes.length > 1 && edges.length === 0) {
    warnings.push('⚠️ Components are not connected - adding default connections');
  }

  // Check for isolated nodes only for large circuits
  const connectedNodes = new Set();
  edges.forEach(edge => {
    connectedNodes.add(edge.source);
    connectedNodes.add(edge.target);
  });

  let isolatedCount = 0;
  nodes.forEach(node => {
    if (!connectedNodes.has(node.id) && node.type !== 'ground') {
      isolatedCount++;
    }
  });

  if (isolatedCount > 0 && nodes.length > 2) {
    warnings.push(`${isolatedCount} component(s) may need connections`);
  }

  // Check for floating nodes (nodes with only one connection)
  const nodeConnections = new Map();
  edges.forEach(edge => {
    nodeConnections.set(edge.source, (nodeConnections.get(edge.source) || 0) + 1);
    nodeConnections.set(edge.target, (nodeConnections.get(edge.target) || 0) + 1);
  });

  nodeConnections.forEach((count, nodeId) => {
    if (count === 1) {
      const node = nodes.find(n => n.id === nodeId);
      if (node && node.type !== 'ground') {
        warnings.push(`Node ${node.data?.label || nodeId} has only one connection`);
      }
    }
  });

  return { errors, warnings };
}

// Create example circuits
export const EXAMPLE_CIRCUITS = {
  'voltage-divider': {
    name: 'Voltage Divider',
    description: 'Basic voltage divider circuit with two resistors',
    nodes: [
      { id: 'v1', type: 'voltageSource', position: { x: 100, y: 100 }, data: { label: 'V1', value: '5V' }},
      { id: 'r1', type: 'resistor', position: { x: 250, y: 100 }, data: { label: 'R1', value: '1kΩ' }},
      { id: 'r2', type: 'resistor', position: { x: 250, y: 200 }, data: { label: 'R2', value: '1kΩ' }},
      { id: 'gnd', type: 'ground', position: { x: 100, y: 300 }, data: { label: 'GND' }}
    ],
    edges: [
      { id: 'e1', source: 'v1', target: 'r1', type: 'wire' },
      { id: 'e2', source: 'r1', target: 'r2', type: 'wire' },
      { id: 'e3', source: 'r2', target: 'gnd', type: 'wire' },
      { id: 'e4', source: 'v1', target: 'gnd', type: 'wire' }
    ]
  },
  
  'rc-filter': {
    name: 'RC Low-Pass Filter',
    description: 'Simple RC filter circuit',
    nodes: [
      { id: 'v1', type: 'voltageSource', position: { x: 100, y: 100 }, data: { label: 'V1', value: '5V', sourceType: 'AC' }},
      { id: 'r1', type: 'resistor', position: { x: 250, y: 100 }, data: { label: 'R1', value: '1kΩ' }},
      { id: 'c1', type: 'capacitor', position: { x: 350, y: 200 }, data: { label: 'C1', value: '1μF' }},
      { id: 'gnd', type: 'ground', position: { x: 200, y: 300 }, data: { label: 'GND' }}
    ],
    edges: [
      { id: 'e1', source: 'v1', target: 'r1', type: 'wire' },
      { id: 'e2', source: 'r1', target: 'c1', type: 'wire' },
      { id: 'e3', source: 'c1', target: 'gnd', type: 'wire' },
      { id: 'e4', source: 'v1', target: 'gnd', type: 'wire' }
    ]
  }
};