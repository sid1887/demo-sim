import React, { useState } from 'react';
import { getBezierPath } from 'reactflow';

export default function WireEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data = {},
  style = {},
  markerEnd,
  selected = false
}) {
  const [isHovered, setIsHovered] = useState(false);

  // Enhanced Bézier path calculation with improved curvature
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    curvature: 0.15 // Smoother curves
  });

  // Determine current intensity for animation and styling
  const currentMagnitude = Math.abs(data.current || 0);
  const voltage = data.voltage || 0;
  
  const intensity = currentMagnitude > 0.1 ? 'high' : 
                   currentMagnitude > 0.01 ? 'medium' : 'low';

  // Animation speed based on current
  const animSpeed = currentMagnitude > 0.1 ? 0.8 : 
                   currentMagnitude > 0.01 ? 1.5 : 3.0;

  // Professional wire styling
  const wireColor = selected ? '#2563EB' : '#16A34A';
  const wireWidth = selected || isHovered ? 4 : 3;
  const glowIntensity = isHovered ? 0.8 : selected ? 0.6 : 0.3;

  return (
    <g 
      className={`wire-edge wire-current-${intensity} ${selected ? 'selected' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Glow effect layer */}
      <path
        d={edgePath}
        style={{
          stroke: wireColor,
          strokeWidth: wireWidth + 4,
          opacity: glowIntensity * 0.3,
          fill: 'none',
          filter: 'blur(2px)',
          transition: 'all 0.2s ease-in-out'
        }}
      />

      {/* Main wire path with professional styling */}
      <path
        id={id}
        d={edgePath}
        className="wire-path"
        style={{
          ...style,
          stroke: wireColor,
          strokeWidth: wireWidth,
          strokeLinecap: 'round',
          strokeLinejoin: 'round',
          fill: 'none',
          cursor: 'pointer',
          filter: selected || isHovered ? 
            `drop-shadow(0 0 ${glowIntensity * 8}px ${wireColor}40)` : 'none',
          transition: 'all 0.2s ease-in-out'
        }}
        markerEnd={markerEnd}
      />
      
      {/* Animated current flow overlay */}
      {currentMagnitude > 0.001 && (
        <path
          d={edgePath}
          className="wire-anim"
          style={{
            stroke: intensity === 'high' ? '#EF4444' : 
                   intensity === 'medium' ? '#F59E0B' : '#FFFFFF',
            strokeWidth: Math.max(1, Math.min(2, wireWidth - 1)),
            strokeLinecap: 'round',
            strokeDasharray: `${6} ${12}`,
            strokeDashoffset: 0,
            fill: 'none',
            opacity: 0.8,
            animation: `wire-flow ${animSpeed}s linear infinite`,
            transition: 'all 0.2s ease-in-out'
          }}
        />
      )}

      {/* Junction dots for enhanced visualization */}
      <circle
        cx={sourceX}
        cy={sourceY}
        r={selected || isHovered ? 3 : 2}
        fill={wireColor}
        stroke="#F6F8FA"
        strokeWidth="1"
        style={{
          transition: 'all 0.2s ease-in-out',
          filter: selected || isHovered ? 
            `drop-shadow(0 2px 4px ${wireColor}40)` : 'none'
        }}
      />
      <circle
        cx={targetX}
        cy={targetY}
        r={selected || isHovered ? 3 : 2}
        fill={wireColor}
        stroke="#F6F8FA"
        strokeWidth="1"
        style={{
          transition: 'all 0.2s ease-in-out',
          filter: selected || isHovered ? 
            `drop-shadow(0 2px 4px ${wireColor}40)` : 'none'
        }}
      />

      {/* Enhanced current/voltage label */}
      {(data.current || data.voltage) && (isHovered || selected) && (
        <foreignObject
          x={labelX - 40}
          y={labelY - 16}
          width="80"
          height="32"
          className="wire-label"
        >
          <div style={{ 
            padding: '4px 8px', 
            fontSize: '11px', 
            textAlign: 'center',
            borderRadius: '8px',
            background: 'rgba(255, 255, 255, 0.95)',
            color: '#374151',
            border: `1px solid ${wireColor}40`,
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
            backdropFilter: 'blur(8px)',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif',
            fontWeight: '500'
          }}>
            {data.current !== undefined && (
              <div style={{ color: '#16A34A', fontFamily: 'Monaco, Consolas, monospace' }}>
                {data.current.toFixed(3)}A
              </div>
            )}
            {data.voltage !== undefined && (
              <div style={{ color: '#2563EB', fontFamily: 'Monaco, Consolas, monospace' }}>
                {data.voltage.toFixed(2)}V
              </div>
            )}
          </div>
        </foreignObject>
      )}

      {/* Net ID indicator for debugging/development */}
      {data.netId && (selected || isHovered) && (
        <text
          x={labelX}
          y={labelY - 25}
          textAnchor="middle"
          style={{
            fontSize: '9px',
            fill: '#6B7280',
            fontFamily: 'Monaco, Consolas, monospace',
            fontWeight: '500'
          }}
        >
          {data.netId}
        </text>
      )}
    </g>
  );
}