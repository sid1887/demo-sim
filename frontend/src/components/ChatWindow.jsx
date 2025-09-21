import React, {useState} from 'react'
import { chat } from '../api'

export default function ChatWindow({netlist, parsed}){
  const [q, setQ] = useState('')
  const [history, setHistory] = useState([])

  async function send(){
    if(!q) return
    const context = netlist ? {netlist} : {parsed}
    const res = await chat(q, context)
    setHistory(h => [...h, {q, a: res.answer}])
    setQ('')
  }

  return (
    <div className="mt-4 p-4 bg-white rounded">
      <h4 className="font-medium mb-2">Chat</h4>
      <div className="h-40 overflow-auto mb-2 border p-2">
        {history.map((m, i) => (
          <div key={i} className="mb-2">
            <div className="text-sm font-semibold">You: {m.q}</div>
            <div className="text-sm text-gray-700">AI: {m.a}</div>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={q} onChange={(e)=>setQ(e.target.value)} className="flex-1 p-2 border rounded" placeholder="Ask about R1, voltages, or changes..." />
        <button onClick={send} className="px-3 py-2 bg-blue-600 text-white rounded">Send</button>
      </div>
    </div>
  )
}
