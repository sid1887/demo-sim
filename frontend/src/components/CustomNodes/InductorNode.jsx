import React from 'react';
import BasicComponentNode from './BasicComponentNode';

export default function InductorNode(props) {
  const svgContent = (
    <g>
      {/* Inductor coil pattern */}
      <path
        d="M10,15 Q15,5 20,15 Q25,25 30,15 Q35,5 40,15 Q45,25 50,15 Q55,5 60,15 Q65,25 70,15"
        stroke="currentColor"
        fill="none"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Connection leads */}
      <line x1="0" y1="15" x2="10" y2="15" stroke="currentColor" strokeWidth="2"/>
      <line x1="70" y1="15" x2="80" y2="15" stroke="currentColor" strokeWidth="2"/>
      {/* Core indicator for ferrite core inductors */}
      {props.data?.hasCore && (
        <>
          <line x1="15" y1="8" x2="65" y2="8" stroke="currentColor" strokeWidth="1.5"/>
          <line x1="15" y1="22" x2="65" y2="22" stroke="currentColor" strokeWidth="1.5"/>
        </>
      )}
    </g>
  );

  return (
    <BasicComponentNode
      {...props}
      className="inductor-node"
      svgContent={svgContent}
    />
  );
}