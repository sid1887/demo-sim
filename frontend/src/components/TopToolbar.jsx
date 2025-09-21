import React, { useState } from 'react';
import { 
  Play, 
  Square, 
  RotateCcw, 
  ZoomIn, 
  ZoomOut, 
  Save, 
  FolderOpen, 
  FileText,
  Settings,
  ChevronDown
} from 'lucide-react';

const MENU_ITEMS = [
  {
    name: 'File',
    items: [
      { name: 'New Circuit', shortcut: 'Ctrl+N' },
      { name: 'Open...', shortcut: 'Ctrl+O' },
      { name: 'Save', shortcut: 'Ctrl+S' },
      { name: 'Save As...', shortcut: 'Ctrl+Shift+S' },
      { separator: true },
      { name: 'Export...', shortcut: 'Ctrl+E' },
      { name: 'Import...', shortcut: 'Ctrl+I' },
    ]
  },
  {
    name: 'Edit',
    items: [
      { name: 'Undo', shortcut: 'Ctrl+Z' },
      { name: 'Redo', shortcut: 'Ctrl+Y' },
      { separator: true },
      { name: 'Cut', shortcut: 'Ctrl+X' },
      { name: 'Copy', shortcut: 'Ctrl+C' },
      { name: 'Paste', shortcut: 'Ctrl+V' },
      { name: 'Delete', shortcut: 'Del' },
      { separator: true },
      { name: 'Select All', shortcut: 'Ctrl+A' },
    ]
  },
  {
    name: 'View',
    items: [
      { name: 'Zoom In', shortcut: 'Ctrl++' },
      { name: 'Zoom Out', shortcut: 'Ctrl+-' },
      { name: 'Zoom to Fit', shortcut: 'Ctrl+0' },
      { name: 'Actual Size', shortcut: 'Ctrl+1' },
      { separator: true },
      { name: 'Grid', shortcut: 'Ctrl+G', toggle: true },
      { name: 'Snap to Grid', shortcut: 'Ctrl+Shift+G', toggle: true },
    ]
  },
  {
    name: 'Simulate',
    items: [
      { name: 'Start Simulation', shortcut: 'F5' },
      { name: 'Stop Simulation', shortcut: 'Shift+F5' },
      { name: 'Reset Simulation', shortcut: 'Ctrl+F5' },
      { separator: true },
      { name: 'DC Analysis', shortcut: 'Ctrl+D' },
      { name: 'AC Analysis', shortcut: 'Ctrl+A' },
      { name: 'Transient Analysis', shortcut: 'Ctrl+T' },
    ]
  },
  {
    name: 'Tools',
    items: [
      { name: 'Component Properties...', shortcut: 'F4' },
      { name: 'Circuit Properties...', shortcut: 'Ctrl+F4' },
      { separator: true },
      { name: 'Preferences...', shortcut: 'Ctrl+P' },
    ]
  },
  {
    name: 'Help',
    items: [
      { name: 'Getting Started' },
      { name: 'User Guide' },
      { name: 'Component Reference' },
      { separator: true },
      { name: 'About CircuitSim' },
    ]
  }
];

export default function TopToolbar({ 
  onSimulate, 
  onReset, 
  isSimulating,
  onZoomIn,
  onZoomOut,
  onFitView,
  onSave,
  onOpen 
}) {
  const [activeMenu, setActiveMenu] = useState(null);

  const handleMenuClick = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleMenuItemClick = (item) => {
    console.log('Menu item clicked:', item.name);
    setActiveMenu(null);
    
    // Handle menu actions
    switch (item.name) {
      case 'Start Simulation':
        onSimulate?.();
        break;
      case 'Reset Simulation':
        onReset?.();
        break;
      case 'Zoom In':
        onZoomIn?.();
        break;
      case 'Zoom Out':
        onZoomOut?.();
        break;
      case 'Zoom to Fit':
        onFitView?.();
        break;
      case 'Save':
        onSave?.();
        break;
      case 'Open...':
        onOpen?.();
        break;
    }
  };

  return (
    <div className="bg-gray-100 border-b border-gray-300">
      {/* Menu Bar */}
      <div className="flex items-center px-4 py-1 border-b border-gray-200">
        <div className="flex items-center space-x-1 mr-8">
          <div className="text-lg font-bold text-blue-600">CircuitSim</div>
          <div className="text-xs text-gray-500">Professional</div>
        </div>

        <div className="flex items-center space-x-1">
          {MENU_ITEMS.map((menu) => (
            <div key={menu.name} className="relative">
              <button
                onClick={() => handleMenuClick(menu.name)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors
                          ${activeMenu === menu.name 
                            ? 'bg-blue-500 text-white' 
                            : 'hover:bg-gray-200 text-gray-700'
                          }`}
              >
                {menu.name}
              </button>

              {/* Dropdown Menu */}
              {activeMenu === menu.name && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-300 
                              rounded-md shadow-lg z-50">
                  {menu.items.map((item, index) => {
                    if (item.separator) {
                      return <div key={index} className="border-t border-gray-200 my-1" />;
                    }

                    return (
                      <button
                        key={item.name}
                        onClick={() => handleMenuItemClick(item)}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 
                                 hover:text-blue-600 flex items-center justify-between"
                      >
                        <span>{item.name}</span>
                        {item.shortcut && (
                          <span className="text-xs text-gray-400">{item.shortcut}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2">
        {/* File Operations */}
        <div className="flex items-center space-x-2">
          <button 
            onClick={onOpen}
            className="toolbar-btn" 
            title="Open Circuit (Ctrl+O)"
          >
            <FolderOpen size={16} />
          </button>
          <button 
            onClick={onSave}
            className="toolbar-btn" 
            title="Save Circuit (Ctrl+S)"
          >
            <Save size={16} />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
        </div>

        {/* Simulation Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onSimulate}
            disabled={isSimulating}
            className={`toolbar-btn-primary ${isSimulating ? 'opacity-50 cursor-not-allowed' : ''}`}
            title="Start Simulation (F5)"
          >
            <Play size={16} />
            <span className="ml-2">{isSimulating ? 'Running...' : 'Simulate'}</span>
          </button>
          <button
            onClick={onReset}
            className="toolbar-btn"
            title="Reset Simulation"
          >
            <Square size={16} />
          </button>
          <button
            onClick={onReset}
            className="toolbar-btn"
            title="Reset Circuit"
          >
            <RotateCcw size={16} />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
        </div>

        {/* View Controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onZoomIn}
            className="toolbar-btn"
            title="Zoom In (Ctrl++)"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={onZoomOut}
            className="toolbar-btn"
            title="Zoom Out (Ctrl+-)"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={onFitView}
            className="toolbar-btn"
            title="Zoom to Fit (Ctrl+0)"
          >
            <FileText size={16} />
          </button>
          <div className="w-px h-6 bg-gray-300 mx-2" />
          <button
            className="toolbar-btn"
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </div>

      {/* Click outside to close menus */}
      {activeMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setActiveMenu(null)}
        />
      )}
    </div>
  );
}