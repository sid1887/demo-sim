import React, { useState, useEffect, useRef, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './Oscilloscope.css'

// Generate sample waveform data
const generateWaveform = (type, frequency, amplitude, phase, sampleCount = 400) => {
  const data = []
  for (let i = 0; i < sampleCount; i++) {
    const t = (i / sampleCount) * 4 * Math.PI
    let y = 0
    
    switch (type) {
      case 'sine':
        y = amplitude * Math.sin(frequency * t + phase)
        break
      case 'square':
        y = amplitude * Math.sign(Math.sin(frequency * t + phase))
        break
      case 'triangle':
        y = amplitude * (2 / Math.PI) * Math.asin(Math.sin(frequency * t + phase))
        break
      case 'sawtooth':
        y = amplitude * (2 / Math.PI) * Math.atan(Math.tan(frequency * t + phase / 2))
        break
      default:
        y = 0
    }
    
    data.push({ x: i, y: y })
  }
  return data
}

// Channel configuration
const CHANNEL_COLORS = ['#00ff00', '#ffff00', '#ff00ff', '#00ffff']
const DEFAULT_CHANNELS = [
  { id: 'ch1', name: 'Channel 1', enabled: true, color: '#00ff00', voltage: 5, frequency: 1, waveform: 'sine', phase: 0 },
  { id: 'ch2', name: 'Channel 2', enabled: false, color: '#ffff00', voltage: 3, frequency: 2, waveform: 'square', phase: Math.PI / 4 },
  { id: 'ch3', name: 'Channel 3', enabled: false, color: '#ff00ff', voltage: 2, frequency: 0.5, waveform: 'triangle', phase: 0 },
  { id: 'ch4', name: 'Channel 4', enabled: false, color: '#00ffff', voltage: 4, frequency: 3, waveform: 'sawtooth', phase: Math.PI / 2 }
]

// Waveform Canvas Component
function WaveformCanvas({ channels, timeBase, voltageBase, width = 400, height = 300 }) {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const dpr = window.devicePixelRatio || 1
    
    // Set up high DPI canvas
    canvas.width = width * dpr
    canvas.height = height * dpr
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    ctx.scale(dpr, dpr)
    
    // Clear canvas
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, width, height)
    
    // Draw grid
    ctx.strokeStyle = '#333'
    ctx.lineWidth = 1
    
    // Vertical grid lines
    for (let x = 0; x <= width; x += width / 10) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, height)
      ctx.stroke()
    }
    
    // Horizontal grid lines
    for (let y = 0; y <= height; y += height / 8) {
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(width, y)
      ctx.stroke()
    }
    
    // Draw center lines
    ctx.strokeStyle = '#555'
    ctx.lineWidth = 2
    
    // Center horizontal line
    ctx.beginPath()
    ctx.moveTo(0, height / 2)
    ctx.lineTo(width, height / 2)
    ctx.stroke()
    
    // Center vertical line
    ctx.beginPath()
    ctx.moveTo(width / 2, 0)
    ctx.lineTo(width / 2, height)
    ctx.stroke()
    
    // Draw waveforms
    channels.filter(ch => ch.enabled).forEach(channel => {
      const waveData = generateWaveform(
        channel.waveform, 
        channel.frequency * timeBase, 
        channel.voltage * voltageBase, 
        channel.phase
      )
      
      ctx.strokeStyle = channel.color
      ctx.lineWidth = 2
      ctx.beginPath()
      
      waveData.forEach((point, index) => {
        const x = (point.x / waveData.length) * width
        const y = height / 2 - (point.y / 10) * (height / 2)
        
        if (index === 0) {
          ctx.moveTo(x, y)
        } else {
          ctx.lineTo(x, y)
        }
      })
      
      ctx.stroke()
    })
    
  }, [channels, timeBase, voltageBase, width, height])
  
  return <canvas ref={canvasRef} className="oscilloscope-canvas" />
}

