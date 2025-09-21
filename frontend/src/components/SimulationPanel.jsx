import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Square, Settings, Zap, Activity, BarChart3 } from 'lucide-react'
import { simulate } from '../api'
import toast from 'react-hot-toast'

const ANALYSIS_TYPES = [
  { id: 'dc', name: 'DC Analysis', icon: Zap, description: 'Operating point' },
  { id: 'transient', name: 'Transient', icon: Activity, description: 'Time domain' },
  { id: 'ac', name: 'AC Analysis', icon: BarChart3, description: 'Frequency domain' },
]

export default function SimulationPanel({ 
  circuit, 
  onSimulate, 
  isSimulating, 
  onSimulatingChange 
}) {
  const [selectedAnalysis, setSelectedAnalysis] = useState('dc')
  const [analysisSettings, setAnalysisSettings] = useState({
    dc: {},
    transient: {
      step: '1ms',
      end: '100ms',
    },
    ac: {
      start: '1Hz',
      stop: '1MHz',
      points: 100,
    }
  })

  const runSimulation = async () => {
    if (!circuit.components || circuit.components.length === 0) {
      toast.error('❌ No circuit to simulate! Add components first.')
      return
    }

    onSimulatingChange(true)
    const simToast = toast.loading(`🔬 Running ${selectedAnalysis.toUpperCase()} simulation...`)

    try {
      // Generate netlist from circuit
      const netlist = generateNetlistFromComponents(circuit.components)
      
      // Run simulation
      const result = await simulate(netlist, {
        type: selectedAnalysis,
        ...analysisSettings[selectedAnalysis]
      })

      onSimulate(result)
      toast.success(`✅ ${selectedAnalysis.toUpperCase()} simulation completed!`, { id: simToast })
    } catch (error) {
      console.error('Simulation error:', error)
      toast.error(`❌ Simulation failed: ${error.message}`, { id: simToast })
    } finally {
      onSimulatingChange(false)
    }
  }

  const stopSimulation = () => {
    onSimulatingChange(false)
    toast('⏹️ Simulation stopped')
  }

  const updateSetting = (key, value) => {
    setAnalysisSettings(prev => ({
      ...prev,
      [selectedAnalysis]: {
        ...prev[selectedAnalysis],
        [key]: value
      }
    }))
  }

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Analysis Type Selector */}
        <div className="flex items-center space-x-4">
          <h3 className="text-sm font-semibold text-gray-700">Simulation:</h3>
          <div className="flex items-center space-x-1">
            {ANALYSIS_TYPES.map((analysis) => {
              const Icon = analysis.icon
              return (
                <motion.button
                  key={analysis.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedAnalysis(analysis.id)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedAnalysis === analysis.id
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  title={analysis.description}
                >
                  <Icon className="w-4 h-4" />
                  <span>{analysis.name}</span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Settings and Controls */}
        <div className="flex items-center space-x-3">
          {/* Analysis Settings */}
          {selectedAnalysis !== 'dc' && (
            <div className="flex items-center space-x-2 text-sm">
              {selectedAnalysis === 'transient' && (
                <>
                  <label className="text-gray-600">Step:</label>
                  <input
                    type="text"
                    value={analysisSettings.transient.step}
                    onChange={(e) => updateSetting('step', e.target.value)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                    placeholder="1ms"
                  />
                  <label className="text-gray-600">End:</label>
                  <input
                    type="text"
                    value={analysisSettings.transient.end}
                    onChange={(e) => updateSetting('end', e.target.value)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                    placeholder="100ms"
                  />
                </>
              )}
              
              {selectedAnalysis === 'ac' && (
                <>
                  <label className="text-gray-600">Start:</label>
                  <input
                    type="text"
                    value={analysisSettings.ac.start}
                    onChange={(e) => updateSetting('start', e.target.value)}
                    className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                    placeholder="1Hz"
                  />
                  <label className="text-gray-600">Stop:</label>
                  <input
                    type="text"
                    value={analysisSettings.ac.stop}
                    onChange={(e) => updateSetting('stop', e.target.value)}
                    className="w-20 px-2 py-1 border border-gray-300 rounded text-center"
                    placeholder="1MHz"
                  />
                </>
              )}
            </div>
          )}

          {/* Run/Stop Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isSimulating ? stopSimulation : runSimulation}
            disabled={!circuit.components?.length}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all shadow-md ${
              isSimulating
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : circuit.components?.length
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSimulating ? (
              <>
                <Square className="w-4 h-4" />
                <span>Stop</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                <span>Simulate</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      {/* Component Count Info */}
      <div className="mt-2 text-xs text-gray-500">
        Circuit: {circuit.components?.length || 0} components
        {circuit.netlist && ' • Netlist ready'}
      </div>
    </div>
  )
}

// Helper function to generate SPICE netlist from circuit components
function generateNetlistFromComponents(components) {
  const lines = ['.title Generated Circuit']
  
  components.forEach((comp, index) => {
    const name = comp.name || `${comp.type[0].toUpperCase()}${index + 1}`
    const nodes = comp.nodes || ['N1', 'N2']
    
    switch (comp.type.toLowerCase()) {
      case 'resistor':
        lines.push(`${name} ${nodes[0]} ${nodes[1]} ${comp.value || '1k'}`)
        break
      case 'capacitor':
        lines.push(`${name} ${nodes[0]} ${nodes[1]} ${comp.value || '1u'}`)
        break
      case 'inductor':
        lines.push(`${name} ${nodes[0]} ${nodes[1]} ${comp.value || '1m'}`)
        break
      case 'voltage_source':
        lines.push(`${name} ${nodes[0]} ${nodes[1]} DC ${comp.value || '12V'}`)
        break
      case 'current_source':
        lines.push(`${name} ${nodes[0]} ${nodes[1]} DC ${comp.value || '1m'}`)
        break
      default:
        lines.push(`* Unknown component: ${comp.type}`)
    }
  })
  
  lines.push('.op')
  lines.push('.end')
  
  return lines.join('\n')
}