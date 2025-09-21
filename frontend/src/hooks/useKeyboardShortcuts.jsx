// Keyboard shortcuts hook for CircuitSim
import React from 'react';
import { useEffect, useCallback } from 'react';

const SHORTCUTS = {
  'v': 'select',
  'w': 'wire', 
  'p': 'probe',
  's': 'simulate',
  'r': 'resistor',
  'c': 'capacitor',
  'l': 'inductor',
  'd': 'diode',
  'g': 'ground',
  '/': 'search',
  '?': 'help',
  'Escape': 'cancel',
  ' ': 'pan'
};

export const useKeyboardShortcuts = (handlers) => {
  const handleKeyDown = useCallback((event) => {
    // Skip if user is typing in input fields
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName)) {
      return;
    }

    const key = event.key;
    const isCtrl = event.ctrlKey || event.metaKey;
    const isShift = event.shiftKey;
    const isAlt = event.altKey;

    // Handle special combinations first
    if (isCtrl && key === 'z' && !isShift) {
      event.preventDefault();
      handlers.onUndo?.();
      return;
    }

    if (isCtrl && key === 'z' && isShift) {
      event.preventDefault();
      handlers.onRedo?.();
      return;
    }

    if (isCtrl && key === 's') {
      event.preventDefault();
      handlers.onSave?.();
      return;
    }

    // Handle single key shortcuts
    const action = SHORTCUTS[key];
    if (action && handlers[`on${action.charAt(0).toUpperCase()}${action.slice(1)}`]) {
      event.preventDefault();
      handlers[`on${action.charAt(0).toUpperCase()}${action.slice(1)}`]();
    }

    // Handle modifier states
    if (isAlt) {
      handlers.onAltHold?.(true);
    }

    if (key === ' ') {
      event.preventDefault();
      handlers.onPanToggle?.();
    }
  }, [handlers]);

  const handleKeyUp = useCallback((event) => {
    if (event.altKey === false) {
      handlers.onAltHold?.(false);
    }
  }, [handlers]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);
};

// Keyboard shortcuts overlay component
export const ShortcutsHelp = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const shortcuts = [
    { key: 'V', action: 'Select Tool' },
    { key: 'W', action: 'Wire Tool' },
    { key: 'R', action: 'Add Resistor' },
    { key: 'C', action: 'Add Capacitor' },
    { key: 'L', action: 'Add Inductor' },
    { key: 'D', action: 'Add Diode' },
    { key: 'G', action: 'Add Ground' },
    { key: 'S', action: 'Run Simulation' },
    { key: 'Space', action: 'Pan Mode' },
    { key: 'Alt', action: 'Hold: Disable Snap' },
    { key: 'Ctrl+Z', action: 'Undo' },
    { key: 'Ctrl+Shift+Z', action: 'Redo' },
    { key: 'Ctrl+S', action: 'Save Project' },
    { key: '/', action: 'Search Components' },
    { key: '?', action: 'Show This Help' },
    { key: 'Esc', action: 'Cancel Action' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Keyboard Shortcuts</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {shortcuts.map(({ key, action }) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-sm text-gray-600">{action}</span>
              <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                {key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};