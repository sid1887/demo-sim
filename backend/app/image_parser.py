# backend/app/image_parser.py
"""
Hybrid Vision Processing - Combines YOLOv8, OpenCV, and Gemini Vision
Enhanced with professional circuit analysis capabilities
"""
import os
import sys
import json
import cv2
import numpy as np
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import logging

# Add parent directory to path for integrated detector
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    from integrated_circuit_detector import IntegratedCircuitDetector
    INTEGRATED_DETECTOR_AVAILABLE = True
except ImportError:
    INTEGRATED_DETECTOR_AVAILABLE = False
    logging.warning("⚠️ Integrated circuit detector not available, using fallback")

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
    """Main entry point - uses integrated detector first, then hybrid processor, otherwise falls back"""
    
    # Try integrated CircuitYOLO system first
    if INTEGRATED_DETECTOR_AVAILABLE:
        try:
            print("🎯 Using Integrated CircuitYOLO Detection System")
            
            # Initialize integrated detector
            detector = IntegratedCircuitDetector()
            
            # Analyze circuit image
            result = detector.analyze_circuit_image(image_path)
            
            # Convert to expected format for compatibility
            converted_result = _convert_integrated_format(result)
            
            # Add processing metadata
            converted_result["processing_method"] = "integrated_yolo_ai"
            converted_result["features_enabled"] = {
                "yolo_integration": result.get("yolo_available", False),
                "opencv_detection": True,
                "pattern_matching": True,
                "ai_training_pipeline": True,
                "fallback_system": result.get("integration", {}).get("fallback_active", False)
            }
            
            print(f"✅ Integrated detection found {len(converted_result.get('components', []))} components")
            return converted_result
            
        except Exception as e:
            print(f"⚠️ Integrated detection failed, trying hybrid: {e}")
    
    # Try hybrid approach (YOLO + OpenCV + Gemini)
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


def _convert_integrated_format(integrated_result: Dict[str, Any]) -> Dict[str, Any]:
    """Convert integrated detector format to expected API format"""
    
    components = []
    
    # Convert detected components
    for comp in integrated_result.get("components", []):
        component = {
            "type": _map_component_type(comp.get("type", "unknown")),
            "name": comp.get("id", f"C{len(components) + 1}"),
            "value": _estimate_component_value(comp.get("type", "unknown")),
            "nodes": [f"N{len(components) * 2 + 1}", f"N{len(components) * 2 + 2}"],
            "confidence": comp.get("confidence", 0.6),
            "position": comp.get("center", [0, 0]),
            "detection_method": comp.get("detection_method", "integrated")
        }
        components.append(component)
    
    # Add connections as components if needed
    connections = integrated_result.get("connections", [])
    for i, conn in enumerate(connections[:5]):  # Limit to 5 connections
        if conn.get("type") == "wire":
            wire_component = {
                "type": "Wire",
                "name": f"W{i + 1}",
                "value": "0",
                "nodes": [f"N{i*2 + 1}", f"N{i*2 + 2}"],
                "confidence": conn.get("confidence", 0.8),
                "length": conn.get("length", 0)
            }
            components.append(wire_component)
    
    # Create analysis summary
    analysis = integrated_result.get("analysis", {})
    
    return {
        "components": components,
        "analysis": {
            "purpose": f"Circuit with {analysis.get('total_components', 0)} components",
            "key_components": list(analysis.get("component_types", {}).keys()),
            "confidence": _calculate_average_confidence(components),
            "detection_quality": analysis.get("detection_quality", "medium"),
            "processing_time": analysis.get("processing_time", 0)
        },
        "recommendations": _generate_recommendations(integrated_result),
        "detection_meta": {
            "yolo_available": integrated_result.get("yolo_available", False),
            "total_detections": len(components),
            "methods_used": integrated_result.get("integration", {}).get("methods_used", [])
        }
    }


def _map_component_type(component_type: str) -> str:
    """Map integrated detector component types to SPICE types"""
    mapping = {
        'resistor': 'Resistor',
        'capacitor-polarized': 'Capacitor',
        'capacitor-unpolarized': 'Capacitor',
        'inductor': 'Inductor',
        'diode': 'Diode',
        'led': 'LED',
        'transistor': 'BJT',
        'integrated_circuit': 'IC',
        'operational_amplifier': 'OpAmp',
        'and': 'AND',
        'or': 'OR',
        'not': 'NOT',
        'voltage-dc': 'VoltageSource',
        'gnd': 'Ground',
        'unknown_component': 'Unknown'
    }
    
    return mapping.get(component_type, 'Unknown')


def _estimate_component_value(component_type: str) -> str:
    """Estimate typical component values"""
    value_map = {
        'resistor': '10k',
        'capacitor-polarized': '100uF',
        'capacitor-unpolarized': '100nF',
        'inductor': '1mH',
        'diode': '1N4148',
        'led': '2V',
        'transistor': '2N2222',
        'voltage-dc': '5V',
        'integrated_circuit': 'IC1'
    }
    
    return value_map.get(component_type, '1')


def _calculate_average_confidence(components: List[Dict[str, Any]]) -> float:
    """Calculate average confidence across components"""
    if not components:
        return 0.0
    
    confidences = [comp.get("confidence", 0.0) for comp in components]
    return sum(confidences) / len(confidences)


def _generate_recommendations(result: Dict[str, Any]) -> List[str]:
    """Generate recommendations based on detection results"""
    recommendations = []
    
    analysis = result.get("analysis", {})
    quality = analysis.get("detection_quality", "medium")
    
    if quality == "low":
        recommendations.extend([
            "Consider using higher resolution image",
            "Ensure good lighting and clear component visibility",
            "Remove shadows and reflections"
        ])
    elif quality == "medium":
        recommendations.extend([
            "Good detection quality - verify component values",
            "Check component connections for accuracy"
        ])
    else:
        recommendations.append("Excellent detection quality - ready for simulation")
    
    # Add YOLO-specific recommendations
    if result.get("integration", {}).get("fallback_active"):
        recommendations.append("Consider updating YOLO dependencies for enhanced detection")
    
    total_components = analysis.get("total_components", 0)
    if total_components == 0:
        recommendations.append("No components detected - check image quality")
    elif total_components > 20:
        recommendations.append("Complex circuit detected - verify all connections")
    
    return recommendations
