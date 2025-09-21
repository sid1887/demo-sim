import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Upload, 
  Download, 
  Save, 
  FolderOpen, 
  Zap,
  Play,
  Square,
  Settings,
  HelpCircle
} from 'lucide-react'
import { uploadImage, netlistFromJson } from '../api'
import toast from 'react-hot-toast'

export default function TopBar({ circuit, onCircuitLoad, isSimulating }) {
  const [uploadingImage, setUploadingImage] = useState(false)

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    setUploadingImage(true)
    const uploadToast = toast.loading('🔍 Analyzing circuit image with AI...')
    
    try {
      // Parse image with Gemini Vision
      const parsed = await uploadImage(file)
      
      // Convert to netlist
      const netlistResponse = await netlistFromJson(parsed)
      
      // Convert to circuit format for canvas
      const newCircuit = {
        components: parsed.components || [],
        connections: [],
        nodes: parsed.nets || [],
        netlist: netlistResponse.netlist,
        originalImage: URL.createObjectURL(file)
      }
      
      onCircuitLoad(newCircuit)
      toast.success('✅ Circuit imported successfully!', { id: uploadToast })
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('❌ Failed to analyze image: ' + error.message, { id: uploadToast })
    } finally {
      setUploadingImage(false)
    }
  }

  const handleSaveCircuit = () => {
    const data = JSON.stringify(circuit, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'circuit.json'
    a.click()
    URL.revokeObjectURL(url)
    toast.success('💾 Circuit saved!')
  }

  const handleLoadCircuit = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const circuit = JSON.parse(e.target.result)
        onCircuitLoad(circuit)
        toast.success('📂 Circuit loaded!')
      } catch (error) {
        toast.error('❌ Invalid circuit file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Logo and Title */}
        <div className="flex items-center space-x-4">
          <motion.div 
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-800">CircuitSim AI</h1>
              <p className="text-xs text-gray-500">AI-Powered Circuit Simulator</p>
            </div>
          </motion.div>
        </div>

        {/* Main Actions */}
        <div className="flex items-center space-x-2">
          {/* Image Upload */}
          <label className="cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              disabled={uploadingImage}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
                uploadingImage 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg'
              }`}
              disabled={uploadingImage}
            >
              <Upload className="w-4 h-4" />
              <span>{uploadingImage ? 'Analyzing...' : 'Import Image'}</span>
            </motion.button>
          </label>

          {/* File Operations */}
          <div className="flex items-center space-x-1">
            <ActionButton
              icon={Save}
              tooltip="Save Circuit"
              onClick={handleSaveCircuit}
            />
            
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".json"
                onChange={handleLoadCircuit}
                className="hidden"
              />
              <ActionButton
                icon={FolderOpen}
                tooltip="Load Circuit"
              />
            </label>

            <ActionButton
              icon={Download}
              tooltip="Export Netlist"
              onClick={() => {
                if (circuit.netlist) {
                  const blob = new Blob([circuit.netlist], { type: 'text/plain' })
                  const url = URL.createObjectURL(blob)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = 'circuit.spice'
                  a.click()
                  URL.revokeObjectURL(url)
                  toast.success('📄 Netlist exported!')
                } else {
                  toast.error('No netlist to export')
                }
              }}
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2">
          <ActionButton
            icon={Settings}
            tooltip="Settings"
          />
          
          <ActionButton
            icon={HelpCircle}
            tooltip="Help"
          />

          {/* Status Indicator */}
          <div className="flex items-center space-x-2 px-3 py-1 bg-gray-100 rounded-full">
            <div className={`w-2 h-2 rounded-full ${isSimulating ? 'bg-yellow-400 animate-pulse' : 'bg-green-400'}`} />
            <span className="text-xs text-gray-600">
              {isSimulating ? 'Simulating...' : 'Ready'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

function ActionButton({ icon: Icon, tooltip, onClick, ...props }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="p-2 hover:bg-gray-100 rounded-md transition-colors group relative"
      title={tooltip}
      {...props}
    >
      <Icon className="w-4 h-4 text-gray-600 group-hover:text-gray-800" />
    </motion.button>
  )
}