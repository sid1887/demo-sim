# backend/app/main.py
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
import os
import sys
import time
from dotenv import load_dotenv
from .image_parser import parse_image_via_gemini
from .netlist_generator import json_to_netlist
from .simulator import simulate_netlist
from .chat_proxy import ask_gemini_text
from .enhanced_analyzer import analyze_circuit_enhanced
import tempfile
import shutil

# Add parent directory to path for integrated detector
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from integrated_circuit_detector import IntegratedCircuitDetector
    INTEGRATED_DETECTOR_AVAILABLE = True
except ImportError:
    INTEGRATED_DETECTOR_AVAILABLE = False

# Load environment variables
load_dotenv()

app = FastAPI(
    title="CircuitSim AI Backend",
    description="AI-Powered Circuit Simulation with Enhanced Vision & Professional Analysis",
    version="2.1.0"
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
    """Enhanced image parsing with hybrid vision processing"""
    start_time = time.time()
    
    try:
        # Save uploaded file temporarily
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".png")
        contents = await file.read()
        tmp.write(contents)
        tmp.flush()
        tmp.close()
        
        # Process with enhanced vision system
        json_out = parse_image_via_gemini(tmp.name)
        
        # Add processing time
        processing_time = round((time.time() - start_time) * 1000, 2)  # ms
        json_out["processing_time_ms"] = processing_time
        
        # Perform enhanced circuit analysis if components detected
        if json_out.get("components"):
            try:
                enhanced_analysis = analyze_circuit_enhanced(json_out)
                json_out["enhanced_analysis"] = enhanced_analysis
            except Exception as e:
                print(f"Enhanced analysis failed: {e}")
                json_out["enhanced_analysis"] = {"error": "Analysis failed", "message": str(e)}
        
        # Clean up
        os.unlink(tmp.name)
        
        return JSONResponse(json_out)
        
    except Exception as e:
        # Clean up on error
        if 'tmp' in locals():
            try:
                os.unlink(tmp.name)
            except:
                pass
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/netlist_from_json")
async def netlist_from_json(parsed_json: dict):
    """Convert parsed circuit JSON to SPICE netlist"""
    try:
        netlist_text = json_to_netlist(parsed_json)
        
        # Calculate some basic metrics
        lines = netlist_text.split('\n')
        component_lines = [line for line in lines if line.strip() and not line.startswith('.') and not line.startswith('*')]
        
        return {
            "netlist": netlist_text,
            "metrics": {
                "total_lines": len(lines),
                "component_count": len(component_lines),
                "has_analysis": ".op" in netlist_text.lower() or ".tran" in netlist_text.lower()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/api/simulate")
async def api_simulate(payload: dict):
    """Enhanced simulation with better error handling and metrics"""
    start_time = time.time()
    
    try:
        netlist = payload.get("netlist")
        analysis = payload.get("analysis", {"type": "dc"})
        
        if not netlist:
            raise HTTPException(status_code=400, detail="No netlist provided")
        
        # Run simulation
        result = simulate_netlist(netlist, analysis)
        
        # Add timing and enhanced metadata
        processing_time = round((time.time() - start_time) * 1000, 2)
        
        enhanced_result = {
            **result,
            "simulation_metadata": {
                "processing_time_ms": processing_time,
                "analysis_type": analysis.get("type", "dc"),
                "netlist_lines": len(netlist.split('\n')),
                "timestamp": time.time()
            }
        }
        
        return JSONResponse(enhanced_result)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/chat")
async def api_chat(payload: dict):
    """Enhanced chat with circuit-aware context"""
    try:
        question = payload.get("question")
        context = payload.get("context", {})
        
        if not question:
            raise HTTPException(status_code=400, detail="No question provided")
        
        # Enhance context with circuit analysis if available
        enhanced_context = context.copy()
        if "enhanced_analysis" in context:
            analysis = context["enhanced_analysis"]
            enhanced_context["circuit_insights"] = {
                "circuit_type": analysis.get("circuit_analysis", {}).get("type", "unknown"),
                "confidence": analysis.get("overall_confidence", 0.5),
                "key_components": analysis.get("circuit_analysis", {}).get("key_components", [])
            }
        
        reply = ask_gemini_text(question, enhanced_context)
        
        return {
            "answer": reply,
            "context_enhanced": "enhanced_analysis" in context,
            "timestamp": time.time()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/health")
async def health_check():
    """Enhanced health check with system capabilities"""
    
    # Check available features
    features = {}
    
    try:
        from .vision_processor import YOLO_AVAILABLE, GEMINI_AVAILABLE
        features["yolo_detection"] = YOLO_AVAILABLE
        features["gemini_vision"] = GEMINI_AVAILABLE and os.getenv("GEMINI_API_KEY") is not None
    except:
        features["yolo_detection"] = False
        features["gemini_vision"] = os.getenv("GEMINI_API_KEY") is not None
    
    # Check OpenCV
    try:
        import cv2
        features["opencv_processing"] = True
        features["opencv_version"] = cv2.__version__
    except:
        features["opencv_processing"] = False
    
    # Check simulation capability
    try:
        from .simulator import simulate_netlist
        features["spice_simulation"] = True
    except:
        features["spice_simulation"] = False
    
    return {
        "status": "ok",
        "timestamp": time.time(),
        "version": "2.1.0",
        "features": features,
        "capabilities": {
            "image_analysis": features.get("gemini_vision", False) or features.get("yolo_detection", False),
            "enhanced_vision": features.get("yolo_detection", False) and features.get("opencv_processing", False),
            "circuit_simulation": features.get("spice_simulation", False),
            "ai_chat": features.get("gemini_vision", False)
        }
    }


@app.get("/api/capabilities")
async def get_capabilities():
    """Detailed system capabilities report"""
    
    capabilities = {
        "vision_processing": {
            "gemini_vision": False,
            "yolo_component_detection": False,
            "opencv_wire_detection": False
        },
        "analysis_features": {
            "component_analysis": True,
            "circuit_type_identification": True,
            "performance_prediction": True,
            "design_recommendations": True
        },
        "simulation": {
            "spice_compatible": True,
            "dc_analysis": True,
            "transient_analysis": True
        },
        "ai_features": {
            "chat_assistance": False,
            "circuit_explanation": False,
            "troubleshooting": False
        }
    }
    
    # Test actual capabilities
    try:
        from .vision_processor import YOLO_AVAILABLE, GEMINI_AVAILABLE
        capabilities["vision_processing"]["yolo_component_detection"] = YOLO_AVAILABLE
        capabilities["vision_processing"]["gemini_vision"] = GEMINI_AVAILABLE and os.getenv("GEMINI_API_KEY") is not None
        capabilities["ai_features"]["chat_assistance"] = capabilities["vision_processing"]["gemini_vision"]
        capabilities["ai_features"]["circuit_explanation"] = capabilities["vision_processing"]["gemini_vision"]
        capabilities["ai_features"]["troubleshooting"] = capabilities["vision_processing"]["gemini_vision"]
    except:
        pass
    
    try:
        import cv2
        capabilities["vision_processing"]["opencv_wire_detection"] = True
    except:
        pass
    
    # Add integrated circuit detector capabilities
    if INTEGRATED_DETECTOR_AVAILABLE:
        capabilities["vision_processing"]["integrated_yolo_ai"] = True
        capabilities["analysis_features"]["ai_training_pipeline"] = True
        capabilities["ai_features"]["yolo_circuitry_integration"] = True
    
    return capabilities


@app.get("/api/system/status")
async def get_system_status():
    """Enhanced system status with integrated detection capabilities"""
    
    features = {}
    
    # Check Gemini Vision capability
    try:
        api_key = os.getenv("GEMINI_API_KEY")
        features["gemini_vision"] = api_key is not None
    except:
        features["gemini_vision"] = False
    
    # Check YOLO capability 
    try:
        import ultralytics
        features["yolo_detection"] = True
    except:
        features["yolo_detection"] = False
    
    # Check OpenCV processing
    try:
        import cv2
        features["opencv_processing"] = True
    except:
        features["opencv_processing"] = False
    
    # Check Integrated CircuitYOLO system
    features["integrated_circuit_detector"] = INTEGRATED_DETECTOR_AVAILABLE
    
    if INTEGRATED_DETECTOR_AVAILABLE:
        try:
            detector = IntegratedCircuitDetector()
            system_status = detector.get_system_status()
            features.update({
                "yolo_integration": system_status.get("yolo_available", False),
                "ai_training_pipeline": system_status.get("training_pipeline_ready", False),
                "circuit_component_classes": system_status.get("total_circuit_classes", 0),
                "synthetic_data_generation": system_status.get("synthetic_data_generation", False)
            })
        except Exception as e:
            features["integrated_detector_error"] = str(e)
    
    # Check simulation capability
    try:
        from .simulator import simulate_netlist
        features["spice_simulation"] = True
    except:
        features["spice_simulation"] = False
    
    return {
        "status": "ok",
        "timestamp": time.time(),
        "version": "2.1.0",
        "features": features,
        "capabilities": {
            "image_analysis": features.get("gemini_vision", False) or features.get("yolo_detection", False) or features.get("integrated_circuit_detector", False),
            "enhanced_vision": features.get("integrated_circuit_detector", False) or (features.get("yolo_detection", False) and features.get("opencv_processing", False)),
            "circuit_simulation": features.get("spice_simulation", False),
            "ai_chat": features.get("gemini_vision", False),
            "yolo_circuitry_integration": features.get("integrated_circuit_detector", False)
        }
    }


@app.get("/api/circuit/components")
async def get_supported_components():
    """Get list of supported circuit components"""
    
    if INTEGRATED_DETECTOR_AVAILABLE:
        try:
            detector = IntegratedCircuitDetector()
            components_info = detector.get_supported_components()
            return {
                "success": True,
                "total_classes": components_info["total_classes"],
                "categories": components_info["categories"],
                "circuit_classes": components_info["circuit_classes"],
                "source": "integrated_detector"
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e),
                "fallback": True,
                "message": "Using fallback component list"
            }
    
    # Fallback component list
    return {
        "success": True,
        "total_classes": 15,
        "categories": ["passive", "semiconductor", "active", "logic", "power", "connection"],
        "circuit_classes": {
            "resistor": {"category": "passive", "symbol": "R"},
            "capacitor": {"category": "passive", "symbol": "C"},
            "inductor": {"category": "passive", "symbol": "L"},
            "diode": {"category": "semiconductor", "symbol": "D"},
            "transistor": {"category": "semiconductor", "symbol": "Q"},
            "voltage_source": {"category": "power", "symbol": "V"},
            "ground": {"category": "power", "symbol": "GND"}
        },
        "source": "fallback"
    }


@app.post("/api/circuit/train")
async def setup_training_environment():
    """Set up AI training environment for circuit detection"""
    
    if not INTEGRATED_DETECTOR_AVAILABLE:
        raise HTTPException(
            status_code=503, 
            detail="Integrated circuit detector not available"
        )
    
    try:
        detector = IntegratedCircuitDetector()
        result = detector.setup_training_environment()
        
        return {
            "success": result["success"],
            "message": result["message"],
            "training_environment": {
                "dataset_path": result.get("dataset_path"),
                "models_path": result.get("models_path"),
                "synthetic_images": result.get("synthetic_images", 0),
                "circuit_classes": result.get("circuit_classes", 0)
            }
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Training environment setup failed: {str(e)}"
        )


if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
