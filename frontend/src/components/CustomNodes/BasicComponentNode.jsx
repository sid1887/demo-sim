import React from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';

export default function BasicComponentNode({ 
  id, 
  data, 
  children, 
  className = '', 
  svgContent,
  handles = [
    { type: 'target', position: Position.Left, id: 'a' },
    { type: 'source', position: Position.Right, id: 'b' }
  ]
}) {
  return (
    <motion.div 
      className={`node ${className}`}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {handles.map((handle, index) => (
        <Handle
          key={index}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          style={{
            background: '#22c55e',
            border: '2px solid #ffffff',
            width: '12px',
            height: '12px'
          }}
        />
      ))}
      
      <div className="component-content">
        {svgContent && (
          <svg 
            viewBox="0 0 80 30" 
            width="100" 
            height="50" 
            className="component-svg"
          >
            {svgContent}
          </svg>
        )}
        {children}
      </div>
      
      <div className="label">
        {data?.label || data?.type || 'Component'}
      </div>
      
      {data?.value && (
        <div className="component-value">
          {data.value}
        </div>
      )}
    </motion.div>
  );
}