const express = require('express');
const axios = require('axios');
const router = express.Router();

// Gemini AI proxy endpoint
router.post('/', async (req, res) => {
  const { prompt, context = {}, model = 'gemini-1.5-flash' } = req.body;

  if (!prompt) {
    return res.status(400).json({
      error: 'No prompt provided',
      message: 'Please provide a prompt for the AI assistant'
    });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  const GEMINI_API_URL = process.env.GEMINI_API_URL || 
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

  if (!GEMINI_API_KEY) {
    return res.status(500).json({
      error: 'API key not configured',
      message: 'GEMINI_API_KEY environment variable is not set'
    });
  }

  try {
    console.log('🤖 Forwarding request to Gemini AI...');
    console.log('Context:', context);
    console.log('Prompt length:', prompt.length);

    // Build comprehensive context for Gemini
    const systemContext = buildSystemContext(context);
    const fullPrompt = `${systemContext}\n\nUser Question: ${prompt}`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: fullPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
      safetySettings: [
        {
          category: "HARM_CATEGORY_HARASSMENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_HATE_SPEECH",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        },
        {
          category: "HARM_CATEGORY_DANGEROUS_CONTENT",
          threshold: "BLOCK_MEDIUM_AND_ABOVE"
        }
      ]
    };

    const response = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, requestBody, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    if (response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
      const aiResponse = response.data.candidates[0].content.parts[0].text;
      
      console.log('✅ Received Gemini response');
      
      return res.json({
        success: true,
        response: aiResponse,
        context: {
          model,
          tokenCount: aiResponse.length,
          timestamp: new Date().toISOString()
        },
        metadata: {
          finishReason: response.data.candidates[0].finishReason,
          safetyRatings: response.data.candidates[0].safetyRatings
        }
      });
      
    } else {
      throw new Error('Invalid response format from Gemini API');
    }

  } catch (error) {
    console.error('Gemini API Error:', error.message);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      
      return res.status(error.response.status).json({
        error: 'Gemini API error',
        message: error.response.data?.error?.message || error.message,
        status: error.response.status
      });
    }
    
    if (error.code === 'ECONNABORTED') {
      return res.status(408).json({
        error: 'Request timeout',
        message: 'The AI request took too long to complete'
      });
    }

    return res.status(500).json({
      error: 'AI service unavailable',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Build system context for better AI responses
function buildSystemContext(context) {
  const {
    circuit,
    results,
    componentCount = 0,
    hasResults = false,
    nodeCount = 0,
    connectionCount = 0
  } = context;

  let systemContext = `You are an expert electrical engineer and circuit simulation assistant. You help users understand electronic circuits, analyze simulation results, and provide guidance on circuit design.

Current Circuit Status:
- Components: ${componentCount}
- Nodes: ${nodeCount} 
- Connections: ${connectionCount}
- Simulation Results: ${hasResults ? 'Available' : 'Not available'}`;

  if (circuit) {
    systemContext += `\n\nCurrent Circuit (SPICE Netlist):\n${circuit}`;
  }

  if (results && hasResults) {
    systemContext += `\n\nSimulation Results:`;
    
    if (results.nodes) {
      systemContext += `\nNode Voltages:`;
      Object.entries(results.nodes).forEach(([node, data]) => {
        systemContext += `\n  ${node}: ${data.voltage}V`;
      });
    }
    
    if (results.components) {
      systemContext += `\nComponent Currents:`;
      Object.entries(results.components).forEach(([component, data]) => {
        systemContext += `\n  ${component}: ${data.current}A`;
      });
    }

    if (results.operatingPoint) {
      systemContext += `\nOperating Point:`;
      systemContext += `\n  Total Power: ${results.operatingPoint.totalPower}W`;
      systemContext += `\n  Node Count: ${results.operatingPoint.nodeCount}`;
      systemContext += `\n  Component Count: ${results.operatingPoint.componentCount}`;
    }
  }

  systemContext += `\n\nInstructions:
- Provide clear, educational explanations about electronic circuits
- When discussing simulation results, reference specific values
- Suggest circuit improvements or modifications when appropriate
- Explain electronic concepts in an accessible way
- If asked about specific components, explain their function and characteristics
- Help debug circuit issues by analyzing the netlist and results

Please provide helpful, accurate, and educational responses about electronic circuits and simulation.`;

  return systemContext;
}

module.exports = router;