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
  ChevronDown,
  Undo,
  Redo,
  Grid,
  Camera,
  Upload
} from 'lucide-react';

const MENU_ITEMS = [
  {
    name: 'File',
    items: [
      { name: 'New Circuit', shortcut: 'Ctrl+N', action: 'new' },
      { name: 'Open...', shortcut: 'Ctrl+O', action: 'open' },
      { name: 'Save', shortcut: 'Ctrl+S', action: 'save' },
      { name: 'Save As...', shortcut: 'Ctrl+Shift+S', action: 'saveAs' },
      { separator: true },
      { name: 'Export...', shortcut: 'Ctrl+E', action: 'export' },
    ]
  },
  {
    name: 'Edit',
    items: [
      { name: 'Undo', shortcut: 'Ctrl+Z', action: 'undo' },
      { name: 'Redo', shortcut: 'Ctrl+Y', action: 'redo' },
      { separator: true },
      { name: 'Cut', shortcut: 'Ctrl+X', action: 'cut' },
      { name: 'Copy', shortcut: 'Ctrl+C', action: 'copy' },
      { name: 'Paste', shortcut: 'Ctrl+V', action: 'paste' },
    ]
  },
  {
    name: 'View',
    items: [
      { name: 'Zoom In', shortcut: 'Ctrl++', action: 'zoomIn' },
      { name: 'Zoom Out', shortcut: 'Ctrl+-', action: 'zoomOut' },
      { name: 'Zoom to Fit', shortcut: 'Ctrl+0', action: 'fitView' },
      { separator: true },
      { name: 'Toggle Grid', shortcut: 'Ctrl+G', action: 'toggleGrid' },
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
  onOpen,
  onToggleImageUpload,
  currentFileName = 'untitled.circuit'
}) {
  const [activeMenu, setActiveMenu] = useState(null);

  const handleMenuClick = (menuName) => {
    setActiveMenu(activeMenu === menuName ? null : menuName);
  };

  const handleMenuItemClick = (item) => {
    setActiveMenu(null);
    
    // Handle menu actions
    switch (item.action) {
      case 'save':
        onSave?.();
        break;
      case 'open':
        onOpen?.();
        break;
      case 'zoomIn':
        onZoomIn?.();
        break;
      case 'zoomOut':
        onZoomOut?.();
        break;
      case 'fitView':
        onFitView?.();
        break;
      default:
        console.log('Menu action:', item.action);
    }
  };

  return (
    <>
      {/* Compact Top Bar - 48px height */}
      <header className="h-12 flex items-center px-4 bg-white shadow-sm border-b border-slate-200">
        {/* Left: Logo + File Menu */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center">
              <span className="text-white text-xs font-bold">CS</span>
            </div>
            <span className="text-sm font-semibold text-slate-900">CircuitSim</span>
            <span className="text-xs text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">Professional</span>
          </div>
          
          {/* File Menu Dropdown */}
          <div className="flex items-center">
            {MENU_ITEMS.map((menu) => (
              <div key={menu.name} className="relative">
                <button
                  onClick={() => handleMenuClick(menu.name)}
                  className={`px-2 py-1 text-sm rounded hover:bg-slate-100 transition-colors ${
                    activeMenu === menu.name ? 'bg-blue-50 text-blue-600' : 'text-slate-700'
                  }`}
                >
                  {menu.name}
                </button>

                {/* Dropdown Menu */}
                {activeMenu === menu.name && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-slate-200 
                                rounded-lg shadow-lg z-50 py-1">
                    {menu.items.map((item, index) => {
                      if (item.separator) {
                        return <div key={index} className="border-t border-slate-100 my-1" />;
                      }

                      return (
                        <button
                          key={item.name}
                          onClick={() => handleMenuItemClick(item)}
                          className="w-full text-left px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 
                                   hover:text-slate-900 flex items-center justify-between"
                        >
                          <span>{item.name}</span>
                          {item.shortcut && (
                            <span className="text-xs text-slate-400 font-mono">{item.shortcut}</span>
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

        {/* Center: Breadcrumb/Current File */}
        <div className="flex-1 text-center">
          <span className="text-sm text-slate-600 font-medium">{currentFileName}</span>
        </div>

        {/* Right: Primary Action + Secondary Icons */}
        <div className="flex items-center gap-2">
          {/* Secondary Actions */}
          <button
            className="p-2 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-700 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo size={16} />
          </button>
          <button
            className="p-2 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-700 transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo size={16} />
          </button>
          
          <div className="w-px h-4 bg-slate-300 mx-1" />
          
          <button
            onClick={onZoomOut}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-700 transition-colors"
            title="Zoom Out (Ctrl+-)"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={onZoomIn}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-700 transition-colors"
            title="Zoom In (Ctrl++)"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={onFitView}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-700 transition-colors"
            title="Fit to View (Ctrl+0)"
          >
            <Grid size={16} />
          </button>

          <div className="w-px h-4 bg-slate-300 mx-1" />

          <button
            onClick={onSave}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-700 transition-colors"
            title="Save (Ctrl+S)"
          >
            <Save size={16} />
          </button>

          <div className="w-px h-4 bg-slate-300 mx-1" />

          {/* Image Upload Button */}
          <button
            onClick={onToggleImageUpload}
            className="p-2 rounded-md hover:bg-slate-100 text-slate-600 hover:text-slate-700 transition-colors"
            title="Upload Circuit Image (AI Analysis)"
          >
            <Camera size={16} />
          </button>

          <div className="w-px h-4 bg-slate-300 mx-1" />

          {/* Primary Action - Simulate */}
          <button
            onClick={onSimulate}
            disabled={isSimulating}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-150 
                       flex items-center gap-2 shadow-sm ${
              isSimulating 
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
            }`}
          >
            <Play size={14} />
            {isSimulating ? 'Running...' : 'Simulate'}
          </button>
        </div>
      </header>

      {/* Click outside to close menus */}
      {activeMenu && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setActiveMenu(null)}
        />
      )}
    </>
  );
}