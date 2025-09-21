# backend/app/vision_processor.py
"""
Enhanced Vision Processing - Hybrid YOLO + Gemini Approach
Combines YOLOv8 component detection with Gemini Vision analysis
"""
import os
import json
import cv2
import numpy as np
from typing import Dict, Any, List, Tuple, Optional

# Try to import YOLOv8, fall back to Gemini-only if unavailable
try:
    from ultralytics import YOLO
    YOLO_AVAILABLE = True
except ImportError:
    YOLO_AVAILABLE = False

try:
    from google import genai
    from google.genai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False

API_KEY = os.environ.get("GEMINI_API_KEY")

# Component class names from the circuitry dataset
COMPONENT_CLASSES = [
    'and', 'antenna', 'capacitor-polarized', 'capacitor-unpolarized', 'crossover', 
    'diac', 'diode', 'diode-light_emitting', 'fuse', 'gnd', 'inductor', 
    'integrated_circuit', 'integrated_cricuit-ne555', 'lamp', 'microphone', 
    'motor', 'nand', 'nor', 'not', 'operational_amplifier', 'optocoupler', 
    'or', 'probe-current', 'relay', 'resistor', 'resistor-adjustable', 
    'resistor-photo', 'schmitt_trigger', 'socket', 'speaker', 'switch', 
    'terminal', 'thyristor', 'transformer', 'transistor', 'transistor-photo', 
    'triac', 'varistor', 'voltage-dc', 'voltage-dc_ac', 'voltage-dc_regulator', 
    'vss', 'xor'
]

