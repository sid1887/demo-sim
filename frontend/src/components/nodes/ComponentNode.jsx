import React from 'react'
import { Handle, Position } from 'reactflow'
import { motion } from 'framer-motion'
import { 
  Square, 
  Circle, 
  Zap, 
  Triangle,
  Minus
} from 'lucide-react'

const componentIcons = {
  resistor: Square,
  capacitor: Circle,
  inductor: Circle,
  voltage_source: Zap,
  current_source: Zap,
  diode: Triangle,
  ground: Minus,
}

const componentColors = {
  resistor: 'border-orange-400 bg-orange-50',
  capacitor: 'border-blue-400 bg-blue-50',
  inductor: 'border-green-400 bg-green-50',
  voltage_source: 'border-red-400 bg-red-50',
  current_source: 'border-purple-400 bg-purple-50',
  diode: 'border-yellow-400 bg-yellow-50',
  ground: 'border-gray-400 bg-gray-50',
}

const componentTextColors = {
  resistor: 'text-orange-700',
  capacitor: 'text-blue-700',
  inductor: 'text-green-700',
  voltage_source: 'text-red-700',
  current_source: 'text-purple-700',
  diode: 'text-yellow-700',
  ground: 'text-gray-700',
}

export default function ComponentNode({ data, isConnectable }) {
  const Icon = componentIcons[data.componentType] || Square
  const colorClass = componentColors[data.componentType] || 'border-gray-400 bg-gray-50'
  const textColorClass = componentTextColors[data.componentType] || 'text-gray-700'

  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`relative px-4 py-3 border-2 rounded-lg shadow-md ${colorClass} min-w-[120px]`}
    >
      {/* Left Connection Point */}
      <Handle
        type="source"
        position={Position.Left}
        id="left"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500 border-2 border-white shadow-md"
      />

      {/* Component Content */}
      <div className="flex flex-col items-center space-y-1">
        <Icon className={`w-5 h-5 ${textColorClass}`} />
        <div className={`text-xs font-bold ${textColorClass}`}>
          {data.label}
        </div>
        {data.value && (
          <div className={`text-xs ${textColorClass} opacity-80`}>
            {data.value}
          </div>
        )}
      </div>

      {/* Right Connection Point */}
      <Handle
        type="target"
        position={Position.Right}
        id="right"
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500 border-2 border-white shadow-md"
      />

      {/* Ground node has bottom connection instead of right */}
      {data.componentType === 'ground' && (
        <Handle
          type="target"
          position={Position.Bottom}
          id="bottom"
          isConnectable={isConnectable}
          className="w-3 h-3 bg-blue-500 border-2 border-white shadow-md"
        />
      )}
    </motion.div>
  )
}