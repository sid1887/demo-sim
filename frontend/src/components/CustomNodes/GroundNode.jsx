import React from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';

export default function GroundNode(props) {
  const svgContent = (
    <g>
      {/* IEEE Standard Ground Symbol */}
      <line x1="40" y1="5" x2="40" y2="15" stroke="currentColor" strokeWidth="2"/>
      
      {/* Ground symbol - decreasing horizontal lines */}
      <line x1="28" y1="15" x2="52" y2="15" stroke="currentColor" strokeWidth="2.5"/>
      <line x1="31" y1="18" x2="49" y2="18" stroke="currentColor" strokeWidth="2"/>
      <line x1="34" y1="21" x2="46" y2="21" stroke="currentColor" strokeWidth="1.8"/>
      <line x1="36" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="1.5"/>
      <line x1="38" y1="27" x2="42" y2="27" stroke="currentColor" strokeWidth="1.2"/>
      
      {/* Connection lead */}
      <line x1="40" y1="0" x2="40" y2="5" stroke="currentColor" strokeWidth="2"/>
      
      {/* Earth ground indicator (if specified) */}
      {props.data?.type === 'EARTH' && (
        <circle 
          cx="40" 
          cy="30" 
          r="2" 
          fill="currentColor" 
          opacity="0.6"
        />
      )}
      
      {/* Chassis ground indicator */}
      {props.data?.type === 'CHASSIS' && (
        <polygon
          points="35,24 40,30 45,24"
          stroke="currentColor"
          fill="none"
          strokeWidth="1.5"
        />
      )}
    </g>
  );

  return (
    <motion.div 
      className="node ground-node ieee-standard"
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
          viewBox="0 0 80 35" 
          width="80" 
          height="70" 
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