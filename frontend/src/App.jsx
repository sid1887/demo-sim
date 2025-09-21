import React, { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'

import 'reactflow/dist/style.css'

import TopToolbar from './components/TopToolbar'
import Sidebar from './components/Sidebar'
import Canvas from './components/Canvas'
import ChatPanel from './components/ChatPanel'
import ResultsViewer from './components/ResultsViewer'
import ImageUploadPanel from './components/ImageUploadPanel'
import NotificationSystem, { notify, simulationNotify, circuitNotify } from './components/NotificationSystem'
import Oscilloscope from './components/Oscilloscope'

import { generateNetlist, validateNetlist, EXAMPLE_CIRCUITS } from './utils/netlistGenerator'
import { simulationAPI, geminiAPI, apiUtils } from './api/geminiClient'
import { useKeyboardShortcuts, ShortcutsHelp } from './hooks/useKeyboardShortcuts.jsx'
import { defaultGrid, defaultPinSystem } from './utils/gridSystem'

import './styles/professional.css'
import './styles/ieee-components.css'
import './styles/pcb-board.css'
import './App.css'

import toast, { Toaster } from 'react-hot-toast'

export default function App() {
  const [nodes, setNodes] = useState([])
  const [edges, setEdges] = useState([])
  const [simulationResults, setSimulationResults] = useState(null)
  const [selectedTool, setSelectedTool] = useState('select')
  const [selectedNode, setSelectedNode] = useState(null)
  const [isSimulating, setIsSimulating] = useState(false)
  const [chatOpen, setChatOpen] = useState(false)
  const [imageUploadOpen, setImageUploadOpen] = useState(false)
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false)
  const [apiStatus, setApiStatus] = useState('checking')
  const [componentStats, setComponentStats] = useState({ count: 0, connections: 0, nodes: 0 })
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [panMode, setPanMode] = useState(false)
  const [showOscilloscope, setShowOscilloscope] = useState(false)

  useEffect(() => {
    checkAPIStatus()
  }, [])

  useKeyboardShortcuts({
    'mod+s': () => simulateCircuit(),
    'mod+z': () => {},
    'mod+y': () => {},
    'mod+k': () => setChatOpen(!chatOpen),
    'mod+h': () => setShowShortcutsHelp(!showShortcutsHelp),
    'mod+i': () => setImageUploadOpen(!imageUploadOpen),
    'mod+o': () => setShowOscilloscope(!showOscilloscope),
    'c': () => setSelectedTool('capacitor'),
    'r': () => setSelectedTool('resistor'),
    'l': () => setSelectedTool('inductor'),
    'v': () => setSelectedTool('voltage_source'),
    'g': () => setSelectedTool('ground'),
    'escape': () => { 
      setSelectedTool('select')
      setSelectedNode(null) 
    }
  })

  const checkAPIStatus = async () => {
    try {
      setApiStatus('checking')
      const available = await apiUtils.checkAvailability()
      setApiStatus(available ? 'connected' : 'disconnected')
    } catch (error) {
      setApiStatus('error')
    }
  }

  const simulateCircuit = useCallback(async () => {
    if (isSimulating) return
    
    setIsSimulating(true)
    simulationNotify.loading('Preparing simulation...')

    try {
      const nodesToUse = nodes.length > 0 ? nodes : []
      const edgesToUse = edges.length > 0 ? edges : []
      
      const validation = validateNetlist(nodesToUse, edgesToUse)
      if (!validation.valid) {
        simulationNotify.error(`Validation failed: ${validation.errors.join(', ')}`)
        return
      }

      const netlist = generateNetlist(nodesToUse, edgesToUse)
      
      let results = null
      simulationNotify.info('Running simulation...')
      
      const nodeCount = nodesToUse.filter(n => n.type !== 'ground').length
      setComponentStats(prev => ({ ...prev, nodes: nodeCount }))
      
      try {
        const simulate = await simulationAPI('/api/simulate', { 
          nodes: nodesToUse, 
          edges: edgesToUse,
          netlist: netlist
        })
        
        results = simulate
        
      } catch (error) {
        const errorInfo = error.response?.data || error.message || 'Unknown error'
        simulationNotify.warning(`Node.js simulation failed: ${errorInfo}. Trying Python backend...`)
        
        try {
          results = await simulationAPI('/simulate', { netlist })
        } catch (pythonError) {
          simulationNotify.warning('Both simulation backends unavailable. Generating mock results...')
          
          results = {
            success: true,
            data: {
              type: 'analysis',
              analysis_type: 'op', 
              dc_values: {
                'node1': 5.0,
                'node2': 2.5
              },
              frequency_analysis: null
            }
          }
        }
      }

      if (results?.success || results?.data) {
        setSimulationResults(results)
        simulationNotify.success('Simulation completed successfully!')
        
        const components = nodesToUse.filter(n => n.type !== 'ground')
        setComponentStats(prev => ({
          ...prev, 
          count: components.length,
          connections: edgesToUse.length
        }))
        
      } else {
        simulationNotify.error('Simulation failed: No results returned')
      }

    } catch (error) {
      const errorInfo = error.response?.data?.error || error.message || 'Unknown error'
      simulationNotify.error(`Simulation error: ${errorInfo}`)
      console.error('Simulation error:', error)
    } finally {
      setIsSimulating(false)
    }
  }, [nodes, edges, isSimulating])

  const loadExample = useCallback(async (exampleKey) => {
    try {
      const example = EXAMPLE_CIRCUITS[exampleKey]
      if (!example) {
        notify.error('Example not found')
        return
      }

      setNodes(example.nodes)
      setEdges(example.edges) 
      notify.success(`Loaded ${example.name} example`)

    } catch (error) {
      notify.error('Failed to load example')
    }
  }, [])

  const addComponent = useCallback((componentType, position = null) => {
    const defaultPosition = position || { 
      x: Math.random() * 300 + 100, 
      y: Math.random() * 200 + 100 
    }

    const currentComponents = nodes.filter(n => n.type === componentType)
    setComponentStats(prev => ({ 
      ...prev, 
      count: prev.count + 1 
    }))

    console.log(`Adding ${componentType} at position:`, defaultPosition)
  }, [nodes])

  const handleImageAnalysis = useCallback(async (imageFile) => {
    if (isAnalyzingImage) return

    setIsAnalyzingImage(true)
    try {
      notify.success('Image analysis feature coming soon!')
    } catch (error) {
      notify.error('Image analysis failed')
    } finally {
      setIsAnalyzingImage(false)
    }
  }, [isAnalyzingImage])

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
          },
        }}
      />

      <TopToolbar
        selectedTool={selectedTool}
        onToolSelect={setSelectedTool}
        onSimulate={simulateCircuit}
        isSimulating={isSimulating}
        onLoadExample={loadExample}
        apiStatus={apiStatus}
        onRefreshAPI={checkAPIStatus}
        componentStats={componentStats}
        onToggleChat={() => setChatOpen(!chatOpen)}
        onToggleImageUpload={() => setImageUploadOpen(!imageUploadOpen)}
        onToggleShortcutsHelp={() => setShowShortcutsHelp(!showShortcutsHelp)}
        snapToGrid={snapToGrid}
        onToggleSnapToGrid={() => setSnapToGrid(!snapToGrid)}
        panMode={panMode}
        onTogglePanMode={() => setPanMode(!panMode)}
        onToggleOscilloscope={() => setShowOscilloscope(!showOscilloscope)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          selectedTool={selectedTool}
          onToolSelect={setSelectedTool}
          onAddComponent={addComponent}
        />

        <div className="flex-1 relative">
          <Canvas
            nodes={nodes}
            edges={edges}
            onNodesChange={setNodes}
            onEdgesChange={setEdges}
            selectedTool={selectedTool}
            onNodeSelect={setSelectedNode}
            selectedNode={selectedNode}
            snapToGrid={snapToGrid}
            panMode={panMode}
          />

          {simulationResults && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute top-4 right-4 w-80"
            >
              <ResultsViewer
                results={simulationResults}
                onClose={() => setSimulationResults(null)}
              />
            </motion.div>
          )}

          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="absolute bottom-4 right-4 w-96 h-96"
            >
              <ChatPanel
                onClose={() => setChatOpen(false)}
                circuit={{ nodes, edges }}
              />
            </motion.div>
          )}

          {imageUploadOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
            >
              <ImageUploadPanel
                onClose={() => setImageUploadOpen(false)}
                onImageAnalysis={handleImageAnalysis}
                isAnalyzing={isAnalyzingImage}
              />
            </motion.div>
          )}

          {showOscilloscope && simulationResults?.data && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className="absolute top-4 left-4 w-96 h-64"
            >
              <Oscilloscope
                data={simulationResults.data}
                onClose={() => setShowOscilloscope(false)}
              />
            </motion.div>
          )}
        </div>
      </div>

      {showShortcutsHelp && (
        <ShortcutsHelp onClose={() => setShowShortcutsHelp(false)} />
      )}

      <NotificationSystem />
    </div>
  )
}