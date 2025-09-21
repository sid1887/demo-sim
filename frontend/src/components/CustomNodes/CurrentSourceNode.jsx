import React from 'react';
import BasicComponentNode from './BasicComponentNode';

export default function CurrentSourceNode(props) {
  const svgContent = (
    <g>
      {/* IEEE Standard Current Source - Circle */}
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
      
      {/* Arrow indicating current direction */}
      <path
        d="M30,15 L50,15 M46,11 L50,15 L46,19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      
      {/* DC Current Source - No additional symbols needed */}
      {(!props.data?.sourceType || props.data.sourceType === 'DC') && (
        <text
          x="40"
          y="8"
          textAnchor="middle"
          fontSize="8"
          fill="currentColor"
          fontWeight="bold"
        >
          I
        </text>
      )}
      
      {/* AC Current Source - Sine wave behind arrow */}
      {props.data?.sourceType === 'AC' && (
        <>
          <path
            d="M32,22 Q36,19 40,22 T48,22"
            stroke="currentColor"
            fill="none"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity="0.7"
          />
          <text
            x="40"
            y="8"
            textAnchor="middle"
            fontSize="8"
            fill="currentColor"
            fontWeight="bold"
          >
            I~
          </text>
        </>
      )}
      
      {/* Controlled current source indicator */}
      {props.data?.controlled && (
        <polygon
          points="32,23 40,26 48,23"
          stroke="currentColor"
          fill="none"
          strokeWidth="1"
        />
      )}
    </g>
  );

  return (
    <BasicComponentNode
      {...props}
      className="current-source-node ieee-standard"
      svgContent={svgContent}
    />
  );
}