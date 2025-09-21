import React from 'react';
import BasicComponentNode from './BasicComponentNode';

export default function DiodeNode(props) {
  const svgContent = (
    <g>
      {/* Diode triangle and line */}
      <polygon
        points="35,15 50,8 50,22"
        stroke="currentColor"
        fill="currentColor"
        strokeWidth="2"
        opacity="0.8"
      />
      <line x1="50" y1="8" x2="50" y2="22" stroke="currentColor" strokeWidth="3"/>
      {/* Connection leads */}
      <line x1="0" y1="15" x2="35" y2="15" stroke="currentColor" strokeWidth="2"/>
      <line x1="50" y1="15" x2="80" y2="15" stroke="currentColor" strokeWidth="2"/>
      {/* LED light rays */}
      {props.data?.type === 'LED' && (
        <g opacity="0.7">
          <path d="M55,8 L60,3 M57,10 L62,5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M55,22 L60,27 M57,20 L62,25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </g>
      )}
    </g>
  );

  return (
    <BasicComponentNode
      {...props}
      className="diode-node"
      svgContent={svgContent}
    />
  );
}