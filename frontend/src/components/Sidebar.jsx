import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight,
  ChevronLeft,
  Zap, 
  Battery, 
  Circle, 
  Waves,
  ArrowRight,
  MoreHorizontal,
  Cpu,
  Radio,
  Search,
  RotateCw,
  Copy,
  Trash2,
  Settings
} from 'lucide-react';

// Component categories with refined icons
const COMPONENT_CATEGORIES = [
  {
    name: 'Basic',
    icon: Circle,
    expanded: true,
    components: [
      { type: 'resistor', name: 'Resistor', icon: '⟲⟲⟲', description: 'Passive resistor', value: '1kΩ' },
      { type: 'capacitor', name: 'Capacitor', icon: '||', description: 'Energy storage', value: '1μF' },
      { type: 'inductor', name: 'Inductor', icon: '∿∿∿', description: 'Magnetic field', value: '1mH' },
    ]
  },
  {
    name: 'Sources',
    icon: Battery,
    expanded: true,
    components: [
      { type: 'voltageSource', name: 'DC Voltage', icon: '⊕⊖', description: 'Voltage source', value: '5V' },
      { type: 'currentSource', name: 'DC Current', icon: '→I', description: 'Current source', value: '1A' },
    ]
  },
  {
    name: 'Signal Generators',
    icon: Waves,
    expanded: false,
    components: [
      { type: 'acVoltage', name: 'AC Voltage', icon: '~V', description: 'AC voltage source', value: '5V@1kHz' },
      { type: 'dcVoltage', name: 'DC Voltage', icon: '=V', description: 'DC voltage source', value: '5V' },
      { type: 'functionGen', name: 'Function Gen', icon: '⫸', description: 'Waveform generator', value: 'Sine 1kHz' },
      { type: 'currentSourceGen', name: 'Current Gen', icon: '~I', description: 'AC current source', value: '1mA@1kHz' },
      { type: 'pulseGen', name: 'Pulse Gen', icon: '⎍', description: 'Pulse generator', value: '5V 50% duty' },
      { type: 'awg', name: 'AWG', icon: '∿', description: 'Arbitrary waveform', value: 'Custom' },
    ]
  },
  {
    name: 'Semiconductors',
    icon: Cpu,
    expanded: false,
    components: [
      { type: 'diode', name: 'Diode', icon: '▷|', description: 'Rectifier diode', value: '1N4007' },
    ]
  },
  {
    name: 'Connectors',
    icon: Radio,
    expanded: false,
    components: [
      { type: 'ground', name: 'Ground', icon: '⏚', description: 'Circuit ground', value: 'GND' },
    ]
  }
];

