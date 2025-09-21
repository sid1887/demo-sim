import React from 'react'
import { Handle, Position } from 'reactflow'
import './SignalGenerators.css'

// AC Voltage Source
export function ACVoltageSource({ id, data, selected }) {
  const voltage = data?.voltage || '5V'
  const frequency = data?.frequency || '60Hz'
  const phase = data?.phase || '0°'
  
  return (
    <div className={`signal-generator ac-voltage ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      
      <div className="generator-symbol">
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="#fef3c7" stroke="#d97706" strokeWidth="2"/>
          <path 
            d="M15,30 Q20,20 25,30 T35,30 T45,30" 
            fill="none" 
            stroke="#d97706" 
            strokeWidth="2"
          />
          <line x1="5" y1="30" x2="15" y2="30" stroke="#d97706" strokeWidth="2"/>
          <line x1="45" y1="30" x2="55" y2="30" stroke="#d97706" strokeWidth="2"/>
        </svg>
      </div>
      
      <div className="generator-label">
        <div className="generator-name">AC Source</div>
        <div className="generator-params">
          <div className="param">{voltage}</div>
          <div className="param">{frequency}</div>
          <div className="param">{phase}</div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

// DC Voltage Source
export function DCVoltageSource({ id, data, selected }) {
  const voltage = data?.voltage || '5V'
  const current = data?.current || '1A'
  
  return (
    <div className={`signal-generator dc-voltage ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      
      <div className="generator-symbol">
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="#fee2e2" stroke="#dc2626" strokeWidth="2"/>
          <text x="30" y="35" textAnchor="middle" fontSize="16" fill="#dc2626" fontWeight="bold">+</text>
          <text x="30" y="22" textAnchor="middle" fontSize="10" fill="#dc2626">DC</text>
          <line x1="5" y1="30" x2="15" y2="30" stroke="#dc2626" strokeWidth="2"/>
          <line x1="45" y1="30" x2="55" y2="30" stroke="#dc2626" strokeWidth="2"/>
        </svg>
      </div>
      
      <div className="generator-label">
        <div className="generator-name">DC Source</div>
        <div className="generator-params">
          <div className="param">{voltage}</div>
          <div className="param">Max: {current}</div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

// Function Generator
export function FunctionGenerator({ id, data, selected }) {
  const waveform = data?.waveform || 'sine'
  const amplitude = data?.amplitude || '5V'
  const frequency = data?.frequency || '1kHz'
  const offset = data?.offset || '0V'
  
  const waveformPaths = {
    sine: "M10,30 Q15,20 20,30 T30,30 T40,30 T50,30",
    square: "M10,40 L10,20 L20,20 L20,40 L30,40 L30,20 L40,20 L40,40 L50,40",
    triangle: "M10,40 L20,20 L30,40 L40,20 L50,40",
    sawtooth: "M10,40 L20,20 L20,40 L30,20 L30,40 L40,20 L40,40 L50,20"
  }
  
  return (
    <div className={`signal-generator function-gen ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      
      <div className="generator-symbol">
        <svg width="60" height="60" viewBox="0 0 60 60">
          <rect x="5" y="10" width="50" height="40" fill="#e0f2fe" stroke="#0284c7" strokeWidth="2" rx="4"/>
          <path 
            d={waveformPaths[waveform]} 
            fill="none" 
            stroke="#0284c7" 
            strokeWidth="2"
          />
          <text x="30" y="58" textAnchor="middle" fontSize="8" fill="#0284c7">FG</text>
        </svg>
      </div>
      
      <div className="generator-label">
        <div className="generator-name">Function Gen</div>
        <div className="generator-params">
          <div className="param">{waveform}</div>
          <div className="param">{amplitude}</div>
          <div className="param">{frequency}</div>
          <div className="param">DC: {offset}</div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

// Current Source
export function CurrentSource({ id, data, selected }) {
  const current = data?.current || '1mA'
  const compliance = data?.compliance || '10V'
  
  return (
    <div className={`signal-generator current-source ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      
      <div className="generator-symbol">
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="25" fill="#f3e8ff" stroke="#7c3aed" strokeWidth="2"/>
          <text x="30" y="35" textAnchor="middle" fontSize="16" fill="#7c3aed" fontWeight="bold">I</text>
          <line x1="5" y1="30" x2="15" y2="30" stroke="#7c3aed" strokeWidth="2"/>
          <line x1="45" y1="30" x2="55" y2="30" stroke="#7c3aed" strokeWidth="2"/>
          <polygon points="35,25 45,30 35,35" fill="#7c3aed"/>
        </svg>
      </div>
      
      <div className="generator-label">
        <div className="generator-name">I Source</div>
        <div className="generator-params">
          <div className="param">{current}</div>
          <div className="param">V_max: {compliance}</div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

// Pulse Generator
export function PulseGenerator({ id, data, selected }) {
  const amplitude = data?.amplitude || '5V'
  const frequency = data?.frequency || '1MHz'
  const dutyCycle = data?.dutyCycle || '50%'
  const riseTime = data?.riseTime || '1ns'
  
  return (
    <div className={`signal-generator pulse-gen ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      
      <div className="generator-symbol">
        <svg width="60" height="60" viewBox="0 0 60 60">
          <rect x="5" y="10" width="50" height="40" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" rx="4"/>
          <path 
            d="M10,40 L10,20 L20,20 L20,40 L25,40 L25,20 L35,20 L35,40 L40,40 L40,20 L50,20 L50,40" 
            fill="none" 
            stroke="#f59e0b" 
            strokeWidth="2"
          />
          <text x="30" y="58" textAnchor="middle" fontSize="8" fill="#f59e0b">PULSE</text>
        </svg>
      </div>
      
      <div className="generator-label">
        <div className="generator-name">Pulse Gen</div>
        <div className="generator-params">
          <div className="param">{amplitude}</div>
          <div className="param">{frequency}</div>
          <div className="param">{dutyCycle}</div>
          <div className="param">tr: {riseTime}</div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

// Arbitrary Waveform Generator
export function ArbitraryWaveformGenerator({ id, data, selected }) {
  const amplitude = data?.amplitude || '10V'
  const frequency = data?.frequency || '100kHz'
  const samples = data?.samples || '1024'
  const waveform = data?.waveformType || 'custom'
  
  return (
    <div className={`signal-generator awg ${selected ? 'selected' : ''}`}>
      <Handle type="target" position={Position.Left} />
      
      <div className="generator-symbol">
        <svg width="60" height="60" viewBox="0 0 60 60">
          <rect x="5" y="10" width="50" height="40" fill="#ecfdf5" stroke="#10b981" strokeWidth="2" rx="4"/>
          <path 
            d="M10,30 Q15,25 18,30 L22,20 L25,40 Q30,25 35,30 L38,35 Q42,20 45,30 L50,25" 
            fill="none" 
            stroke="#10b981" 
            strokeWidth="2"
          />
          <text x="30" y="58" textAnchor="middle" fontSize="8" fill="#10b981">AWG</text>
        </svg>
      </div>
      
      <div className="generator-label">
        <div className="generator-name">AWG</div>
        <div className="generator-params">
          <div className="param">{amplitude}</div>
          <div className="param">{frequency}</div>
          <div className="param">{samples} pts</div>
          <div className="param">{waveform}</div>
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

// Export presets for quick setup
export const SIGNAL_PRESETS = {
  ac60Hz: { voltage: '120V', frequency: '60Hz', phase: '0°' },
  ac50Hz: { voltage: '230V', frequency: '50Hz', phase: '0°' },
  dc5V: { voltage: '5V', current: '1A' },
  dc12V: { voltage: '12V', current: '2A' },
  dc24V: { voltage: '24V', current: '5A' },
  audio1kHz: { waveform: 'sine', amplitude: '1V', frequency: '1kHz', offset: '0V' },
  clock10MHz: { amplitude: '3.3V', frequency: '10MHz', dutyCycle: '50%', riseTime: '1ns' },
  pwm: { amplitude: '5V', frequency: '20kHz', dutyCycle: '25%', riseTime: '10ns' }
}