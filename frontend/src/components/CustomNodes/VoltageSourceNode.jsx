import React from 'react';
import BasicComponentNode from './BasicComponentNode';

export default function VoltageSourceNode(props) {
  const svgContent = (
    <g>
      {/* Voltage source circle */}
      <circle cx="40" cy="15" r="18" stroke="currentColor" strokeWidth="2.5" fill="none"/>
      {/* Plus and minus signs */}
      <text x="32" y="19" fontSize="12" fill="currentColor" fontWeight="bold">+</text>
      <text x="46" y="19" fontSize="12" fill="currentColor" fontWeight="bold">-</text>
      {/* Connection leads */}
      <line x1="0" y1="15" x2="22" y2="15" stroke="currentColor" strokeWidth="2"/>
      <line x1="58" y1="15" x2="80" y2="15" stroke="currentColor" strokeWidth="2"/>
      {/* DC/AC indicator */}
      {props.data?.sourceType === 'AC' && (
        <path
          d="M35,11 Q40,7 45,11 Q40,19 35,15"
          stroke="currentColor"
          fill="none"
          strokeWidth="1.5"
        />
      )}
    </g>
  );

  return (
    <BasicComponentNode
      {...props}
      className="voltage-source-node"
      svgContent={svgContent}
    />
  );
}