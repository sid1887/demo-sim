import React, { useState, useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState,
  addEdge,
  Panel
} from 'reactflow'
import 'reactflow/dist/style.css'
import ComponentNode from './nodes/ComponentNode'
import toast from 'react-hot-toast'

const nodeTypes = {
  component: ComponentNode,
}

const GRID_SIZE = 20
const SNAP_GRID = true

export default function CircuitCanvas({ 
  circuit, 
  onCircuitChange, 
  selectedTool, 
  onToolSelect 
}) {
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [draggedNodeType, setDraggedNodeType] = useState(null)
  const reactFlowWrapper = useRef(null)
  const [reactFlowInstance, setReactFlowInstance] = useState(null)

  // Convert circuit data to ReactFlow format
  React.useEffect(() => {
    if (circuit.components) {
      const flowNodes = circuit.components.map((comp, index) => ({
        id: comp.name || `comp-${index}`,
        type: 'component',
        position: { x: (index % 4) * 200 + 100, y: Math.floor(index / 4) * 150 + 100 },
        data: {
          componentType: comp.type,
          label: comp.name,
          value: comp.value,
          nodes: comp.nodes,
        },
        draggable: true,
      }))
      setNodes(flowNodes)
    }
  }, [circuit.components, setNodes])

  const onConnect = useCallback(
    (params) => {
      setEdges((eds) => addEdge(params, eds))
      toast.success('🔗 Components connected!')
    },
    [setEdges]
  )

  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()

      if (!reactFlowInstance) return

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      // Snap to grid if enabled
      if (SNAP_GRID) {
        position.x = Math.round(position.x / GRID_SIZE) * GRID_SIZE
        position.y = Math.round(position.y / GRID_SIZE) * GRID_SIZE
      }

      const newNode = {
        id: `${selectedTool}-${Date.now()}`,
        type: 'component',
        position,
        data: {
          componentType: selectedTool,
          label: getDefaultLabel(selectedTool),
          value: getDefaultValue(selectedTool),
          nodes: ['A', 'B'], // Default connection points
        },
        draggable: true,
      }

      setNodes((nds) => nds.concat(newNode))
      onToolSelect('select') // Switch back to select tool
      toast.success(`✅ ${getDefaultLabel(selectedTool)} added to circuit`)
    },
    [reactFlowInstance, selectedTool, onToolSelect, setNodes]
  )

  const onNodeClick = useCallback((event, node) => {
    if (selectedTool === 'delete') {
      setNodes((nds) => nds.filter((n) => n.id !== node.id))
      setEdges((eds) => eds.filter((e) => e.source !== node.id && e.target !== node.id))
      toast.success('🗑️ Component deleted')
    }
  }, [selectedTool, setNodes, setEdges])

  const onNodeDoubleClick = useCallback((event, node) => {
    // Open property editor (could implement modal here)
    toast('🔧 Double-click to edit properties (coming soon!)', { icon: '⚙️' })
  }, [])

  const clearCanvas = () => {
    setNodes([])
    setEdges([])
    toast.success('🧹 Canvas cleared')
  }

  return (
    <div className="w-full h-full relative" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={setReactFlowInstance}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        nodeTypes={nodeTypes}
        snapToGrid={SNAP_GRID}
        snapGrid={[GRID_SIZE, GRID_SIZE]}
        connectionLineStyle={{ stroke: '#3b82f6', strokeWidth: 2 }}
        defaultEdgeOptions={{ 
          animated: false, 
          style: { stroke: '#3b82f6', strokeWidth: 2 } 
        }}
      >
        <Background 
          color="#e5e7eb" 
          gap={GRID_SIZE} 
          size={1}
          variant="dots"
        />
        <Controls className="bg-white shadow-lg border border-gray-200" />
        <MiniMap 
          className="bg-white border border-gray-200 rounded-lg" 
          nodeColor="rgb(59, 130, 246)"
          maskColor="rgba(255, 255, 255, 0.8)"
        />

        {/* Canvas Controls Panel */}
        <Panel position="top-right" className="space-y-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={clearCanvas}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md shadow-md transition-colors"
          >
            Clear Canvas
          </motion.button>
        </Panel>

        {/* Instructions Panel */}
        <Panel position="bottom-left">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-3 shadow-md border border-gray-200 max-w-sm">
            <div className="text-sm text-gray-700">
              <p className="font-medium mb-2">Instructions:</p>
              <ul className="space-y-1 text-xs">
                <li>• Select component from sidebar</li>
                <li>• Click on canvas to place</li>
                <li>• Drag between connection points to wire</li>
                <li>• Use delete tool to remove components</li>
                <li>• Double-click to edit properties</li>
              </ul>
            </div>
          </div>
        </Panel>

        {/* Tool Cursor Indicator */}
        {selectedTool !== 'select' && (
          <Panel position="top-left">
            <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-md">
              {selectedTool === 'delete' ? '🗑️' : '✨'} {getDefaultLabel(selectedTool)} Mode
            </div>
          </Panel>
        )}
      </ReactFlow>
    </div>
  )
}

function getDefaultLabel(componentType) {
  const labels = {
    resistor: 'Resistor',
    capacitor: 'Capacitor',
    inductor: 'Inductor',
    voltage_source: 'Voltage Source',
    current_source: 'Current Source',
    diode: 'Diode',
    ground: 'Ground',
  }
  return labels[componentType] || 'Component'
}

function getDefaultValue(componentType) {
  const values = {
    resistor: '1kΩ',
    capacitor: '1μF',
    inductor: '1mH',
    voltage_source: '12V',
    current_source: '1mA',
    diode: 'D1',
    ground: '',
  }
  return values[componentType] || ''
}