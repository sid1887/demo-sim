import React from 'react';
import BasicComponentNode from './BasicComponentNode';

export default function CapacitorNode(props) {
  const svgContent = (
    <g>
      {/* Capacitor plates */}
      <line x1="35" y1="5" x2="35" y2="25" stroke="currentColor" strokeWidth="3"/>
      <line x1="45" y1="5" x2="45" y2="25" stroke="currentColor" strokeWidth="3"/>
      {/* Connection leads */}
      <line x1="0" y1="15" x2="35" y2="15" stroke="currentColor" strokeWidth="2"/>
      <line x1="45" y1="15" x2="80" y2="15" stroke="currentColor" strokeWidth="2"/>
      {/* Polarity indicator (for electrolytic) */}
      {props.data?.polarized && (
        <>
          <text x="30" y="12" fontSize="8" fill="currentColor">+</text>
          <text x="48" y="12" fontSize="8" fill="currentColor">-</text>
        </>
      )}
    </g>
  );

  return (
    <BasicComponentNode
      {...props}
      className="capacitor-node"
      svgContent={svgContent}
    />
  );
}