import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export async function uploadImage(file) {
  const fd = new FormData();
  fd.append('file', file)
  const res = await axios.post(`${API_BASE}/api/parse`, fd, { headers: {'Content-Type': 'multipart/form-data'} })
  return res.data
}

export async function netlistFromJson(parsedJson) {
  const res = await axios.post(`${API_BASE}/api/netlist_from_json`, parsedJson)
  return res.data
}

export async function simulate(netlist, analysis={type:'dc'}) {
  const res = await axios.post(`${API_BASE}/api/simulate`, {netlist, analysis})
  return res.data
}

export async function chat(question, context) {
  const res = await axios.post(`${API_BASE}/api/chat`, {question, context})
  return res.data
}
