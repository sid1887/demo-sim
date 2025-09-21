import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { BarChart3, Zap, Activity, Eye, Download, Maximize2 } from 'lucide-react'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const VIEW_MODES = [
  { id: 'table', name: 'Table', icon: BarChart3 },
  { id: 'chart', name: 'Chart', icon: Activity },
  { id: 'both', name: 'Both', icon: Eye },
]

export default function ResultsViewer({ results, circuit }) {
  const [viewMode, setViewMode] = useState('both')
  const [selectedNodes, setSelectedNodes] = useState([])

  if (!results) {
    return (
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Simulation Results
          </h3>
        </div>
        <div className="flex-1 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No Results Yet</p>
            <p className="text-sm">Run a simulation to see results here</p>
          </div>
        </div>
      </div>
    )
  }

  const chartData = prepareChartData(results)
  const tableData = prepareTableData(results)

  return (
    <div className="h-full flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-800 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2" />
            Results - {results.type?.toUpperCase() || 'Unknown'}
          </h3>
          
          <div className="flex items-center space-x-2">
            {/* View Mode Selector */}
            <div className="flex rounded-lg border border-gray-200 overflow-hidden">
              {VIEW_MODES.map((mode) => {
                const Icon = mode.icon
                return (
                  <button
                    key={mode.id}
                    onClick={() => setViewMode(mode.id)}
                    className={`px-3 py-1.5 text-sm flex items-center space-x-1 transition-colors ${
                      viewMode === mode.id
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{mode.name}</span>
                  </button>
                )
              })}
            </div>

            {/* Export Button */}
            <button className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mt-2 flex items-center space-x-2">
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            results.status === 'success' ? 'bg-green-100 text-green-800' :
            results.status === 'mock' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {results.status === 'success' && '✅ Success'}
            {results.status === 'mock' && '🧪 Mock Data'}
            {results.status === 'error' && '❌ Error'}
          </span>
          {results.message && (
            <span className="text-xs text-gray-500">{results.message}</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'table' && <TableView data={tableData} />}
        {viewMode === 'chart' && <ChartView data={chartData} results={results} />}
        {viewMode === 'both' && (
          <div className="h-full flex flex-col">
            <div className="flex-1 min-h-0">
              <ChartView data={chartData} results={results} />
            </div>
            <div className="h-48 border-t border-gray-200">
              <TableView data={tableData} compact />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function TableView({ data, compact = false }) {
  return (
    <div className={`${compact ? 'h-full' : 'flex-1'} overflow-auto`}>
      <div className="p-4">
        <h4 className="font-medium text-gray-700 mb-3">Node Voltages</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Node
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Voltage
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Unit
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(data.nodes || {}).map(([node, voltage]) => (
                <tr key={node} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">{node}</td>
                  <td className="px-4 py-2 text-sm text-gray-600">{voltage.toFixed(3)}</td>
                  <td className="px-4 py-2 text-sm text-gray-500">V</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function ChartView({ data, results }) {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `${results.type?.toUpperCase() || 'Simulation'} Analysis Results`,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: results.type === 'transient' ? 'Time (s)' : 'Frequency (Hz)',
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Voltage (V)',
        },
      },
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false,
    },
  }

  return (
    <div className="flex-1 p-4">
      <div className="h-full">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}

function prepareChartData(results) {
  if (results.type === 'transient' && results.results?.time) {
    const { time, voltages } = results.results
    const datasets = Object.entries(voltages).map(([node, values], index) => ({
      label: `Node ${node}`,
      data: values,
      borderColor: `hsl(${index * 60}, 70%, 50%)`,
      backgroundColor: `hsl(${index * 60}, 70%, 50%, 0.1)`,
      tension: 0.1,
    }))

    return {
      labels: time,
      datasets,
    }
  } else {
    // DC analysis - show as bar chart
    const nodes = Object.keys(results.results?.nodes || {})
    const voltages = Object.values(results.results?.nodes || {})
    
    return {
      labels: nodes,
      datasets: [{
        label: 'Node Voltage (V)',
        data: voltages,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1,
      }],
    }
  }
}

function prepareTableData(results) {
  return {
    nodes: results.results?.nodes || {},
    currents: results.results?.currents || {},
  }
}