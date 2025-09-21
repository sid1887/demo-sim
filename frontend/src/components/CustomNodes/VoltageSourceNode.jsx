import React from 'react';
import BasicComponentNode from './BasicComponentNode';

export default function VoltageSourceNode(props) {
  const svgContent = (
    <g>
      {/* IEEE Standard Voltage Source - Circle */}
      <circle 
        cx="40" 
        cy="15" 
        r="16" 
        stroke="currentColor" 
        strokeWidth="2" 
        fill="none"
      />
      
      {/* Connection leads */}
      <line x1="0" y1="15" x2="24" y2="15" stroke="currentColor" strokeWidth="2"/>
      <line x1="56" y1="15" x2="80" y2="15" stroke="currentColor" strokeWidth="2"/>
      
      {/* DC Source - Plus and minus signs */}
      {(!props.data?.sourceType || props.data.sourceType === 'DC') && (
        <>
          <text x="33" y="19" fontSize="10" fill="currentColor" fontWeight="bold" textAnchor="middle">+</text>
          <text x="47" y="19" fontSize="12" fill="currentColor" fontWeight="bold" textAnchor="middle">−</text>
        </>
      )}
      
      {/* AC Source - Sine wave */}
      {props.data?.sourceType === 'AC' && (
        <path
          d="M32,15 Q36,10 40,15 T48,15"
          stroke="currentColor"
          fill="none"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
      )}
      
      {/* Current Source - Arrow inside circle */}
      {props.data?.sourceType === 'CURRENT' && (
        <path
          d="M32,15 L45,15 M42,12 L45,15 L42,18"
          stroke="currentColor"
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      
      {/* Pulse Source - Square wave */}
      {props.data?.sourceType === 'PULSE' && (
        <path
          d="M32,18 L35,18 L35,12 L40,12 L40,18 L43,18 L43,12 L48,12"
          stroke="currentColor"
          fill="none"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      )}
    </g>
  );

  return (
    <BasicComponentNode
      {...props}
      className="voltage-source-node ieee-standard"
      svgContent={svgContent}
    />
  );
}