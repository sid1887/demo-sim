import React from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';

export default function GroundNode(props) {
  const svgContent = (
    <g>
      {/* Ground symbol */}
      <line x1="40" y1="5" x2="40" y2="15" stroke="currentColor" strokeWidth="2"/>
      <line x1="30" y1="15" x2="50" y2="15" stroke="currentColor" strokeWidth="3"/>
      <line x1="32" y1="18" x2="48" y2="18" stroke="currentColor" strokeWidth="2.5"/>
      <line x1="34" y1="21" x2="46" y2="21" stroke="currentColor" strokeWidth="2"/>
      <line x1="36" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="1.5"/>
      {/* Connection lead */}
      <line x1="40" y1="0" x2="40" y2="5" stroke="currentColor" strokeWidth="2"/>
    </g>
  );

  return (
    <motion.div 
      className="node ground-node"
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {/* Only one handle for ground - top connection */}
      <Handle
        type="target"
        position={Position.Top}
        id="gnd"
        style={{
          background: '#22c55e',
          border: '2px solid #ffffff',
          width: '12px',
          height: '12px'
        }}
      />
      
      <div className="component-content">
        <svg 
          viewBox="0 0 80 30" 
          width="80" 
          height="60" 
          className="component-svg"
        >
          {svgContent}
        </svg>
      </div>
      
      <div className="label">
        {props.data?.label || 'GND'}
      </div>
    </motion.div>
  );
}