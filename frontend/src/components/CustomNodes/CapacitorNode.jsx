import React from 'react';
import BasicComponentNode from './BasicComponentNode';

export default function CapacitorNode(props) {
  const svgContent = (
    <g>
      {/* IEEE Standard Capacitor - Parallel plates with proper spacing */}
      <line x1="36" y1="5" x2="36" y2="25" stroke="currentColor" strokeWidth="2.5"/>
      <line x1="44" y1="5" x2="44" y2="25" stroke="currentColor" strokeWidth="2.5"/>
      
      {/* Connection leads */}
      <line x1="0" y1="15" x2="36" y2="15" stroke="currentColor" strokeWidth="2"/>
      <line x1="44" y1="15" x2="80" y2="15" stroke="currentColor" strokeWidth="2"/>
      
      {/* Polarity indicators for electrolytic capacitors */}
      {props.data?.polarized && (
        <>
          <circle cx="28" cy="8" r="3" fill="none" stroke="currentColor" strokeWidth="1"/>
          <text x="26.5" y="10" fontSize="6" fill="currentColor" fontWeight="bold">+</text>
          <text x="48" y="10" fontSize="8" fill="currentColor">−</text>
        </>
      )}
      
      {/* Variable capacitor indicator */}
      {props.data?.variable && (
        <>
          <line
            x1="25"
            y1="28"
            x2="55"
            y2="28"
            stroke="currentColor"
            strokeWidth="1.5"
            markerEnd="url(#arrowhead)"
          />
          <text x="38" y="37" fontSize="6" fill="currentColor" textAnchor="middle">VAR</text>
        </>
      )}
    </g>
  );

  return (
    <BasicComponentNode
      {...props}
      className="capacitor-node ieee-standard"
      svgContent={svgContent}
    />
  );
}