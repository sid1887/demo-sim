import React, { useState, useCallback, useEffect } from 'react'
import { Toaster, toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

// Import new components
import TopToolbar from './components/TopToolbar'
import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'
import ChatPanel from './components/ChatPanel'
import ResultsViewer from './components/ResultsViewer'

// Import utilities and APIs
import { generateNetlist, validateNetlist, EXAMPLE_CIRCUITS } from './utils/netlistGenerator'
import { simulationAPI, geminiAPI, apiUtils } from './api/geminiClient'

// Import styles
import './styles/professional.css'
import './App.css'

export default function App() {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [simulationResults, setSimulationResults] = useState(null)
  const [selectedTool, setSelectedTool] = useState('select')
  const [selectedNode, setSelectedNode] = useState(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [chatOpen, setChatOpen] = useState(false) // Start closed for cleaner UI
  const [apiStatus, setApiStatus] = useState('checking')
  const [componentStats, setComponentStats] = useState({ count: 0, connections: 0, nodes: 0 })

  // Check API availability on startup
  useEffect(() => {
    checkAPIStatus()
  }, [])

  // Update component stats when nodes/edges change
  useEffect(() => {
    const nodeSet = new Set()
    edges.forEach(edge => {
      nodeSet.add(edge.source)
      nodeSet.add(edge.target)
    })

    setComponentStats({
      count: nodes.length,
      connections: edges.length,
      nodes: nodeSet.size
    })
  }, [nodes, edges])

  const checkAPIStatus = async () => {
    try {
      const available = await apiUtils.isAPIAvailable()
      setApiStatus(available ? 'available' : 'unavailable')
      if (!available) {
        toast.error('Backend server is not available')
      }
    } catch (error) {
      setApiStatus('unavailable')
      console.error('API Status Check Error:', error)
    }
  }

  // Handle simulation
  const handleSimulation = useCallback(async (circuitNodes, circuitEdges) => {
    try {
      setIsSimulating(true)
      
      // Use provided nodes/edges or current state
      const nodesToUse = circuitNodes || nodes
      const edgesToUse = circuitEdges || edges
      
      // Validate circuit
      const validation = validateNetlist(nodesToUse, edgesToUse)
      if (validation.errors.length > 0) {
        throw new Error(validation.errors.join(', '))
      }
      
      // Show warnings
      validation.warnings.forEach(warning => {
        toast(`⚠️ ${warning}`, { icon: '⚠️', duration: 3000 })
      })

      // Generate netlist
      const netlist = generateNetlist(nodesToUse, edgesToUse)
      console.log('Generated netlist:', netlist)

      // Run simulation
      const results = await simulationAPI.runSimulation(netlist, 'op')
      setSimulationResults(results)

      toast.success(`Simulation completed! Found ${Object.keys(results.results.nodes).length} node voltages`)
      
    } catch (error) {
      console.error('Simulation error:', error)
      const errorInfo = apiUtils.formatSimulationError(error)
      toast.error(`${errorInfo.title}: ${errorInfo.message}`)
      
      if (errorInfo.suggestion) {
        setTimeout(() => {
          toast(errorInfo.suggestion, { icon: '💡', duration: 5000 })
        }, 1000)
      }
    } finally {
      setIsSimulating(false)
    }
  }, [nodes, edges])

  // Handle component addition from sidebar
  const handleAddComponent = useCallback((type, nodeData) => {
    if (nodeData) {
      setNodes(prev => [...prev, nodeData])
    }
    toast.success(`${type} added to circuit`)
  }, [])

  // Handle node selection
  const handleNodeSelect = useCallback((node) => {
    setSelectedNode(node)
    toast(`Selected ${node.data?.label || node.type}`)
  }, [])

  // Load example circuit
  const loadExampleCircuit = useCallback((exampleKey) => {
    const example = EXAMPLE_CIRCUITS[exampleKey]
    if (example) {
      setNodes(example.nodes)
      setEdges(example.edges)
      toast.success(`Loaded ${example.name}`)
    }
  }, [])

  // Clear canvas
  const handleClearCanvas = useCallback(() => {
    setNodes([])
    setEdges([])
    setSimulationResults(null)
    setSelectedNode(null)
    toast.success('Canvas cleared')
  }, [])

  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#374151',
            border: '1px solid #d1d5db',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#22c55e',
              secondary: '#ffffff'
            }
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff'
            }
          }
        }}
      />

      {/* Top Toolbar */}
      <TopToolbar 
        onSimulate={() => handleSimulation()}
        onReset={handleClearCanvas}
        isSimulating={isSimulating}
        onSave={() => toast('Save functionality coming soon')}
        onOpen={() => toast('Open functionality coming soon')}
      />

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Component Library */}
        <Sidebar 
          onAddComponent={handleAddComponent}
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
          componentStats={componentStats}
        />

        {/* Canvas Area */}
        <div className="flex-1 flex flex-col">
          <Canvas
            onSimulate={handleSimulation}
            simulationResults={simulationResults?.results}
            onNodeSelect={handleNodeSelect}
            selectedNodeId={selectedNode?.id}
            onAddComponent={handleAddComponent}
          />

          {/* Bottom Results Panel */}
          {simulationResults && (
            <motion.div
              initial={{ y: 200, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="h-64 results-panel border-t"
            >
              <div className="results-panel-header">
                <h3 className="text-sm font-semibold text-gray-700">Simulation Results</h3>
                <div className={`simulation-status ${simulationResults?.success ? 'success' : 'error'}`}>
                  {simulationResults?.success ? 'Success' : 'Error'}
                </div>
              </div>
              <div className="results-panel-content">
                <ResultsViewer 
                  results={simulationResults}
                  nodes={nodes}
                  edges={edges}
                />
              </div>
            </motion.div>
          )}
        </div>

        {/* Chat Panel */}
        {chatOpen && (
          <motion.div
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-80 chat-panel"
          >
            <div className="chat-header">
              <h3 className="text-sm font-semibold text-gray-700">AI Assistant</h3>
              <button 
                onClick={() => setChatOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <ChatPanel 
              nodes={nodes}
              edges={edges}
              simulationResults={simulationResults}
              selectedNode={selectedNode}
              onClose={() => setChatOpen(false)}
              apiAvailable={apiStatus === 'available'}
            />
          </motion.div>
        )}
      </div>

      {/* Chat Toggle Button when closed */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed right-6 bottom-6 z-30 w-12 h-12 bg-blue-500 hover:bg-blue-600 
                   text-white rounded-full shadow-lg transition-all duration-200 
                   flex items-center justify-center"
        >
          💬
        </button>
      )}

      {/* Status Bar */}
      <div className="bg-gray-200 border-t border-gray-300 px-4 py-2 text-xs text-gray-600 
                    flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span>Components: {componentStats.count}</span>
          <span>Connections: {componentStats.connections}</span>
          <span>Nodes: {componentStats.nodes}</span>
        </div>
        <div className="flex items-center space-x-4">
          <div className={`w-2 h-2 rounded-full ${
            apiStatus === 'available' ? 'bg-green-500' : 
            apiStatus === 'unavailable' ? 'bg-red-500' : 'bg-yellow-500'
          }`} />
          <span>
            {apiStatus === 'available' && 'Backend Connected'}
            {apiStatus === 'unavailable' && 'Backend Offline'}
            {apiStatus === 'checking' && 'Checking Connection...'}
          </span>
        </div>
      </div>
    </div>
  )
}
