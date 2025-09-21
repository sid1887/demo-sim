import React, {useState, useRef, useEffect} from 'react'
import { chat } from '../api'

export default function ChatWindow({netlist, parsed}){
  const [q, setQ] = useState('')
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef(null)
  const historyRef = useRef(null)

  async function send(){
    if(!q.trim() || isLoading) return
    
    setIsLoading(true)
    const context = netlist ? {netlist} : {parsed}
    
    try {
      const res = await chat(q, context)
      setHistory(h => [...h, {
        id: Date.now() + Math.random(), // Generate unique ID for each message
        q: q.trim(), 
        a: res.answer, 
        timestamp: Date.now()
      }])
      setQ('')
      
      // Auto-scroll to bottom after new message
      setTimeout(() => {
        if (historyRef.current) {
          historyRef.current.scrollTop = historyRef.current.scrollHeight
        }
      }, 100)
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Enter key press
  function handleKeyPress(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  return (
    <div className="mt-4 p-4 bg-white rounded" role="region" aria-label="Circuit AI Chat">
      <h4 className="font-medium mb-2" id="chat-title">Chat</h4>
      <div 
        ref={historyRef}
        className="h-40 overflow-auto mb-2 border p-2 bg-gray-50 rounded"
        role="log"
        aria-live="polite"
        aria-labelledby="chat-title"
        aria-describedby="chat-description"
      >
        {history.length === 0 ? (
          <div className="text-gray-500 text-sm italic">
            Start a conversation about your circuit...
          </div>
        ) : (
          history.map((m) => (
            <div key={m.id} className="mb-3 last:mb-0">
              <div className="text-sm font-semibold text-blue-600 mb-1">
                <span aria-label="Your question">You: {m.q}</span>
              </div>
              <div className="text-sm text-gray-700 pl-2 border-l-2 border-blue-100">
                <span aria-label="AI response">AI: {m.a}</span>
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="text-sm text-gray-500 italic" aria-live="polite">
            AI is thinking...
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <label htmlFor="chat-input" className="sr-only">
          Ask a question about your circuit
        </label>
        <input 
          id="chat-input"
          ref={inputRef}
          value={q} 
          onChange={(e)=>setQ(e.target.value)}
          onKeyPress={handleKeyPress}
          disabled={isLoading}
          className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
          placeholder="Ask about R1, voltages, or changes..." 
          aria-describedby="chat-description"
        />
        <button 
          onClick={send} 
          disabled={!q.trim() || isLoading}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label={isLoading ? 'Sending message...' : 'Send message'}
        >
          {isLoading ? '...' : 'Send'}
        </button>
      </div>
      <div id="chat-description" className="sr-only">
        Ask questions about your circuit components, voltages, or suggested changes. Press Enter to send.
      </div>
    </div>
  )
}
