import React from 'react';
import BasicComponentNode from './BasicComponentNode';

export default function ResistorNode(props) {
  const svgContent = (
    <g>
      {/* IEEE Standard Resistor - Rectangle symbol */}
      <rect
        x="20"
        y="10"
        width="40"
        height="10"
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
        rx="1"
      />
      {/* Connection leads */}
      <line x1="0" y1="15" x2="20" y2="15" stroke="currentColor" strokeWidth="2"/>
      <line x1="60" y1="15" x2="80" y2="15" stroke="currentColor" strokeWidth="2"/>
      
      {/* Value label positioning guide (invisible) */}
      <g className="value-label-guide">
        <circle cx="40" cy="5" r="1" fill="none" opacity="0"/>
      </g>
    </g>
  );

  return (
    <BasicComponentNode
      {...props}
      className="resistor-node ieee-standard"
      svgContent={svgContent}
    />
  );
}