export default function Sidebar({ 
  onAddComponent, 
  selectedTool, 
  onToolSelect,
  componentStats = { count: 0, connections: 0, nodes: 0 },
  selectedComponent = null,
  onComponentUpdate
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState(['Basic', 'Sources']);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleCategory = (categoryName) => {
    setExpandedCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(name => name !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleComponentDragStart = (event, componentType) => {
    event.dataTransfer.setData('application/reactflow', componentType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const handleComponentClick = (component) => {
    onToolSelect?.(component.type);
    onAddComponent?.(component.type);
  };

  // Filter components based on search
  const filteredCategories = COMPONENT_CATEGORIES.map(category => ({
    ...category,
    components: category.components.filter(comp => 
      comp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      comp.type.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.components.length > 0);

  if (isCollapsed) {
    // Collapsed state - 56px wide with icons only
    return (
      <div className="w-14 bg-white border-r border-slate-200 flex flex-col items-center py-4 shadow-sm">
        {/* Toggle Button */}
        <button
          onClick={() => setIsCollapsed(false)}
          className="mb-6 p-2 rounded-lg hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors"
          title="Expand Sidebar"
        >
          <ChevronRight size={20} />
        </button>

        {/* Compact Component Icons */}
        <div className="space-y-3">
          {COMPONENT_CATEGORIES.slice(0, 2).map(category => 
            category.components.map(component => {
              const isSelected = selectedTool === component.type;
              const IconComponent = category.icon;

              return (
                <button
                  key={component.type}
                  draggable
                  onDragStart={(e) => handleComponentDragStart(e, component.type)}
                  onClick={() => handleComponentClick(component)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all duration-150 
                            flex items-center justify-center text-sm font-mono
                            ${isSelected 
                              ? 'border-blue-300 bg-blue-50 text-blue-700' 
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 text-slate-700'
                            }`}
                  title={`${component.name} - ${component.description}`}
                >
                  {component.icon}
                </button>
              );
            })
          )}
        </div>

        {/* Stats indicator */}
        <div className="mt-auto text-xs text-slate-500 text-center">
          <div className="w-2 h-2 rounded-full bg-green-400 mx-auto mb-1" />
          <div>{componentStats.count}</div>
        </div>
      </div>
    );
  }

  // Expanded state - 320px wide with full interface
  return (
    <div className="w-80 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm">
      {/* Header with Toggle */}
      <div className="flex items-center justify-between p-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-900">Component Library</h3>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors"
          title="Collapse Sidebar"
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="p-4 border-b border-slate-100">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 
                     rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Component Categories - Scrollable */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-3">
          {filteredCategories.map((category) => {
            const isExpanded = expandedCategories.includes(category.name);
            const IconComponent = category.icon;

            return (
              <div key={category.name}>
                {/* Category Header */}
                <button
                  onClick={() => toggleCategory(category.name)}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm 
                           hover:bg-slate-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <IconComponent size={16} className="text-slate-500 group-hover:text-slate-700" />
                    <span className="font-medium text-slate-700">{category.name}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronDown size={16} className="text-slate-400" />
                  ) : (
                    <ChevronRight size={16} className="text-slate-400" />
                  )}
                </button>

                {/* Category Components */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-2 ml-3 space-y-1 overflow-hidden"
                    >
                      {category.components.map((component) => {
                        const isSelected = selectedTool === component.type;

                        return (
                          <div
                            key={component.type}
                            draggable
                            onDragStart={(e) => handleComponentDragStart(e, component.type)}
                            onClick={() => handleComponentClick(component)}
                            className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer 
                                      transition-all duration-150 group border-2
                                      ${isSelected 
                                        ? 'border-blue-200 bg-blue-50' 
                                        : 'border-transparent hover:bg-slate-50 hover:border-slate-100'
                                      }`}
                          >
                            <div className="w-10 h-10 flex items-center justify-center bg-slate-50 
                                          border border-slate-200 rounded-lg text-sm font-mono
                                          group-hover:bg-white group-hover:border-slate-300">
                              {component.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-slate-900 truncate">
                                {component.name}
                              </div>
                              <div className="text-xs text-slate-500 truncate">
                                {component.description}
                              </div>
                              <div className="text-xs text-slate-600 font-mono mt-0.5">
                                {component.value}
                              </div>
                            </div>
                            {isSelected && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Component Properties */}
      {selectedComponent && (
        <div className="border-t border-slate-100 p-4 bg-slate-50">
          <h4 className="text-sm font-semibold text-slate-900 mb-3">Properties</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Label</label>
              <input
                type="text"
                value={selectedComponent.data?.label || ''}
                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none 
                         focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Component label"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Value</label>
              <input
                type="text"
                value={selectedComponent.data?.value || ''}
                className="w-full px-2 py-1.5 text-sm border border-slate-200 rounded focus:outline-none 
                         focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Component value"
              />
            </div>
            <div className="flex items-center gap-2 pt-2">
              <button className="flex-1 px-3 py-1.5 text-xs bg-slate-200 hover:bg-slate-300 
                               text-slate-700 rounded transition-colors flex items-center justify-center gap-1">
                <Copy size={12} />
                Duplicate
              </button>
              <button className="flex-1 px-3 py-1.5 text-xs bg-slate-200 hover:bg-slate-300 
                               text-slate-700 rounded transition-colors flex items-center justify-center gap-1">
                <RotateCw size={12} />
                Rotate
              </button>
              <button className="px-3 py-1.5 text-xs bg-red-100 hover:bg-red-200 
                               text-red-700 rounded transition-colors flex items-center justify-center">
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Circuit Statistics */}
      <div className="border-t border-slate-100 p-4 bg-slate-50">
        <h4 className="text-xs font-semibold text-slate-600 mb-3 uppercase tracking-wide">
          Circuit Statistics
        </h4>
        <div className="grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="text-lg font-bold text-slate-900">{componentStats.count}</div>
            <div className="text-xs text-slate-500">Components</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{componentStats.connections}</div>
            <div className="text-xs text-slate-500">Connections</div>
          </div>
          <div>
            <div className="text-lg font-bold text-slate-900">{componentStats.nodes}</div>
            <div className="text-xs text-slate-500">Nodes</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-slate-100 p-4 space-y-2">
        <div className="flex gap-2">
          <button className="flex-1 px-3 py-2 text-sm bg-blue-50 text-blue-600 rounded-lg 
                           hover:bg-blue-100 transition-colors border border-blue-200">
            Load Example
          </button>
          <button className="flex-1 px-3 py-2 text-sm bg-slate-100 text-slate-600 rounded-lg 
                           hover:bg-slate-200 transition-colors border border-slate-200">
            Clear Canvas
          </button>
        </div>
      </div>
    </div>
  );
}