import React from 'react';
import { Handle, Position } from 'reactflow';
import { motion } from 'framer-motion';

export default function BasicComponentNode({ 
  id, 
  data, 
  children, 
  className = '', 
  svgContent,
  selected = false,
  style = {},
  handles = [
    { type: 'target', position: Position.Left, id: 'a' },
    { type: 'source', position: Position.Right, id: 'b' }
  ]
}) {
  const defaultStyle = {
    borderRadius: '16px',
    boxShadow: selected 
      ? '0 8px 25px -5px rgba(37, 99, 235, 0.25), 0 8px 10px -6px rgba(37, 99, 235, 0.1)' 
      : '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    border: selected ? '2px solid #2563EB' : '1px solid #E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: '12px',
    minWidth: '120px',
    minHeight: '80px',
    transition: 'all 0.2s ease-in-out',
    position: 'relative',
    ...style
  };

  return (
    <motion.div 
      className={`node ${className}`}
      style={defaultStyle}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      {handles.map((handle, index) => (
        <Handle
          key={index}
          type={handle.type}
          position={handle.position}
          id={handle.id}
          style={{
            background: '#16A34A',
            border: '2px solid #F6F8FA',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'all 0.2s ease-in-out'
          }}
          onMouseEnter={(e) => {
            e.target.style.width = '12px';
            e.target.style.height = '12px';
            e.target.style.background = '#15803D';
          }}
          onMouseLeave={(e) => {
            e.target.style.width = '8px';
            e.target.style.height = '8px';
            e.target.style.background = '#16A34A';
          }}
        />
      ))}
      
      <div className="component-content" style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center',
        gap: '8px'
      }}>
        {svgContent && (
          <svg 
            viewBox="0 0 80 30" 
            width="100" 
            height="50" 
            className="component-svg"
            style={{
              filter: selected ? 'drop-shadow(0 2px 4px rgba(37, 99, 235, 0.2))' : 'none'
            }}
          >
            {svgContent}
          </svg>
        )}
        {children}
      </div>
      
      <div className="label" style={{
        fontSize: '11px',
        fontWeight: '600',
        color: selected ? '#2563EB' : '#374151',
        textAlign: 'center',
        marginTop: '4px',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, sans-serif'
      }}>
        {data?.label || data?.type || 'Component'}
      </div>
      
      {data?.value && (
        <div className="component-value" style={{
          fontSize: '9px',
          fontWeight: '500',
          color: '#6B7280',
          textAlign: 'center',
          marginTop: '2px',
          fontFamily: 'Monaco, Consolas, monospace',
          backgroundColor: '#F3F4F6',
          padding: '2px 6px',
          borderRadius: '4px',
          display: 'inline-block'
        }}>
          {data.value}
        </div>
      )}

      {/* Selection indicator */}
      {selected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          style={{
            position: 'absolute',
            top: '-4px',
            right: '-4px',
            width: '12px',
            height: '12px',
            backgroundColor: '#2563EB',
            borderRadius: '50%',
            border: '2px solid #FFFFFF',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}
        />
      )}
    </motion.div>
  );
}