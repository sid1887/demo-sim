import React from 'react';
import BasicComponentNode from './BasicComponentNode';

export default function CurrentSourceNode(props) {
  const { selected, data } = props;
  
  const svgContent = (
    <g>
      {/* Current source circle with professional styling */}
      <circle 
        cx="40" 
        cy="15" 
        r="18" 
        stroke={selected ? "#2563EB" : "#475569"} 
        strokeWidth="2.5" 
        fill={selected ? "#EBF4FF" : "#F8FAFC"}
        className="transition-colors duration-200"
      />
      
      {/* Inner circle for depth */}
      <circle 
        cx="40" 
        cy="15" 
        r="14" 
        stroke={selected ? "#3B82F6" : "#64748B"} 
        strokeWidth="1.5" 
        fill="none"
        opacity="0.6"
      />
      
      {/* Arrow indicating current direction with enhanced styling */}
      <path
        d="M30,15 L50,15 M46,11 L50,15 L46,19"
        stroke={selected ? "#2563EB" : "#1E293B"}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* Current symbol "I" */}
      <text
        x="40"
        y="8"
        textAnchor="middle"
        className="text-xs font-semibold"
        fill={selected ? "#2563EB" : "#374151"}
      >
        I
      </text>
      
      {/* Connection leads with improved styling */}
      <line 
        x1="0" 
        y1="15" 
        x2="22" 
        y2="15" 
        stroke="#16A34A" 
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line 
        x1="58" 
        y1="15" 
        x2="80" 
        y2="15" 
        stroke="#16A34A" 
        strokeWidth="3"
        strokeLinecap="round"
      />
      
      {/* Connection points (8px circles as specified) */}
      <circle 
        cx="22" 
        cy="15" 
        r="4" 
        fill="#16A34A"
        stroke="#F6F8FA"
        strokeWidth="1"
        className="connector-point"
      />
      <circle 
        cx="58" 
        cy="15" 
        r="4" 
        fill="#16A34A"
        stroke="#F6F8FA"
        strokeWidth="1"
        className="connector-point"
      />
    </g>
  );

  return (
    <BasicComponentNode
      {...props}
      className={`current-source-node ${selected ? 'selected' : ''}`}
      svgContent={svgContent}
      style={{
        borderRadius: '16px',
        boxShadow: selected 
          ? '0 8px 25px -5px rgba(37, 99, 235, 0.25), 0 8px 10px -6px rgba(37, 99, 235, 0.1)' 
          : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
        border: selected ? '2px solid #2563EB' : '1px solid #E2E8F0',
        backgroundColor: '#FFFFFF',
        padding: '12px',
        transition: 'all 0.2s ease-in-out'
      }}
    />
  );
}