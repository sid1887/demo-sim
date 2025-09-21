import React from 'react';
import BasicComponentNode from './BasicComponentNode';

export default function CurrentSourceNode(props) {
  const svgContent = (
    <g>
      {/* Current source circle */}
      <circle cx="40" cy="15" r="18" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      {/* Arrow indicating current direction */}
      <path
        d="M32,15 L48,15 M44,11 L48,15 L44,19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Connection leads */}
      <line x1="0" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="2"/>
      <line x1="58" y1="15" x2="80" y2="15" stroke="currentColor" strokeWidth="2"/>
    </g>
  );

  return (
    <BasicComponentNode
      {...props}
      className="current-source-node"
      svgContent={svgContent}
    />
  );
}