// Channel Control Component
function ChannelControl({ channel, onChange }) {
  return (
    <div className="channel-control">
      <div className="channel-header">
        <div className="channel-indicator" style={{ backgroundColor: channel.color }} />
        <label className="channel-name">{channel.name}</label>
        <input
          type="checkbox"
          checked={channel.enabled}
          onChange={(e) => onChange({ ...channel, enabled: e.target.checked })}
          className="channel-enable"
        />
      </div>
      
      {channel.enabled && (
        <div className="channel-settings">
          <div className="setting-group">
            <label>Voltage (V)</label>
            <input
              type="range"
              min="0.1"
              max="10"
              step="0.1"
              value={channel.voltage}
              onChange={(e) => onChange({ ...channel, voltage: parseFloat(e.target.value) })}
            />
            <span className="value-display">{channel.voltage}V</span>
          </div>
          
          <div className="setting-group">
            <label>Frequency (Hz)</label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={channel.frequency}
              onChange={(e) => onChange({ ...channel, frequency: parseFloat(e.target.value) })}
            />
            <span className="value-display">{channel.frequency}Hz</span>
          </div>
          
          <div className="setting-group">
            <label>Waveform</label>
            <select
              value={channel.waveform}
              onChange={(e) => onChange({ ...channel, waveform: e.target.value })}
            >
              <option value="sine">Sine</option>
              <option value="square">Square</option>
              <option value="triangle">Triangle</option>
              <option value="sawtooth">Sawtooth</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

// Main Oscilloscope Component
export default function Oscilloscope({ isOpen, onClose, simulationData }) {
  const [channels, setChannels] = useState(DEFAULT_CHANNELS)
  const [timeBase, setTimeBase] = useState(1) // Time per division
  const [voltageBase, setVoltageBase] = useState(1) // Voltage per division
  const [isRunning, setIsRunning] = useState(true)
  const [triggerMode, setTriggerMode] = useState('auto')
  
  // Update channel based on simulation data
  useEffect(() => {
    if (simulationData && simulationData.nodes) {
      const nodeVoltages = Object.entries(simulationData.nodes)
      
      // Map first few node voltages to channels
      const updatedChannels = channels.map((channel, index) => {
        if (index < nodeVoltages.length && nodeVoltages[index]) {
          const [nodeId, nodeData] = nodeVoltages[index]
          const voltage = parseFloat(nodeData.voltage) || 0
          
          return {
            ...channel,
            name: `Node ${nodeId}`,
            voltage: Math.abs(voltage),
            enabled: Math.abs(voltage) > 0.1 // Enable if voltage is significant
          }
        }
        return channel
      })
      
      setChannels(updatedChannels)
    }
  }, [simulationData])
  
  const handleChannelChange = (updatedChannel) => {
    setChannels(prev => prev.map(ch => 
      ch.id === updatedChannel.id ? updatedChannel : ch
    ))
  }
  
  const handleReset = () => {
    setChannels(DEFAULT_CHANNELS)
    setTimeBase(1)
    setVoltageBase(1)
  }
  
  if (!isOpen) return null
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="oscilloscope-container"
      >
        <div className="oscilloscope-header">
          <div className="oscilloscope-title">
            <span className="oscilloscope-icon">📊</span>
            <h3>Digital Oscilloscope</h3>
          </div>
          <div className="oscilloscope-controls">
            <button
              className={`control-btn ${isRunning ? 'active' : ''}`}
              onClick={() => setIsRunning(!isRunning)}
            >
              {isRunning ? '⏸️ Pause' : '▶️ Run'}
            </button>
            <button className="control-btn" onClick={handleReset}>
              🔄 Reset
            </button>
            <button className="close-btn" onClick={onClose}>
              ×
            </button>
          </div>
        </div>
        
        <div className="oscilloscope-body">
          <div className="waveform-display">
            <WaveformCanvas 
              channels={channels}
              timeBase={timeBase}
              voltageBase={voltageBase}
              width={500}
              height={350}
            />
            
            <div className="scope-info">
              <div className="time-info">Time: {timeBase}s/div</div>
              <div className="voltage-info">Voltage: {voltageBase}V/div</div>
              <div className="trigger-info">Trigger: {triggerMode}</div>
            </div>
          </div>
          
          <div className="oscilloscope-controls-panel">
            <div className="control-section">
              <h4>Timebase</h4>
              <div className="control-group">
                <input
                  type="range"
                  min="0.1"
                  max="5"
                  step="0.1"
                  value={timeBase}
                  onChange={(e) => setTimeBase(parseFloat(e.target.value))}
                />
                <span>{timeBase}s/div</span>
              </div>
            </div>
            
            <div className="control-section">
              <h4>Voltage</h4>
              <div className="control-group">
                <input
                  type="range"
                  min="0.1"
                  max="10"
                  step="0.1"
                  value={voltageBase}
                  onChange={(e) => setVoltageBase(parseFloat(e.target.value))}
                />
                <span>{voltageBase}V/div</span>
              </div>
            </div>
            
            <div className="control-section">
              <h4>Trigger</h4>
              <select
                value={triggerMode}
                onChange={(e) => setTriggerMode(e.target.value)}
              >
                <option value="auto">Auto</option>
                <option value="normal">Normal</option>
                <option value="single">Single</option>
              </select>
            </div>
          </div>
        </div>
        
        <div className="channels-panel">
          <h4>Channels</h4>
          <div className="channels-grid">
            {channels.map(channel => (
              <ChannelControl
                key={channel.id}
                channel={channel}
                onChange={handleChannelChange}
              />
            ))}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}