import React, { useState, useCallback } from 'react'
import { Handle, Position } from 'reactflow'
import './AdjustableComponents.css'

// Component value parser and formatter
export const parseValue = (value) => {
  if (!value || value === '') return { number: 1, unit: '', display: '1' }
  
  const str = value.toString().toLowerCase()
  const match = str.match(/^(\d*\.?\d+)\s*([a-z]*)$/)
  
  if (!match) return { number: 1, unit: '', display: '1' }
  
  const number = parseFloat(match[1])
  let unit = match[2] || ''
  
  // Handle common abbreviations
  const unitMap = {
    'k': 'k', 'kohm': 'k', 'kohms': 'k',
    'm': 'M', 'meg': 'M', 'mohm': 'M', 'mohms': 'M',
    'g': 'G', 'gohm': 'G', 'gohms': 'G',
    'uf': 'µF', 'microf': 'µF', 'micro': 'µF',
    'nf': 'nF', 'nanof': 'nF', 'nano': 'nF',
    'pf': 'pF', 'picof': 'pF', 'pico': 'pF',
    'mf': 'mF', 'millif': 'mF', 'milli': 'mF',
    'uh': 'µH', 'microh': 'µH',
    'nh': 'nH', 'nanoh': 'nH',
    'mh': 'mH', 'millih': 'mH',
    'h': 'H', 'henry': 'H'
  }
  
  unit = unitMap[unit] || unit
  
  return { 
    number, 
    unit, 
    display: `${number}${unit}` 
  }
}

export const formatValue = (number, unit) => {
  if (number >= 1e9) {
    return `${(number / 1e9).toFixed(2).replace(/\.?0+$/, '')}G${unit}`
  } else if (number >= 1e6) {
    return `${(number / 1e6).toFixed(2).replace(/\.?0+$/, '')}M${unit}`
  } else if (number >= 1e3) {
    return `${(number / 1e3).toFixed(2).replace(/\.?0+$/, '')}k${unit}`
  } else if (number >= 1) {
    return `${number.toFixed(2).replace(/\.?0+$/, '')}${unit}`
  } else if (number >= 1e-3) {
    return `${(number * 1e3).toFixed(2).replace(/\.?0+$/, '')}m${unit}`
  } else if (number >= 1e-6) {
    return `${(number * 1e6).toFixed(2).replace(/\.?0+$/, '')}µ${unit}`
  } else if (number >= 1e-9) {
    return `${(number * 1e9).toFixed(2).replace(/\.?0+$/, '')}n${unit}`
  } else {
    return `${(number * 1e12).toFixed(2).replace(/\.?0+$/, '')}p${unit}`
  }
}

// Base adjustable component
export function AdjustableComponent({ 
  id, 
  data, 
  selected, 
  children, 
  onValueChange,
  defaultValue = '1k',
  unitSymbol = 'Ω',
  title = 'Component'
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(data.value || defaultValue)
  
  const handleDoubleClick = useCallback((e) => {
    e.stopPropagation()
    setIsEditing(true)
    setEditValue(data.value || defaultValue)
  }, [data.value, defaultValue])
  
  const handleSubmit = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsEditing(false)
    
    const parsed = parseValue(editValue)
    const newValue = parsed.display || defaultValue
    
    if (onValueChange) {
      onValueChange(id, newValue)
    }
  }, [editValue, onValueChange, id, defaultValue])
  
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      setIsEditing(false)
      setEditValue(data.value || defaultValue)
    }
    e.stopPropagation()
  }, [data.value, defaultValue])

  return (
    <div 
      className={`adjustable-component ${selected ? 'selected' : ''}`}
      onDoubleClick={handleDoubleClick}
    >
      <Handle type="target" position={Position.Left} />
      
      <div className="component-body">
        {children}
      </div>
      
      <div className="component-label">
        <div className="component-name">{data.label || title}</div>
        <div className="component-value">
          {isEditing ? (
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleSubmit}
                onKeyDown={handleKeyDown}
                className="value-editor"
                autoFocus
                placeholder={defaultValue}
              />
            </form>
          ) : (
            <span 
              className="value-display"
              title={`Double-click to edit ${title} value`}
            >
              {data.value || defaultValue}
            </span>
          )}
        </div>
      </div>
      
      <Handle type="source" position={Position.Right} />
    </div>
  )
}

