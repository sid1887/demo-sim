import React from 'react';
import BasicComponentNode from './BasicComponentNode';

export default function DiodeNode(props) {
  const svgContent = (
    <g>
      {/* IEEE Standard Diode - Triangle (anode) and line (cathode) */}
      <polygon
        points="30,15 45,8 45,22"
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {/* Cathode line */}
      <line x1="45" y1="8" x2="45" y2="22" stroke="currentColor" strokeWidth="2.5"/>
      
      {/* Connection leads */}
      <line x1="0" y1="15" x2="30" y2="15" stroke="currentColor" strokeWidth="2"/>
      <line x1="45" y1="15" x2="80" y2="15" stroke="currentColor" strokeWidth="2"/>
      
      {/* Zener diode indicator */}
      {props.data?.type === 'ZENER' && (
        <>
          <line x1="42" y1="8" x2="48" y2="8" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="42" y1="22" x2="48" y2="22" stroke="currentColor" strokeWidth="1.5"/>
        </>
      )}
      
      {/* LED light emission indicators */}
      {props.data?.type === 'LED' && (
        <g opacity="0.8">
          <path 
            d="M52,6 L57,1 M54,8 L59,3" 
            stroke="currentColor" 
            strokeWidth="1.2" 
            strokeLinecap="round"
            markerEnd="url(#arrowhead-small)"
          />
          <path 
            d="M52,24 L57,29 M54,22 L59,27" 
            stroke="currentColor" 
            strokeWidth="1.2" 
            strokeLinecap="round"
            markerEnd="url(#arrowhead-small)"
          />
        </g>
      )}
      
      {/* Schottky diode indicator */}
      {props.data?.type === 'SCHOTTKY' && (
        <>
          <line x1="42" y1="8" x2="45" y2="8" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="45" y1="22" x2="48" y2="22" stroke="currentColor" strokeWidth="1.5"/>
        </>
      )}
    </g>
  );

  return (
    <BasicComponentNode
      {...props}
      className="diode-node ieee-standard"
      svgContent={svgContent}
    />
  );
}