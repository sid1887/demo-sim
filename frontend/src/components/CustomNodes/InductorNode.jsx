import React from 'react';
import BasicComponentNode from './BasicComponentNode';

export default function InductorNode(props) {
  const svgContent = (
    <g>
      {/* IEEE Standard Inductor - Precise coil arcs */}
      <path
        d="M15,15 A5,5 0 0,1 25,15 A5,5 0 0,1 35,15 A5,5 0 0,1 45,15 A5,5 0 0,1 55,15 A5,5 0 0,1 65,15"
        stroke="currentColor"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {/* Connection leads */}
      <line x1="0" y1="15" x2="15" y2="15" stroke="currentColor" strokeWidth="2"/>
      <line x1="65" y1="15" x2="80" y2="15" stroke="currentColor" strokeWidth="2"/>
      
      {/* Core indicator for ferrite/iron core inductors */}
      {props.data?.hasCore && (
        <>
          <line x1="20" y1="8" x2="60" y2="8" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="20" y1="22" x2="60" y2="22" stroke="currentColor" strokeWidth="1.5"/>
        </>
      )}
      
      {/* Variable inductor indicator */}
      {props.data?.variable && (
        <line
          x1="25"
          y1="25"
          x2="55"
          y2="5"
          stroke="currentColor"
          strokeWidth="1.5"
          markerEnd="url(#arrowhead)"
        />
      )}
    </g>
  );

  return (
    <BasicComponentNode
      {...props}
      className="inductor-node ieee-standard"
      svgContent={svgContent}
    />
  );
}