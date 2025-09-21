import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, X, Minimize2, Sparkles, Zap, AlertCircle } from 'lucide-react'
import { geminiAPI, apiUtils } from '../api/geminiClient'
import { generateNetlist } from '../utils/netlistGenerator'
import toast from 'react-hot-toast'
import '../styles/glass.css'

const SAMPLE_QUESTIONS = [
  "Explain how this circuit works",
  "What's the voltage at each node?",
  "How can I improve this design?",
  "What happens if I change R1 to 2kΩ?",
  "Calculate the total power consumption",
]

export default function ChatPanel({ 
  nodes, 
  edges, 
  simulationResults, 
  selectedNode,
  onClose, 
  apiAvailable = false 
}) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: `🤖 Hello! I'm your AI circuit assistant powered by Gemini AI. 

I can help you:
• Understand how your circuit works
• Analyze simulation results  
• Suggest design improvements
• Explain component functions
• Troubleshoot issues

${apiAvailable ? 'Ask me anything about your circuit!' : '⚠️ Backend server is offline - please check connection.'}`,
      timestamp: new Date(),
    }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Update initial message when API status changes
  useEffect(() => {
    if (messages.length === 1) {
      setMessages([{
        id: 1,
        type: 'ai',
        content: `🤖 Hello! I'm your AI circuit assistant powered by Gemini AI. 

I can help you:
• Understand how your circuit works
• Analyze simulation results  
• Suggest design improvements
• Explain component functions
• Troubleshoot issues

${apiAvailable ? 'Ask me anything about your circuit!' : '⚠️ Backend server is offline - please check connection.'}`,
        timestamp: new Date(),
      }])
    }
  }, [apiAvailable])

  const sendMessage = async () => {
    if (!input.trim()) return

    if (!apiAvailable) {
      toast.error('Backend server is not available')
      return
    }

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      // Build comprehensive context
      const netlist = nodes.length > 0 ? generateNetlist(nodes, edges) : null
      const context = {
        circuit: netlist,
        results: simulationResults?.results,
        componentCount: nodes.length,
        nodeCount: edges.length,
        connectionCount: edges.length,
        hasResults: !!simulationResults,
        selectedComponent: selectedNode ? {
          type: selectedNode.type,
          label: selectedNode.data?.label,
          value: selectedNode.data?.value
        } : null
      }

      console.log('Sending to Gemini:', { prompt: userMessage.content, context })

      // Call real Gemini API
      const response = await geminiAPI.askQuestion(userMessage.content, context)
      
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: response.response,
        timestamp: new Date(),
        metadata: response.metadata
      }

      setMessages(prev => [...prev, aiMessage])
      
    } catch (error) {
      console.error('Chat error:', error)
      const errorInfo = apiUtils.formatAIError(error)
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: `❌ ${errorInfo.title}

${errorInfo.message}

💡 ${errorInfo.suggestion}`,
        timestamp: new Date(),
        isError: true,
      }
      
      setMessages(prev => [...prev, errorMessage])
      toast.error(errorInfo.title)
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const useSampleQuestion = (question) => {
    setInput(question)
    inputRef.current?.focus()
  }

  const handleQuickAnalysis = async (type) => {
    if (!apiAvailable) {
      toast.error('Backend server is not available')
      return
    }

    if (nodes.length === 0) {
      toast.error('Please add components to your circuit first')
      return
    }

    let question = ''
    switch (type) {
      case 'explain':
        question = 'Please explain how this circuit works and what each component does.'
        break
      case 'analyze':
        question = simulationResults ? 
          'Please analyze these simulation results and explain what they mean.' :
          'Please analyze this circuit design and suggest any improvements.'
        break
      case 'troubleshoot':
        question = 'Are there any potential issues or problems with this circuit design?'
        break
    }

    setInput(question)
    setTimeout(() => sendMessage(), 100)
  }

  if (isMinimized) {
    return (
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className="h-12 glass flex items-center justify-between px-4 cursor-pointer border border-white/10"
        onClick={() => setIsMinimized(false)}
      >
        <div className="flex items-center space-x-2">
          <Bot className="w-4 h-4 text-green-400" />
          <span className="font-medium text-white">AI Assistant</span>
        </div>
        <Sparkles className="w-4 h-4 text-green-400" />
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="h-full glass flex flex-col border border-white/10"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center border border-green-500/30">
            <Bot className="w-5 h-5 text-green-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white">AI Circuit Assistant</h3>
            <p className="text-xs text-white/60">
              {apiAvailable ? 'Powered by Gemini AI' : 'Offline'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!apiAvailable && (
            <AlertCircle className="w-4 h-4 text-red-400" />
          )}
          <button
            onClick={() => setIsMinimized(true)}
            className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/60 hover:text-white"
          >
            <Minimize2 className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/10 rounded-md transition-colors text-white/60 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="p-3 border-b border-white/10">
        <div className="flex space-x-2">
          <button
            onClick={() => handleQuickAnalysis('explain')}
            disabled={!apiAvailable || nodes.length === 0}
            className="px-3 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full hover:bg-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            ✨ Explain Circuit
          </button>
          <button
            onClick={() => handleQuickAnalysis('analyze')}
            disabled={!apiAvailable || nodes.length === 0}
            className="px-3 py-1 text-xs bg-green-500/20 text-green-300 rounded-full hover:bg-green-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            🔍 Analyze
          </button>
          <button
            onClick={() => handleQuickAnalysis('troubleshoot')}
            disabled={!apiAvailable || nodes.length === 0}
            className="px-3 py-1 text-xs bg-yellow-500/20 text-yellow-300 rounded-full hover:bg-yellow-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            🔧 Debug
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {/* Typing Indicator */}
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex items-center space-x-2"
          >
            <Bot className="w-6 h-6 text-green-400" />
            <div className="bg-white/10 rounded-lg px-3 py-2">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
              </div>
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Sample Questions */}
      {messages.length <= 1 && apiAvailable && (
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-white/60 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.slice(0, 3).map((question, index) => (
              <button
                key={`sample-question-${index}-${question.substring(0, 10)}`}
                onClick={() => useSampleQuestion(question)}
                className="text-xs bg-white/5 text-white/80 px-2 py-1 rounded-full hover:bg-white/10 transition-colors border border-white/10"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex space-x-2">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={apiAvailable ? "Ask about your circuit..." : "Backend offline..."}
            className="flex-1 px-3 py-2 bg-white/5 border border-white/15 rounded-lg 
                     text-white placeholder-white/50 
                     focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50
                     disabled:opacity-50 disabled:cursor-not-allowed
                     backdrop-blur-sm"
            disabled={isTyping || !apiAvailable}
          />
          <motion.button
            whileHover={{ scale: apiAvailable && input.trim() && !isTyping ? 1.05 : 1 }}
            whileTap={{ scale: 0.95 }}
            onClick={sendMessage}
            disabled={!input.trim() || isTyping || !apiAvailable}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              input.trim() && !isTyping && apiAvailable
                ? 'bg-green-500/80 hover:bg-green-500 text-white shadow-lg backdrop-blur-sm'
                : 'bg-white/10 text-white/50 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

function ChatMessage({ message }) {
  const isAI = message.type === 'ai'
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`flex ${isAI ? 'justify-start' : 'justify-end'}`}
    >
      <div className={`flex max-w-[85%] ${isAI ? 'flex-row' : 'flex-row-reverse'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isAI ? 'mr-3' : 'ml-3'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isAI 
              ? 'bg-green-500/20 border border-green-500/30' 
              : 'bg-blue-500/20 border border-blue-500/30'
          }`}>
            {isAI ? (
              <Bot className="w-4 h-4 text-green-400" />
            ) : (
              <User className="w-4 h-4 text-blue-400" />
            )}
          </div>
        </div>

        {/* Message */}
        <div className={`rounded-lg px-4 py-2 backdrop-blur-sm ${
          isAI 
            ? message.isError
              ? 'bg-red-500/20 text-red-300 border border-red-500/30'
              : 'bg-white/10 text-white/90 border border-white/10'
            : 'bg-blue-500/80 text-white border border-blue-500/50'
        }`}>
          <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
          <p className={`text-xs mt-2 opacity-70 ${
            isAI ? 'text-white/50' : 'text-blue-100'
          }`}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {message.metadata && (
              <span className="ml-2">• {message.metadata.model || 'AI'}</span>
            )}
          </p>
        </div>
      </div>
    </motion.div>
  )
}