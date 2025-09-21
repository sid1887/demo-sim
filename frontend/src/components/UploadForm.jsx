import React, {useState} from 'react'
import { uploadImage, netlistFromJson, simulate } from '../api'

export default function UploadForm({onParsed, onNetlist, onSimResult}){
  const [busy, setBusy] = useState(false)
  const [fileName, setFileName] = useState('')

  async function handleFile(e){
    const f = e.target.files[0]
    if(!f) return
    setFileName(f.name)
    setBusy(true)
    try{
      const parsed = await uploadImage(f)
      onParsed(parsed)
      // create netlist quickly
      const netlistRes = await netlistFromJson(parsed)
      onNetlist(netlistRes.netlist)
      // run a quick DC sim
      const sim = await simulate(netlistRes.netlist, {type: 'dc'})
      onSimResult(sim)
    }catch(err){
      console.error(err)
      alert('Error parsing or simulating: ' + (err?.response?.data?.detail || err.message))
    }finally{
      setBusy(false)
    }
  }

  return (
    <div className="p-4 bg-white rounded shadow">
      <label className="block text-sm font-medium mb-2">Upload circuit image</label>
      <input type="file" accept="image/*" onChange={handleFile} />
      {busy && <div className="mt-2 text-sm text-gray-500">Processing...</div>}
      {fileName && <div className="mt-2 text-xs text-gray-600">{fileName}</div>}
    </div>
  )
}
