import React, {useMemo} from 'react'
import ReactFlow, { Background, Controls } from 'reactflow'
import 'reactflow/dist/style.css'

export default function SchematicView({parsed}){
  if(!parsed) return (
    <div className="p-4 bg-white rounded h-96">No schematic loaded yet.</div>
  )

  // Build nodes and edges from parsed JSON
  const { nodes, edges } = useMemo(() => {
    const nodeIds = new Map()
    const nodesArr = []
    const edgesArr = []

    // gather unique node ids from components
    let idx = 0
    const comps = parsed.components || []
    comps.forEach(c => {
      const n = c.nodes || []
      n.forEach((nid) => {
        if(!nodeIds.has(nid)){
          const x = (idx % 5) * 180
          const y = Math.floor(idx / 5) * 100
          nodeIds.set(nid, true)
          nodesArr.push({ id: nid, data: { label: nid }, position: { x, y } })
          idx += 1
        }
      })
    })

    // create edges for each component connecting first two nodes (if available)
    comps.forEach((c, i) => {
      const n = c.nodes || []
      if(n.length >= 2){
        edgesArr.push({ id: c.name || `e${i}`, source: n[0], target: n[1], label: `${c.name || ''} ${c.value || ''}` })
      }
    })

    return { nodes: nodesArr, edges: edgesArr }
  }, [parsed])

  return (
    <div className="p-4 bg-white rounded" style={{ height: 520 }}>
      <h3 className="font-medium mb-2">Parsed schematic</h3>
      <div style={{ width: '100%', height: 460 }}>
        <ReactFlow nodes={nodes} edges={edges} fitView>
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  )
}
