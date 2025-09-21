import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronRight,
  Zap, 
  Battery, 
  Circle, 
  Waves,
  ArrowRight,
  MoreHorizontal,
  Cpu,
  Radio
} from 'lucide-react';

// Component categories like Multisim
const COMPONENT_CATEGORIES = [
  {
    name: 'Basic',
    icon: Circle,
    expanded: true,
    components: [
      { type: 'resistor', name: 'Resistor', icon: '⟲⟲⟲', description: 'Passive resistor' },
      { type: 'capacitor', name: 'Capacitor', icon: '||', description: 'Energy storage' },
      { type: 'inductor', name: 'Inductor', icon: '∿∿∿', description: 'Magnetic field' },
    ]
  },
  {
    name: 'Sources',
    icon: Battery,
    expanded: true,
    components: [
      { type: 'voltageSource', name: 'DC Voltage', icon: '⊕⊖', description: 'Voltage source' },
      { type: 'currentSource', name: 'DC Current', icon: '→I', description: 'Current source' },
    ]
  },
  {
    name: 'Semiconductors',
    icon: Cpu,
    expanded: false,
    components: [
      { type: 'diode', name: 'Diode', icon: '▷|', description: 'Rectifier diode' },
    ]
  },
  {
    name: 'Connectors',
    icon: Radio,
    expanded: false,
    components: [
      { type: 'ground', name: 'Ground', icon: '⏚', description: 'Circuit ground' },
    ]
  }
];

export default function Sidebar({ 
  onAddComponent, 
  selectedTool, 
  onToolSelect,
  componentStats = { count: 0, connections: 0, nodes: 0 }
}) {
  const [expandedCategories, setExpandedCategories] = useState(['Basic', 'Sources']);

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

  return (
    <div className="w-64 bg-gray-100 border-r border-gray-300 flex flex-col h-full">
      {/* Header */}
      <div className="bg-gray-200 px-4 py-3 border-b border-gray-300">
        <h3 className="text-sm font-semibold text-gray-700">Component Library</h3>
      </div>

      {/* Component Categories */}
      <div className="flex-1 overflow-y-auto p-2">
        {COMPONENT_CATEGORIES.map((category) => {
          const isExpanded = expandedCategories.includes(category.name);
          const IconComponent = category.icon;

          return (
            <div key={category.name} className="mb-2">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.name)}
                className="w-full flex items-center justify-between px-2 py-2 text-sm 
                         hover:bg-gray-200 rounded-md transition-colors group"
              >
                <div className="flex items-center space-x-2">
                  <IconComponent size={16} className="text-gray-600" />
                  <span className="text-gray-700 font-medium">{category.name}</span>
                </div>
                {isExpanded ? (
                  <ChevronDown size={16} className="text-gray-500" />
                ) : (
                  <ChevronRight size={16} className="text-gray-500" />
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
                    className="ml-4 mt-1 space-y-1 overflow-hidden"
                  >
                    {category.components.map((component) => {
                      const isSelected = selectedTool === component.type;

                      return (
                        <div
                          key={component.type}
                          draggable
                          onDragStart={(e) => handleComponentDragStart(e, component.type)}
                          onClick={() => handleComponentClick(component)}
                          className={`flex items-center space-x-3 px-3 py-2 rounded-md cursor-pointer 
                                    transition-all duration-150 group
                                    ${isSelected 
                                      ? 'bg-blue-100 border-2 border-blue-300' 
                                      : 'hover:bg-gray-150 border-2 border-transparent'
                                    }`}
                          title={component.description}
                        >
                          <div className="w-8 h-8 flex items-center justify-center bg-white 
                                        border border-gray-300 rounded-md text-sm font-mono">
                            {component.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-700 truncate">
                              {component.name}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {component.description}
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

      {/* Circuit Statistics */}
      <div className="border-t border-gray-300 p-4 bg-gray-50">
        <h4 className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">
          Circuit Statistics
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Components:</span>
            <span className="text-sm font-medium text-gray-800">{componentStats.count}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Connections:</span>
            <span className="text-sm font-medium text-gray-800">{componentStats.connections}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Nodes:</span>
            <span className="text-sm font-medium text-gray-800">{componentStats.nodes}</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-300 p-4 space-y-2">
        <button className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded-md 
                         hover:bg-blue-600 transition-colors">
          Load Example
        </button>
        <button className="w-full px-3 py-2 text-sm bg-gray-500 text-white rounded-md 
                         hover:bg-gray-600 transition-colors">
          Clear Canvas
        </button>
      </div>
    </div>
  );
}