// Adjustable Resistor
export function AdjustableResistor(props) {
  return (
    <AdjustableComponent
      {...props}
      defaultValue="1kΩ"
      unitSymbol="Ω"
      title="Resistor"
    >
      <div className="resistor-symbol">
        <svg width="60" height="24" viewBox="0 0 60 24">
          <rect x="12" y="6" width="36" height="12" fill="white" stroke="#2563eb" strokeWidth="2" rx="2"/>
          <line x1="0" y1="12" x2="12" y2="12" stroke="#2563eb" strokeWidth="2"/>
          <line x1="48" y1="12" x2="60" y2="12" stroke="#2563eb" strokeWidth="2"/>
        </svg>
      </div>
    </AdjustableComponent>
  )
}

// Adjustable Capacitor
export function AdjustableCapacitor(props) {
  return (
    <AdjustableComponent
      {...props}
      defaultValue="1µF"
      unitSymbol="F"
      title="Capacitor"
    >
      <div className="capacitor-symbol">
        <svg width="60" height="24" viewBox="0 0 60 24">
          <line x1="0" y1="12" x2="25" y2="12" stroke="#2563eb" strokeWidth="2"/>
          <line x1="25" y1="4" x2="25" y2="20" stroke="#2563eb" strokeWidth="3"/>
          <line x1="35" y1="4" x2="35" y2="20" stroke="#2563eb" strokeWidth="3"/>
          <line x1="35" y1="12" x2="60" y2="12" stroke="#2563eb" strokeWidth="2"/>
        </svg>
      </div>
    </AdjustableComponent>
  )
}

// Adjustable Inductor
export function AdjustableInductor(props) {
  return (
    <AdjustableComponent
      {...props}
      defaultValue="1mH"
      unitSymbol="H"
      title="Inductor"
    >
      <div className="inductor-symbol">
        <svg width="60" height="24" viewBox="0 0 60 24">
          <path 
            d="M0,12 Q10,4 20,12 T40,12 T60,12" 
            fill="none" 
            stroke="#2563eb" 
            strokeWidth="2"
          />
          <path 
            d="M5,8 Q10,4 15,8 Q20,4 25,8 Q30,4 35,8 Q40,4 45,8 Q50,4 55,8" 
            fill="none" 
            stroke="#2563eb" 
            strokeWidth="1.5"
          />
        </svg>
      </div>
    </AdjustableComponent>
  )
}

// Adjustable Voltage Source
export function AdjustableVoltageSource(props) {
  return (
    <AdjustableComponent
      {...props}
      defaultValue="5V"
      unitSymbol="V"
      title="Voltage Source"
    >
      <div className="voltage-source-symbol">
        <svg width="60" height="40" viewBox="0 0 60 40">
          <circle cx="30" cy="20" r="16" fill="white" stroke="#dc2626" strokeWidth="2"/>
          <line x1="0" y1="20" x2="14" y2="20" stroke="#dc2626" strokeWidth="2"/>
          <line x1="46" y1="20" x2="60" y2="20" stroke="#dc2626" strokeWidth="2"/>
          <text x="30" y="25" textAnchor="middle" fontSize="14" fill="#dc2626">+</text>
        </svg>
      </div>
    </AdjustableComponent>
  )
}

// Quick value presets
export const RESISTANCE_PRESETS = [
  '1Ω', '10Ω', '100Ω', '1kΩ', '10kΩ', '100kΩ', '1MΩ'
]

export const CAPACITANCE_PRESETS = [
  '1pF', '10pF', '100pF', '1nF', '10nF', '100nF', '1µF', '10µF', '100µF'
]

export const INDUCTANCE_PRESETS = [
  '1µH', '10µH', '100µH', '1mH', '10mH', '100mH', '1H'
]

export const VOLTAGE_PRESETS = [
  '1.5V', '3.3V', '5V', '9V', '12V', '24V', '120V', '240V'
]