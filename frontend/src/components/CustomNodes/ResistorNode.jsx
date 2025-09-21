import React from 'react';
import BasicComponentNode from './BasicComponentNode';

export default function ResistorNode(props) {
  const svgContent = (
    <g>
      {/* Resistor zig-zag pattern */}
      <path
        d="M5,15 L15,15 L18,8 L24,22 L30,8 L36,22 L42,8 L48,22 L54,8 L57,15 L75,15"
        stroke="currentColor"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Connection leads */}
      <line x1="0" y1="15" x2="5" y2="15" stroke="currentColor" strokeWidth="2"/>
      <line x1="75" y1="15" x2="80" y2="15" stroke="currentColor" strokeWidth="2"/>
    </g>
  );

  return (
    <BasicComponentNode
      {...props}
      className="resistor-node"
      svgContent={svgContent}
    />
  );
}