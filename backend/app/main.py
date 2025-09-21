# backend/app/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
from dotenv import load_dotenv
from .image_parser import parse_image_via_gemini
from .netlist_generator import json_to_netlist
from .simulator import simulate_netlist
from .chat_proxy import ask_gemini_text
import tempfile
import shutil

# Load environment variables
load_dotenv()

app = FastAPI(
    title="CircuitSim AI Backend",
    description="AI-Powered Circuit Simulation with Gemini Vision & PySpice",
    version="2.0.0"
)

# Enhanced CORS configuration
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/api/parse")
async def parse_image(file: UploadFile = File(...)):
    # save temp
    try:
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
        contents = await file.read()
        tmp.write(contents)
        tmp.flush()
        tmp.close()
        json_out = parse_image_via_gemini(tmp.name)
        return JSONResponse(json_out)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/netlist_from_json")
async def netlist_from_json(parsed_json: dict):
    try:
        netlist_text = json_to_netlist(parsed_json)
        return {"netlist": netlist_text}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/simulate")
async def api_simulate(payload: dict):
    # payload expected: {"netlist": "...", "analysis": {"type": "dc"/"transient", ...}}
    try:
        netlist = payload.get("netlist")
        analysis = payload.get("analysis", {"type": "dc"})
        result = simulate_netlist(netlist, analysis)
        return JSONResponse(result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat")
async def api_chat(payload: dict):
    # payload: {"question": "...", "context": {"netlist": "..." or "parsed_json": {...}} }
    try:
        question = payload.get("question")
        context = payload.get("context", {})
        reply = ask_gemini_text(question, context)
        return {"answer": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
