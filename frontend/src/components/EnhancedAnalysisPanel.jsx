import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  Zap, 
  AlertCircle, 
  CheckCircle, 
  Info,
  TrendingUp,
  Eye,
  Cpu,
  Activity,
  Target,
  ChevronDown,
  ChevronRight,
  Clock,
  Award
} from 'lucide-react';

export default function EnhancedAnalysisPanel({ analysisData, onClose, isVisible = true }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [expandedSections, setExpandedSections] = useState({
    circuit: true,
    components: false,
    performance: false,
    recommendations: false
  });

  if (!isVisible || !analysisData) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceBg = (confidence) => {
    if (confidence >= 0.8) return 'bg-green-50 border-green-200';
    if (confidence >= 0.6) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  const circuitAnalysis = analysisData.enhanced_analysis?.circuit_analysis || {};
  const componentAnalysis = analysisData.enhanced_analysis?.component_analysis || [];
  const performanceMetrics = analysisData.enhanced_analysis?.performance_metrics || {};
  const recommendations = analysisData.enhanced_analysis?.design_recommendations || [];
  const overallConfidence = analysisData.enhanced_analysis?.overall_confidence || 0.5;
  const processingInfo = analysisData.enhanced_analysis?.analysis_metadata || {};

  return (
    <motion.div
      initial={{ opacity: 0, x: 400 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 400 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed right-0 top-0 h-full w-96 bg-white border-l border-slate-200 shadow-xl z-50 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6" />
            <div>
              <h2 className="text-lg font-bold">AI Circuit Analysis</h2>
              <p className="text-blue-100 text-sm">Enhanced Professional Insights</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            ×
          </button>
        </div>

        {/* Processing Info */}
        <div className="mt-3 flex items-center gap-4 text-sm text-blue-100">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {analysisData.processing_time_ms}ms
          </div>
          <div className="flex items-center gap-1">
            <Award className={`w-4 h-4 ${getConfidenceColor(overallConfidence)}`} />
            {Math.round(overallConfidence * 100)}% confidence
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        
        {/* Circuit Analysis Section */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <button
            onClick={() => toggleSection('circuit')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Cpu className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-slate-900">Circuit Analysis</span>
            </div>
            {expandedSections.circuit ? 
              <ChevronDown className="w-5 h-5 text-slate-500" /> : 
              <ChevronRight className="w-5 h-5 text-slate-500" />
            }
          </button>
          
          <AnimatePresence>
            {expandedSections.circuit && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-slate-100"
              >
                <div className="p-4 space-y-3">
                  <div className={`p-3 rounded-lg border-2 ${getConfidenceBg(circuitAnalysis.confidence || 0.5)}`}>
                    <div className="flex items-center gap-2 mb-2">
                      <Target className="w-4 h-4" />
                      <span className="font-medium text-sm uppercase tracking-wide">
                        {circuitAnalysis.type?.replace('_', ' ') || 'Unknown'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700">
                      {circuitAnalysis.purpose || 'Circuit purpose not determined'}
                    </p>
                  </div>

                  {circuitAnalysis.expected_behavior && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <h4 className="font-medium text-blue-900 text-sm mb-1">Expected Behavior</h4>
                      <p className="text-sm text-blue-700">
                        {circuitAnalysis.expected_behavior}
                      </p>
                    </div>
                  )}

                  {circuitAnalysis.key_components && circuitAnalysis.key_components.length > 0 && (
                    <div>
                      <h4 className="font-medium text-slate-900 text-sm mb-2">Key Components</h4>
                      <div className="flex flex-wrap gap-1">
                        {circuitAnalysis.key_components.map((component, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-mono"
                          >
                            {component}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Component Analysis Section */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <button
            onClick={() => toggleSection('components')}
            className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Activity className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-slate-900">Components ({componentAnalysis.length})</span>
            </div>
            {expandedSections.components ? 
              <ChevronDown className="w-5 h-5 text-slate-500" /> : 
              <ChevronRight className="w-5 h-5 text-slate-500" />
            }
          </button>
          
          <AnimatePresence>
            {expandedSections.components && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-slate-100"
              >
                <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
                  {componentAnalysis.map((component, index) => (
                    <div key={index} className="border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">
                          {component.id} ({component.type})
                        </span>
                        <span className={`text-xs font-semibold ${getConfidenceColor(component.confidence)}`}>
                          {Math.round(component.confidence * 100)}%
                        </span>
                      </div>
                      
                      {component.value_assessment && (
                        <p className="text-xs text-slate-600 font-mono mb-2">
                          Value: {component.value_assessment}
                        </p>
                      )}

                      {component.issues && component.issues.length > 0 && (
                        <div className="mb-2">
                          {component.issues.map((issue, issueIndex) => (
                            <div key={issueIndex} className="flex items-center gap-1 text-xs text-red-600">
                              <AlertCircle className="w-3 h-3" />
                              <span>{issue}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {component.recommendations && component.recommendations.length > 0 && (
                        <div>
                          {component.recommendations.slice(0, 2).map((rec, recIndex) => (
                            <div key={recIndex} className="flex items-center gap-1 text-xs text-blue-600">
                              <Info className="w-3 h-3" />
                              <span>{rec}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Performance Metrics Section */}
        {Object.keys(performanceMetrics).length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <button
              onClick={() => toggleSection('performance')}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="font-semibold text-slate-900">Performance Metrics</span>
              </div>
              {expandedSections.performance ? 
                <ChevronDown className="w-5 h-5 text-slate-500" /> : 
                <ChevronRight className="w-5 h-5 text-slate-500" />
              }
            </button>
            
            <AnimatePresence>
              {expandedSections.performance && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-100"
                >
                  <div className="p-4 space-y-2">
                    {Object.entries(performanceMetrics).map(([key, value], index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-sm text-slate-600 capitalize">
                          {key.replace('_', ' ')}
                        </span>
                        <span className="text-sm font-mono font-medium">
                          {typeof value === 'number' ? 
                            (value < 1 ? (value * 100).toFixed(1) + '%' : value.toFixed(3)) : 
                            value
                          }
                        </span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Recommendations Section */}
        {recommendations.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
            <button
              onClick={() => toggleSection('recommendations')}
              className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-orange-600" />
                <span className="font-semibold text-slate-900">Recommendations ({recommendations.length})</span>
              </div>
              {expandedSections.recommendations ? 
                <ChevronDown className="w-5 h-5 text-slate-500" /> : 
                <ChevronRight className="w-5 h-5 text-slate-500" />
              }
            </button>
            
            <AnimatePresence>
              {expandedSections.recommendations && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-slate-100"
                >
                  <div className="p-4 space-y-2 max-h-48 overflow-y-auto">
                    {recommendations.map((recommendation, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-slate-700">{recommendation}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Processing Details */}
        {processingInfo.components_analyzed && (
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
            <h4 className="font-medium text-slate-900 text-sm mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Analysis Details
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-500">Components:</span>
                <span className="ml-1 font-mono">{processingInfo.components_analyzed}</span>
              </div>
              <div>
                <span className="text-slate-500">Nets:</span>
                <span className="ml-1 font-mono">{processingInfo.nets_found}</span>
              </div>
              <div>
                <span className="text-slate-500">Wires:</span>
                <span className="ml-1 font-mono">{processingInfo.wires_detected}</span>
              </div>
              <div>
                <span className="text-slate-500">Analysis:</span>
                <span className="ml-1 font-mono">{processingInfo.analysis_depth}</span>
              </div>
            </div>
          </div>
        )}

        {/* Features Used */}
        {analysisData.features_enabled && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="font-medium text-blue-900 text-sm mb-2">Processing Features Used</h4>
            <div className="space-y-1">
              {Object.entries(analysisData.features_enabled).map(([feature, enabled]) => (
                <div key={feature} className="flex items-center gap-2 text-xs">
                  {enabled ? 
                    <CheckCircle className="w-3 h-3 text-green-500" /> : 
                    <AlertCircle className="w-3 h-3 text-gray-400" />
                  }
                  <span className={enabled ? "text-blue-700" : "text-gray-500"}>
                    {feature.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase())}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}