import React from 'react';
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
  markerEnd
}) {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  // Determine current intensity for animation speed
  const currentMagnitude = Math.abs(data.current || 0);
  const intensity = currentMagnitude > 0.1 ? 'high' : 
                   currentMagnitude > 0.01 ? 'medium' : 'low';

  // Animation speed based on current
  const animSpeed = currentMagnitude > 0.1 ? 0.5 : 
                   currentMagnitude > 0.01 ? 1.0 : 2.0;

  return (
    <g className={`wire-edge wire-current-${intensity}`}>
      {/* Main wire path */}
      <path
        id={id}
        d={edgePath}
        className="wire-path"
        style={{
          ...style,
          stroke: data.voltage > 5 ? '#ef4444' : 
                 data.voltage > 1 ? '#f59e0b' : '#22c55e',
          strokeWidth: Math.max(2, Math.min(6, 2 + currentMagnitude * 2))
        }}
        markerEnd={markerEnd}
      />
      
      {/* Animated current flow overlay */}
      {currentMagnitude > 0.001 && (
        <path
          d={edgePath}
          className="wire-anim"
          style={{
            stroke: intensity === 'high' ? '#ef4444' : 
                   intensity === 'medium' ? '#f59e0b' : '#ffffff',
            strokeWidth: Math.max(1, Math.min(3, 1 + currentMagnitude)),
            strokeDasharray: `${8} ${8}`,
            animationDuration: `${animSpeed}s`
          }}
        />
      )}

      {/* Current/Voltage label */}
      {(data.current || data.voltage) && (
        <foreignObject
          x={labelX - 30}
          y={labelY - 12}
          width="60"
          height="24"
          className="wire-label"
        >
          <div className="glass" style={{ 
            padding: '2px 6px', 
            fontSize: '10px', 
            textAlign: 'center',
            borderRadius: '4px',
            background: 'rgba(0,0,0,0.7)',
            color: '#ffffff',
            border: '1px solid rgba(34, 197, 94, 0.3)'
          }}>
            {data.current !== undefined && `${data.current.toFixed(3)}A`}
            {data.voltage !== undefined && ` ${data.voltage.toFixed(2)}V`}
          </div>
        </foreignObject>
      )}
    </g>
  );
}