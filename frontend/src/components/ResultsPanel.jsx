import React from 'react'

export default function ResultsPanel({simResult}){
  if(!simResult) return <div className="p-4 bg-white rounded h-64">No results yet.</div>
  return (
    <div className="p-4 my-4 bg-white rounded">
      <h3 className="font-medium">Simulation Results</h3>
      <pre className="text-xs overflow-auto max-h-64">{JSON.stringify(simResult, null, 2)}</pre>
    </div>
  )
}