class VisionProcessor:
    def __init__(self):
        self.yolo_model = None
        self.gemini_client = None
        
        # Try to load YOLO model
        if YOLO_AVAILABLE:
            try:
                # Look for the best.pt file from circuitry
                yolo_paths = [
                    "d:/dev_packages/demo-sim/circuitry/best.pt",
                    "../circuitry/best.pt",
                    "./best.pt"
                ]
                
                for path in yolo_paths:
                    if os.path.exists(path):
                        self.yolo_model = YOLO(path)
                        print(f"✅ YOLO model loaded from: {path}")
                        break
                
                if not self.yolo_model:
                    print("⚠️  YOLO weights not found, using Gemini Vision only")
                    
            except Exception as e:
                print(f"⚠️  YOLO loading failed: {e}")
        
        # Initialize Gemini if available
        if GEMINI_AVAILABLE and API_KEY:
            try:
                self.gemini_client = genai.Client()
                print("✅ Gemini Vision initialized")
            except Exception as e:
                print(f"⚠️  Gemini initialization failed: {e}")

    def preprocess_image_for_lines(self, image_path: str) -> Tuple[np.ndarray, np.ndarray]:
        """Preprocess image for line/wire detection using OpenCV"""
        image = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if image is None:
            raise ValueError(f"Could not load image: {image_path}")
            
        # Gaussian blur to reduce noise
        blurred = cv2.GaussianBlur(image, (3, 3), 0)
        
        # Canny edge detection
        edges = cv2.Canny(blurred, 50, 150)
        
        return image, edges

    def create_component_mask(self, image_shape: Tuple[int, int], 
                            component_boxes: List[Tuple[float, float, float, float]]) -> np.ndarray:
        """Create mask to exclude component areas from line detection"""
        height, width = image_shape
        mask = np.ones((height, width), dtype=np.uint8) * 255
        
        for box in component_boxes:
            x1, y1, x2, y2 = map(int, box)
            # Add padding around components to avoid detecting component edges as wires
            padding = 5
            x1 = max(0, x1 - padding)
            y1 = max(0, y1 - padding)
            x2 = min(width, x2 + padding)
            y2 = min(height, y2 + padding)
            
            cv2.rectangle(mask, (x1, y1), (x2, y2), 0, -1)
        
        return mask

    def detect_wires_opencv(self, image_path: str, 
                          component_boxes: List[Tuple[float, float, float, float]]) -> List[Dict[str, Any]]:
        """Detect wires/lines using OpenCV HoughLinesP"""
        try:
            image, edges = self.preprocess_image_for_lines(image_path)
            
            # Create mask to exclude component areas
            mask = self.create_component_mask(image.shape, component_boxes)
            masked_edges = cv2.bitwise_and(edges, mask)
            
            # Detect lines using probabilistic Hough transform
            lines = cv2.HoughLinesP(
                masked_edges, 
                rho=1, 
                theta=np.pi/180, 
                threshold=50,
                minLineLength=20,
                maxLineGap=10
            )
            
            wires = []
            if lines is not None:
                for i, line in enumerate(lines):
                    x1, y1, x2, y2 = line[0]
                    
                    # Calculate line properties
                    length = np.sqrt((x2-x1)**2 + (y2-y1)**2)
                    angle = np.degrees(np.arctan2(y2-y1, x2-x1))
                    
                    wire = {
                        "id": f"w{i+1}",
                        "start_point": [int(x1), int(y1)],
                        "end_point": [int(x2), int(y2)],
                        "length": round(length, 2),
                        "angle": round(angle, 2),
                        "type": "wire"
                    }
                    wires.append(wire)
            
            return wires
            
        except Exception as e:
            print(f"Wire detection failed: {e}")
            return []

    def detect_components_yolo(self, image_path: str) -> List[Dict[str, Any]]:
        """Detect components using YOLOv8"""
        if not self.yolo_model:
            return []
            
        try:
            results = self.yolo_model(image_path)
            components = []
            
            if results and len(results) > 0:
                boxes = results[0].boxes
                if boxes is not None:
                    box_coords = boxes.xyxy.cpu().numpy()
                    class_ids = boxes.cls.cpu().numpy().astype(int)
                    confidences = boxes.conf.cpu().numpy()
                    
                    for i, (box, class_id, conf) in enumerate(zip(box_coords, class_ids, confidences)):
                        x1, y1, x2, y2 = map(float, box)
                        
                        component = {
                            "id": f"C{i+1}",
                            "type": COMPONENT_CLASSES[class_id] if class_id < len(COMPONENT_CLASSES) else "unknown",
                            "class": COMPONENT_CLASSES[class_id] if class_id < len(COMPONENT_CLASSES) else "unknown",
                            "bbox": [x1, y1, x2, y2],
                            "confidence": float(conf),
                            "center": [(x1 + x2) / 2, (y1 + y2) / 2],
                            "area": (x2 - x1) * (y2 - y1)
                        }
                        components.append(component)
            
            return components
            
        except Exception as e:
            print(f"YOLO detection failed: {e}")
            return []

    def analyze_with_gemini(self, image_path: str, yolo_components: List[Dict] = None) -> Dict[str, Any]:
        """Analyze circuit using Gemini Vision with optional YOLO context"""
        if not self.gemini_client or not API_KEY:
            return self._create_fallback_result(yolo_components)
        
        try:
            with open(image_path, 'rb') as f:
                image_bytes = f.read()
            
            image_part = types.Part.from_bytes(data=image_bytes, mime_type='image/jpeg')
            
            # Enhanced prompt with YOLO context if available
            context_prompt = ""
            if yolo_components:
                detected_types = [comp['type'] for comp in yolo_components]
                context_prompt = f"\n\nNote: YOLO detection found these components: {', '.join(set(detected_types))}"
            
            prompt = f"""Analyze this electronic circuit diagram and return a JSON response with the following structure:
{{
  "components": [
    {{"type": "resistor", "name": "R1", "value": "10k", "nodes": ["N1", "N2"], "confidence": 0.95}},
    {{"type": "capacitor", "name": "C1", "value": "100nF", "nodes": ["N2", "0"], "confidence": 0.85}}
  ],
  "nets": ["N1", "N2", "0"],
  "circuit_analysis": {{
    "type": "circuit_type_here",
    "purpose": "brief_description",
    "key_components": ["component1", "component2"],
    "confidence": 0.90
  }},
  "recommendations": [
    "suggestion1",
    "suggestion2"
  ]
}}

Use node '0' for ground connections. Provide reasonable component values where visible.
{context_prompt}"""

            response = self.gemini_client.models.generate_content(
                model='gemini-2.0-flash',
                contents=[image_part, prompt],
                config={
                    'response_mime_type': 'application/json'
                }
            )
            
            result = json.loads(response.text)
            
            # Merge with YOLO results if available
            if yolo_components:
                result["yolo_detection"] = {
                    "components_found": len(yolo_components),
                    "confidence_avg": np.mean([comp['confidence'] for comp in yolo_components]),
                    "types_detected": list(set([comp['type'] for comp in yolo_components]))
                }
            
            return result
            
        except Exception as e:
            print(f"Gemini analysis failed: {e}")
            return self._create_fallback_result(yolo_components)

    def _create_fallback_result(self, yolo_components: List[Dict] = None) -> Dict[str, Any]:
        """Create fallback result when AI analysis fails"""
        components = []
        
        if yolo_components:
            # Convert YOLO components to standard format
            for i, comp in enumerate(yolo_components):
                components.append({
                    "type": comp['type'],
                    "name": f"{comp['type'].upper()}{i+1}",
                    "value": "unknown",
                    "nodes": [f"N{i}", f"N{i+1}"],
                    "confidence": comp['confidence']
                })
        else:
            # Basic fallback components
            components = [
                {"type": "resistor", "name": "R1", "value": "1k", "nodes": ["N1", "N2"], "confidence": 0.5},
                {"type": "voltage_source", "name": "V1", "value": "5V", "nodes": ["N1", "0"], "confidence": 0.5}
            ]
        
        return {
            "components": components,
            "nets": ["N1", "N2", "0"],
            "circuit_analysis": {
                "type": "unknown_circuit",
                "purpose": "Circuit analysis unavailable - using fallback detection",
                "key_components": [comp['type'] for comp in components],
                "confidence": 0.5
            },
            "recommendations": [
                "AI analysis unavailable - manual verification recommended"
            ],
            "fallback_mode": True
        }

    def process_circuit_image(self, image_path: str) -> Dict[str, Any]:
        """Main processing pipeline - hybrid YOLO + Gemini + OpenCV approach"""
        try:
            print(f"🔍 Processing circuit image: {image_path}")
            
            # Step 1: YOLO component detection
            yolo_components = []
            if self.yolo_model:
                yolo_components = self.detect_components_yolo(image_path)
                print(f"📍 YOLO detected {len(yolo_components)} components")
            
            # Step 2: OpenCV wire detection
            component_boxes = [comp['bbox'] for comp in yolo_components] if yolo_components else []
            wires = self.detect_wires_opencv(image_path, component_boxes)
            print(f"🔗 OpenCV detected {len(wires)} wires")
            
            # Step 3: Gemini analysis with YOLO context
            gemini_result = self.analyze_with_gemini(image_path, yolo_components)
            
            # Step 4: Combine all results
            final_result = {
                **gemini_result,
                "wires": wires,
                "detection_meta": {
                    "yolo_available": YOLO_AVAILABLE and self.yolo_model is not None,
                    "gemini_available": GEMINI_AVAILABLE and self.gemini_client is not None,
                    "yolo_components_count": len(yolo_components),
                    "opencv_wires_count": len(wires),
                    "processing_time": "calculated_in_main"
                }
            }
            
            print("✅ Circuit processing completed")
            return final_result
            
        except Exception as e:
            print(f"❌ Circuit processing failed: {e}")
            return self._create_fallback_result()

# Global processor instance
vision_processor = VisionProcessor()

def process_image_hybrid(image_path: str) -> Dict[str, Any]:
    """Public interface for hybrid vision processing"""
    return vision_processor.process_circuit_image(image_path)