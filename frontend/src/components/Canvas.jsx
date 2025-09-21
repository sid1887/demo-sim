import React, { useState, useCallback, useMemo } from 'react';
import ReactFlow, { 
  addEdge, 
  applyNodeChanges, 
  applyEdgeChanges,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ReactFlowProvider,
  Panel
} from 'reactflow';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

// Import custom nodes
import ResistorNode from './CustomNodes/ResistorNode';
import CapacitorNode from './CustomNodes/CapacitorNode';
import InductorNode from './CustomNodes/InductorNode';
import VoltageSourceNode from './CustomNodes/VoltageSourceNode';
import CurrentSourceNode from './CustomNodes/CurrentSourceNode';
import DiodeNode from './CustomNodes/DiodeNode';
import GroundNode from './CustomNodes/GroundNode';

// Import custom edge
import WireEdge from './Edges/WireEdge';

// Import styles
import 'reactflow/dist/style.css';
import '../styles/glass.css';

const nodeTypes = {
  resistor: ResistorNode,
  capacitor: CapacitorNode,
  inductor: InductorNode,
  voltageSource: VoltageSourceNode,
  currentSource: CurrentSourceNode,
  diode: DiodeNode,
  ground: GroundNode,
};

const edgeTypes = {
  wire: WireEdge,
};

const initialNodes = [
  {
    id: 'example-1',
    type: 'voltageSource',
    position: { x: 100, y: 100 },
    data: { label: 'V1', value: '5V', sourceType: 'DC' }
  },
  {
    id: 'example-2',
    type: 'resistor',
    position: { x: 300, y: 100 },
    data: { label: 'R1', value: '1kΩ' }
  },
  {
    id: 'example-3',
    type: 'ground',
    position: { x: 200, y: 200 },
    data: { label: 'GND' }
  }
];

const initialEdges = [];

function Canvas({ 
  onSimulate, 
  simulationResults, 
  onNodeSelect,
  selectedNodeId,
  onAddComponent 
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [isSimulating, setIsSimulating] = useState(false);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Update edges with simulation data
  const edgesWithData = useMemo(() => {
    if (!simulationResults?.edges) return edges;
    
    return edges.map(edge => ({
      ...edge,
      type: 'wire',
      data: {
        ...edge.data,
        current: simulationResults.edges[edge.id]?.current || 0,
        voltage: simulationResults.edges[edge.id]?.voltage || 0,
      }
    }));
  }, [edges, simulationResults]);

  // Handle drag over for drop functionality
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handle component drop from sidebar
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      if (typeof type === 'undefined' || !type) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      addComponent(type, position);
    },
    [reactFlowInstance]
  );

  const onConnect = useCallback((params) => {
    const newEdge = {
      ...params,
      type: 'wire',
      id: `edge-${params.source}-${params.target}`,
      data: { current: 0, voltage: 0 }
    };
    setEdges((eds) => addEdge(newEdge, eds));
    toast.success('Components connected');
  }, [setEdges]);

  const addComponent = useCallback((type, position = null) => {
    const nodeId = `${type}-${Date.now()}`;
    const componentDefaults = {
      resistor: { label: `R${nodes.filter(n => n.type === 'resistor').length + 1}`, value: '1kΩ' },
      capacitor: { label: `C${nodes.filter(n => n.type === 'capacitor').length + 1}`, value: '1μF' },
      inductor: { label: `L${nodes.filter(n => n.type === 'inductor').length + 1}`, value: '1mH' },
      voltageSource: { label: `V${nodes.filter(n => n.type === 'voltageSource').length + 1}`, value: '5V', sourceType: 'DC' },
      currentSource: { label: `I${nodes.filter(n => n.type === 'currentSource').length + 1}`, value: '1A' },
      diode: { label: `D${nodes.filter(n => n.type === 'diode').length + 1}`, type: 'standard' },
      ground: { label: 'GND' }
    };

    const newNode = {
      id: nodeId,
      type,
      position: position || { 
        x: Math.random() * 400 + 200, 
        y: Math.random() * 300 + 150 
      },
      data: componentDefaults[type] || { label: type }
    };

    setNodes((nds) => nds.concat(newNode));
    toast.success(`${type} added to circuit`);
    
    // Notify parent component if callback provided
    if (onAddComponent) {
      onAddComponent(type, newNode);
    }
    
    return nodeId;
  }, [nodes, setNodes, onAddComponent]);

  const clearCanvas = useCallback(() => {
    setNodes([]);
    setEdges([]);
    toast.success('Canvas cleared');
  }, [setNodes, setEdges]);

  const handleSimulate = useCallback(async () => {
    if (nodes.length === 0) {
      toast.error('Add components to simulate');
      return;
    }

    setIsSimulating(true);
    toast.loading('Running simulation...', { id: 'simulation' });

    try {
      await onSimulate(nodes, edges);
      toast.success('Simulation completed', { id: 'simulation' });
    } catch (error) {
      toast.error('Simulation failed: ' + error.message, { id: 'simulation' });
    } finally {
      setIsSimulating(false);
    }
  }, [nodes, edges, onSimulate]);

  const onNodeClick = useCallback((event, node) => {
    onNodeSelect?.(node);
  }, [onNodeSelect]);

  const canvasProps = {
    nodes,
    edges: edgesWithData,
    onNodesChange,
    onEdgesChange,
    onConnect,
    onNodeClick,
    nodeTypes,
    edgeTypes,
    onInit: setReactFlowInstance,
    onDragOver,
    onDrop,
    defaultViewport: { x: 0, y: 0, zoom: 1 },
    minZoom: 0.2,
    maxZoom: 4,
    snapToGrid: true,
    snapGrid: [10, 10],
    connectionLineStyle: {
      stroke: '#22c55e',
      strokeWidth: 3,
    },
    deleteKeyCode: 'Delete',
    multiSelectionKeyCode: 'Control',
    fitView: true,
  };

  return (
    <div className="canvas-container">
      {/* React Flow Canvas */}
      <div className="flex-1 relative bg-gray-50">
        <ReactFlow {...canvasProps}>
          <Background 
            color="#d1d5db"
            gap={20}
            size={1}
            variant="dots"
          />
          <Controls 
            className="react-flow__controls"
            showInteractive={false}
          />
        </ReactFlow>
      </div>
    </div>
  );
}

// Wrap with ReactFlowProvider for proper context
const CanvasWithProvider = (props) => (
  <ReactFlowProvider>
    <Canvas {...props} />
  </ReactFlowProvider>
);

export default CanvasWithProvider;