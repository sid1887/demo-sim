import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Simulation API
export const simulationAPI = {
  async runSimulation(netlist, analysisType = 'op', parameters = {}) {
    try {
      console.log(`🔬 Running ${analysisType} simulation on Node.js server...`)
      const response = await apiClient.post('/simulate', {
        netlist,
        analysisType,
        parameters
      });
      
      console.log('✅ Node.js simulation response:', response.data)
      return response.data;
    } catch (error) {
      console.error('❌ Node.js simulation failed:', error.response?.data || error.message)
      throw new Error(
        error.response?.data?.message || 
        error.response?.data?.error ||
        `Node.js simulation failed: ${error.message}`
      );
    }
  },

  async getHealth() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      throw new Error(`Health check failed: ${error.message}`);
    }
  }
};

// Gemini AI API
export const geminiAPI = {
  async askQuestion(prompt, context = {}) {
    try {
      const response = await apiClient.post('/gemini', {
        prompt,
        context,
        model: 'gemini-1.5-flash'
      });
      
      if (response.data.success) {
        return {
          response: response.data.response,
          metadata: response.data.metadata
        };
      } else {
        throw new Error('Invalid response from AI service');
      }
    } catch (error) {
      if (error.response?.status === 501) {
        throw new Error('AI service is not configured. Please check API keys.');
      }
      
      throw new Error(
        error.response?.data?.message || 
        `AI request failed: ${error.message}`
      );
    }
  },

  // Specialized methods for different types of AI queries
  async explainCircuit(netlist, simulationResults = null) {
    const context = {
      circuit: netlist,
      results: simulationResults,
      hasResults: !!simulationResults,
      componentCount: netlist.split('\n').filter(line => 
        line.match(/^[RLCVID]\d+/)
      ).length
    };

    return this.askQuestion(
      'Please explain this circuit, how it works, and what each component does.',
      context
    );
  },

  async analyzeResults(simulationResults, netlist) {
    const context = {
      circuit: netlist,
      results: simulationResults,
      hasResults: true,
      analysisType: simulationResults.type
    };

    return this.askQuestion(
      'Please analyze these simulation results and explain what they mean. Are there any interesting observations or potential issues?',
      context
    );
  },

  async suggestImprovements(netlist, simulationResults = null) {
    const context = {
      circuit: netlist,
      results: simulationResults,
      hasResults: !!simulationResults
    };

    return this.askQuestion(
      'What improvements could be made to this circuit? Are there any potential issues or optimizations you would suggest?',
      context
    );
  },

  async troubleshootCircuit(netlist, problem) {
    const context = {
      circuit: netlist,
      issue: problem
    };

    return this.askQuestion(
      `I'm having trouble with this circuit: ${problem}. Can you help me troubleshoot and fix the issue?`,
      context
    );
  }
};

// Utility functions for API responses
export const apiUtils = {
  isAPIAvailable: async () => {
    try {
      await simulationAPI.getHealth();
      return true;
    } catch {
      return false;
    }
  },

  formatSimulationError: (error) => {
    if (error.response?.data?.code === 501) {
      return {
        title: 'NGSpice Not Available',
        message: 'Please install NGSpice to run simulations',
        suggestion: 'Install with: apt-get install ngspice (Linux) or brew install ngspice (macOS)'
      };
    }

    if (error.message.includes('timeout')) {
      return {
        title: 'Simulation Timeout',
        message: 'The simulation took too long to complete',
        suggestion: 'Try simplifying your circuit or check for infinite loops'
      };
    }

    return {
      title: 'Simulation Error',
      message: error.message,
      suggestion: 'Check your circuit connections and component values'
    };
  },

  formatAIError: (error) => {
    if (error.message.includes('API keys')) {
      return {
        title: 'AI Service Not Configured',
        message: 'Gemini API key is not set up',
        suggestion: 'Contact administrator to configure AI services'
      };
    }

    if (error.message.includes('timeout')) {
      return {
        title: 'AI Request Timeout',
        message: 'The AI service took too long to respond',
        suggestion: 'Please try again with a shorter question'
      };
    }

    return {
      title: 'AI Service Error',
      message: error.message,
      suggestion: 'Please try again or contact support if the issue persists'
    };
  }
};

export default {
  simulation: simulationAPI,
  gemini: geminiAPI,
  utils: apiUtils
};