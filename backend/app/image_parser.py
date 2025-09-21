# backend/app/image_parser.py
"""
Hybrid Vision Processing - Combines YOLOv8, OpenCV, and Gemini Vision
Enhanced with professional circuit analysis capabilities
"""
import os
import json
from typing import Any, Dict

# Try to import the new hybrid processor
try:
    from .vision_processor import process_image_hybrid
    HYBRID_AVAILABLE = True
except ImportError:
    HYBRID_AVAILABLE = False

# Fallback to original Gemini-only approach
try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except Exception:
    GEMINI_AVAILABLE = False

API_KEY = os.environ.get("GEMINI_API_KEY")


def parse_image_via_gemini_original(image_path: str) -> Dict[str, Any]:
    """Original Gemini-only approach (fallback)"""
    if not API_KEY or not GEMINI_AVAILABLE:
        return {
            "components": [
                {"type": "VoltageSource", "name": "V1", "value": "12V", "nodes": ["N1", "0"], "confidence": 0.7},
                {"type": "Resistor", "name": "R1", "value": "10k", "nodes": ["N1", "N2"], "confidence": 0.7},
                {"type": "Resistor", "name": "R2", "value": "10k", "nodes": ["N2", "0"], "confidence": 0.7},
            ],
            "nets": ["N1", "N2", "0"],
            "circuit_analysis": {
                "type": "voltage_divider",
                "purpose": "Mock circuit - no API key available",
                "key_components": ["voltage_source", "resistors"],
                "confidence": 0.5
            },
            "recommendations": ["Set up GEMINI_API_KEY to enable real analysis"],
            "fallback_mode": True,
            "notes": "Mocked: No GEMINI_API_KEY or google-genai SDK available."
        }

    try:
        with open(image_path, 'rb') as f:
            image_bytes = f.read()

        client = genai.Client()
        image_part = types.Part.from_bytes(data=image_bytes, mime_type='image/png')

        prompt = """Extract all circuit components and nets from the attached schematic image. 
        Return only valid JSON with enhanced structure: 
        {
          "components": [
            {"type": "Resistor", "name": "R1", "value": "10k", "nodes": ["N1", "N2"], "confidence": 0.95}
          ],
          "nets": ["N1", "N2", "0"],
          "circuit_analysis": {
            "type": "circuit_type",
            "purpose": "brief_description", 
            "key_components": ["resistor", "capacitor"],
            "confidence": 0.90
          },
          "recommendations": ["suggestion1", "suggestion2"]
        }
        Use node id '0' for ground. Do not add commentary."""

        response = client.models.generate_content(
            model='gemini-2.0-flash',
            contents=[image_part, prompt],
            config={'response_mime_type': 'application/json'}
        )

        text = response.text
        if isinstance(text, (bytes, bytearray)):
            text = text.decode('utf-8')

        parsed = json.loads(text)
        
        # Ensure all components have confidence scores
        for component in parsed.get('components', []):
            if 'confidence' not in component:
                component['confidence'] = 0.8
        
        return parsed
        
    except Exception as e:
        raise RuntimeError(f"Gemini Vision call failed: {e}")


def parse_image_via_gemini(image_path: str) -> Dict[str, Any]:
    """Main entry point - uses hybrid processor if available, otherwise falls back"""
    
    # Try hybrid approach first (YOLO + OpenCV + Gemini)
    if HYBRID_AVAILABLE:
        try:
            print("🚀 Using hybrid vision processing (YOLO + OpenCV + Gemini)")
            result = process_image_hybrid(image_path)
            
            # Add processing metadata
            result["processing_method"] = "hybrid"
            result["features_enabled"] = {
                "yolo_component_detection": result.get("detection_meta", {}).get("yolo_available", False),
                "opencv_wire_detection": True,
                "gemini_analysis": result.get("detection_meta", {}).get("gemini_available", False)
            }
            
            return result
            
        except Exception as e:
            print(f"⚠️  Hybrid processing failed, falling back to Gemini-only: {e}")
    
    # Fallback to original Gemini-only approach
    print("🔄 Using Gemini-only vision processing")
    result = parse_image_via_gemini_original(image_path)
    result["processing_method"] = "gemini_only"
    result["features_enabled"] = {
        "yolo_component_detection": False,
        "opencv_wire_detection": False,
        "gemini_analysis": GEMINI_AVAILABLE and API_KEY is not None
    }
    
    return result
