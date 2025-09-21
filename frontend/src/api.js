import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

// Create axios instance with enhanced error handling
const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message)
    throw error
  }
)

export async function uploadImage(file) {
  const fd = new FormData();
  fd.append('file', file)
  
  try {
    const res = await api.post('/api/parse', fd, { 
      headers: {'Content-Type': 'multipart/form-data'},
      timeout: 60000 // Extended timeout for image processing
    })
    
    // Log processing info
    if (res.data.processing_time_ms) {
      console.log(`🔍 Image processed in ${res.data.processing_time_ms}ms`)
    }
    
    if (res.data.enhanced_analysis) {
      console.log('✅ Enhanced analysis available')
    }
    
    return res.data
  } catch (error) {
    console.error('Image upload failed:', error)
    throw new Error(`Image analysis failed: ${error.response?.data?.detail || error.message}`)
  }
}

export async function netlistFromJson(parsedJson) {
  try {
    const res = await api.post('/api/netlist_from_json', parsedJson)
    return res.data
  } catch (error) {
    console.error('Netlist generation failed:', error)
    throw new Error(`Netlist generation failed: ${error.response?.data?.detail || error.message}`)
  }
}

export async function simulate(netlist, analysis={type:'dc'}) {
  try {
    const res = await api.post('/api/simulate', {netlist, analysis})
    
    // Log simulation info
    if (res.data.simulation_metadata) {
      const metadata = res.data.simulation_metadata
      console.log(`⚡ Simulation completed in ${metadata.processing_time_ms}ms`)
    }
    
    return res.data
  } catch (error) {
    console.error('Simulation failed:', error)
    throw new Error(`Simulation failed: ${error.response?.data?.detail || error.message}`)
  }
}

export async function chat(question, context) {
  try {
    const res = await api.post('/api/chat', {question, context})
    return res.data
  } catch (error) {
    console.error('Chat request failed:', error)
    throw new Error(`AI chat failed: ${error.response?.data?.detail || error.message}`)
  }
}

export async function getCapabilities() {
  try {
    const res = await api.get('/api/capabilities')
    return res.data
  } catch (error) {
    console.error('Capabilities check failed:', error)
    return {
      vision_processing: { gemini_vision: false, yolo_component_detection: false },
      analysis_features: { component_analysis: false },
      simulation: { spice_compatible: false },
      ai_features: { chat_assistance: false }
    }
  }
}

export async function getHealth() {
  try {
    const res = await api.get('/api/health')
    return res.data
  } catch (error) {
    console.error('Health check failed:', error)
    return { status: 'error', features: {}, capabilities: {} }
  }
}
