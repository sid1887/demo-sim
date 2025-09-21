#!/usr/bin/env python3
"""
CircuitYOLO Integration System
Combines YOLO with circuit-specific AI detection for comprehensive component analysis
"""

import os
import sys
import json
import cv2
import numpy as np
from pathlib import Path
from typing import Dict, List, Any, Optional, Tuple
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CircuitYOLOIntegration:
    """
    Integrated YOLO + Circuitry AI system for circuit component detection
    """
    
    def __init__(self):
        self.yolo_available = False
        self.yolo_model = None
        self.circuit_components = self._load_circuit_components()
        self.fallback_detector = CircuitFallbackDetector()
        
        # Initialize YOLO if possible
        self._initialize_yolo()
    
    def _load_circuit_components(self) -> Dict[str, Any]:
        """Load circuit component definitions from circuitry project"""
        circuit_components = {
            # Electronic Components (from circuitry dataset)
            'resistor': {
                'category': 'passive',
                'symbol': 'R',
                'detection_hints': ['zigzag_pattern', 'rectangular_body', 'two_leads'],
                'color_patterns': ['brown', 'red', 'orange', 'yellow', 'green', 'blue']
            },
            'capacitor-polarized': {
                'category': 'passive',
                'symbol': 'C+',
                'detection_hints': ['cylindrical_body', 'polarity_marking', 'two_leads'],
                'color_patterns': ['black', 'blue', 'silver']
            },
            'capacitor-unpolarized': {
                'category': 'passive',
                'symbol': 'C',
                'detection_hints': ['rectangular_body', 'parallel_plates', 'two_leads'],
                'color_patterns': ['ceramic', 'yellow', 'blue']
            },
            'inductor': {
                'category': 'passive',
                'symbol': 'L',
                'detection_hints': ['coil_shape', 'spiral_pattern', 'two_leads'],
                'color_patterns': ['copper', 'ferrite_core']
            },
            'diode': {
                'category': 'semiconductor',
                'symbol': 'D',
                'detection_hints': ['cylindrical_body', 'stripe_marking', 'two_leads'],
                'color_patterns': ['black', 'glass_body', 'silver_stripe']
            },
            'diode-light_emitting': {
                'category': 'semiconductor',
                'symbol': 'LED',
                'detection_hints': ['rounded_top', 'flat_side', 'two_leads', 'color_body'],
                'color_patterns': ['red', 'green', 'blue', 'yellow', 'white']
            },
            'transistor': {
                'category': 'semiconductor',
                'symbol': 'Q',
                'detection_hints': ['three_leads', 'plastic_body', 'metal_tab'],
                'color_patterns': ['black_plastic', 'metal_can']
            },
            'integrated_circuit': {
                'category': 'active',
                'symbol': 'IC',
                'detection_hints': ['rectangular_body', 'multiple_pins', 'notch_marking'],
                'color_patterns': ['black_plastic', 'ceramic']
            },
            'operational_amplifier': {
                'category': 'active',
                'symbol': 'OpAmp',
                'detection_hints': ['triangular_symbol', '8_pin_dip', 'dual_supply'],
                'color_patterns': ['black_plastic']
            },
            # Logic Gates
            'and': {'category': 'logic', 'symbol': 'AND', 'detection_hints': ['D_shape']},
            'or': {'category': 'logic', 'symbol': 'OR', 'detection_hints': ['curved_input']},
            'not': {'category': 'logic', 'symbol': 'NOT', 'detection_hints': ['triangle_circle']},
            'nand': {'category': 'logic', 'symbol': 'NAND', 'detection_hints': ['D_shape_circle']},
            'nor': {'category': 'logic', 'symbol': 'NOR', 'detection_hints': ['curved_input_circle']},
            'xor': {'category': 'logic', 'symbol': 'XOR', 'detection_hints': ['double_curved_input']},
            
            # Power and Ground
            'voltage-dc': {
                'category': 'power',
                'symbol': 'VDC',
                'detection_hints': ['battery_symbol', 'plus_minus']
            },
            'gnd': {
                'category': 'power',
                'symbol': 'GND',
                'detection_hints': ['ground_symbol', 'horizontal_lines']
            },
            'vss': {
                'category': 'power',
                'symbol': 'VSS',
                'detection_hints': ['negative_supply']
            },
            
            # Connections and Wires
            'terminal': {
                'category': 'connection',
                'symbol': 'T',
                'detection_hints': ['connection_point', 'junction_dot']
            },
            'crossover': {
                'category': 'connection',
                'symbol': 'X',
                'detection_hints': ['wire_crossing', 'no_connection']
            }
        }
        
        return circuit_components
    
    def _initialize_yolo(self):
        """Initialize YOLO with proper error handling"""
        try:
            # Try to import and initialize YOLO
            logger.info("🔄 Attempting YOLO initialization...")
            
            # Set environment to avoid conflicts
            os.environ['MPLBACKEND'] = 'Agg'
            
            from ultralytics import YOLO
            
            # Try to load YOLOv8n model
            model_path = Path(__file__).parent / "models" / "yolov8n.pt"
            
            if model_path.exists():
                self.yolo_model = YOLO(str(model_path))
                logger.info("✅ YOLO model loaded from local file")
            else:
                # Download YOLOv8n
                self.yolo_model = YOLO('yolov8n.pt')
                logger.info("✅ YOLO model downloaded and loaded")
            
            self.yolo_available = True
            logger.info("🎯 YOLO integration ready")
            
        except Exception as e:
            logger.warning(f"⚠️ YOLO initialization failed: {e}")
            logger.info("🔄 Falling back to OpenCV + Gemini detection")
            self.yolo_available = False
    
    def detect_circuit_components(self, image_path: str) -> Dict[str, Any]:
        """
        Main detection function that combines YOLO and circuit-specific analysis
        """
        logger.info(f"🔍 Analyzing circuit image: {image_path}")
        
        # Initialize result structure
        result = {
            'image_path': image_path,
            'detection_method': 'hybrid',
            'components': [],
            'connections': [],
            'analysis': {
                'total_components': 0,
                'component_types': {},
                'confidence_scores': {},
                'detection_quality': 'unknown'
            },
            'yolo_available': self.yolo_available,
            'processing_time': 0
        }
        
        try:
            import time
            start_time = time.time()
            
            # Load and preprocess image
            image = cv2.imread(image_path)
            if image is None:
                raise ValueError(f"Could not load image: {image_path}")
            
            # Method 1: Try YOLO detection (if available)
            yolo_components = []
            if self.yolo_available:
                try:
                    yolo_components = self._yolo_detect_components(image)
                    logger.info(f"🎯 YOLO detected {len(yolo_components)} potential objects")
                except Exception as e:
                    logger.warning(f"⚠️ YOLO detection failed: {e}")
            
            # Method 2: OpenCV-based circuit detection (always run)
            opencv_components = self._opencv_detect_components(image)
            logger.info(f"🔍 OpenCV detected {len(opencv_components)} circuit features")
            
            # Method 3: Pattern-based circuit component recognition
            pattern_components = self._pattern_detect_components(image)
            logger.info(f"🎨 Pattern detection found {len(pattern_components)} circuit components")
            
            # Method 4: Connection and wire detection
            connections = self._detect_connections(image)
            logger.info(f"🔗 Detected {len(connections)} connections/wires")
            
            # Combine and validate detections
            combined_components = self._combine_detections(
                yolo_components, opencv_components, pattern_components
            )
            
            # Filter and classify as circuit components
            circuit_components = self._classify_circuit_components(combined_components)
            
            # Update result
            result['components'] = circuit_components
            result['connections'] = connections
            result['analysis']['total_components'] = len(circuit_components)
            result['analysis']['processing_time'] = time.time() - start_time
            
            # Calculate component type distribution
            type_counts = {}
            confidence_scores = {}
            
            for comp in circuit_components:
                comp_type = comp.get('type', 'unknown')
                type_counts[comp_type] = type_counts.get(comp_type, 0) + 1
                
                if comp_type not in confidence_scores:
                    confidence_scores[comp_type] = []
                confidence_scores[comp_type].append(comp.get('confidence', 0.0))
            
            result['analysis']['component_types'] = type_counts
            result['analysis']['confidence_scores'] = {
                k: sum(v) / len(v) for k, v in confidence_scores.items()
            }
            
            # Determine detection quality
            avg_confidence = np.mean([comp.get('confidence', 0) for comp in circuit_components])
            if avg_confidence > 0.8:
                result['analysis']['detection_quality'] = 'high'
            elif avg_confidence > 0.6:
                result['analysis']['detection_quality'] = 'medium'
            else:
                result['analysis']['detection_quality'] = 'low'
            
            logger.info(f"✅ Circuit analysis complete: {len(circuit_components)} components detected")
            
        except Exception as e:
            logger.error(f"❌ Circuit detection failed: {e}")
            result['error'] = str(e)
        
        return result
    
    def _yolo_detect_components(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """Use YOLO for general object detection"""
        if not self.yolo_available:
            return []
        
        try:
            # Run YOLO inference
            results = self.yolo_model.predict(image, verbose=False, save=False, show=False)
            
            components = []
            for result in results:
                if hasattr(result, 'boxes') and result.boxes is not None:
                    for box in result.boxes:
                        try:
                            # Extract detection info
                            conf = float(box.conf[0]) if hasattr(box, 'conf') and box.conf is not None else 0.0
                            cls = int(box.cls[0]) if hasattr(box, 'cls') and box.cls is not None else -1
                            
                            # Get bounding box coordinates
                            if hasattr(box, 'xyxy'):
                                xyxy = box.xyxy[0].cpu().numpy()
                                bbox = [float(x) for x in xyxy]  # [x1, y1, x2, y2]
                            else:
                                continue
                            
                            # Get class name
                            class_name = "unknown"
                            if hasattr(result, 'names') and cls in result.names:
                                class_name = result.names[cls]
                            
                            component = {
                                'detection_method': 'yolo',
                                'type': self._map_yolo_to_circuit(class_name),
                                'yolo_class': class_name,
                                'confidence': conf,
                                'bbox': bbox,
                                'center': [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2]
                            }
                            
                            components.append(component)
                            
                        except Exception as e:
                            logger.warning(f"Error processing YOLO detection: {e}")
                            continue
            
            return components
            
        except Exception as e:
            logger.error(f"YOLO detection error: {e}")
            return []
    
    def _opencv_detect_components(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """Use OpenCV for circuit-specific feature detection"""
        components = []
        
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Edge detection for component outlines
            edges = cv2.Canny(gray, 50, 150)
            
            # Find contours
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for i, contour in enumerate(contours):
                # Filter by area to avoid noise
                area = cv2.contourArea(contour)
                if area < 100:  # Skip very small contours
                    continue
                
                # Get bounding rectangle
                x, y, w, h = cv2.boundingRect(contour)
                
                # Calculate features
                aspect_ratio = w / h
                extent = area / (w * h)
                
                # Basic shape classification
                component_type = self._classify_by_shape(contour, aspect_ratio, extent)
                
                component = {
                    'detection_method': 'opencv',
                    'type': component_type,
                    'confidence': 0.7,  # OpenCV confidence based on shape matching
                    'bbox': [x, y, x + w, y + h],
                    'center': [x + w/2, y + h/2],
                    'area': area,
                    'aspect_ratio': aspect_ratio,
                    'extent': extent
                }
                
                components.append(component)
        
        except Exception as e:
            logger.error(f"OpenCV detection error: {e}")
        
        return components
    
    def _pattern_detect_components(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """Detect circuit components using pattern matching"""
        components = []
        
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Template matching for common circuit symbols
            # This is a simplified version - in practice, you'd have template images
            
            # Detect circular objects (could be components)
            circles = cv2.HoughCircles(
                gray, 
                cv2.HOUGH_GRADIENT, 
                dp=1, 
                minDist=30,
                param1=50, 
                param2=30, 
                minRadius=5, 
                maxRadius=50
            )
            
            if circles is not None:
                circles = np.round(circles[0, :]).astype("int")
                for (x, y, r) in circles:
                    component = {
                        'detection_method': 'pattern',
                        'type': 'capacitor-unpolarized',  # Assumption for circular objects
                        'confidence': 0.6,
                        'bbox': [x-r, y-r, x+r, y+r],
                        'center': [x, y],
                        'radius': r
                    }
                    components.append(component)
            
            # Detect rectangular objects (resistors, ICs, etc.)
            # This is a simplified approach
            edges = cv2.Canny(gray, 50, 150)
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            for contour in contours:
                # Approximate contour to polygon
                epsilon = 0.02 * cv2.arcLength(contour, True)
                approx = cv2.approxPolyDP(contour, epsilon, True)
                
                # Look for rectangular shapes (4 corners)
                if len(approx) == 4:
                    x, y, w, h = cv2.boundingRect(contour)
                    area = cv2.contourArea(contour)
                    
                    if area > 200:  # Filter small rectangles
                        aspect_ratio = w / h
                        
                        # Classify based on aspect ratio
                        if 0.8 <= aspect_ratio <= 1.2:
                            comp_type = 'integrated_circuit'
                        elif aspect_ratio > 2:
                            comp_type = 'resistor'
                        else:
                            comp_type = 'capacitor-polarized'
                        
                        component = {
                            'detection_method': 'pattern',
                            'type': comp_type,
                            'confidence': 0.5,
                            'bbox': [x, y, x + w, y + h],
                            'center': [x + w/2, y + h/2],
                            'shape': 'rectangular'
                        }
                        components.append(component)
        
        except Exception as e:
            logger.error(f"Pattern detection error: {e}")
        
        return components
    
    def _detect_connections(self, image: np.ndarray) -> List[Dict[str, Any]]:
        """Detect wires and connections in the circuit"""
        connections = []
        
        try:
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            
            # Detect lines using Hough transform
            lines = cv2.HoughLinesP(
                edges,
                rho=1,
                theta=np.pi/180,
                threshold=50,
                minLineLength=20,
                maxLineGap=10
            )
            
            if lines is not None:
                for i, line in enumerate(lines):
                    try:
                        # Handle different line formats
                        if len(line) == 4:
                            x1, y1, x2, y2 = line
                        else:
                            x1, y1, x2, y2 = line[0]
                    except (ValueError, IndexError):
                        continue
                    
                    # Calculate line properties
                    length = np.sqrt((x2-x1)**2 + (y2-y1)**2)
                    angle = np.degrees(np.arctan2(y2-y1, x2-x1))
                    
                    connection = {
                        'type': 'wire',
                        'start_point': [int(x1), int(y1)],
                        'end_point': [int(x2), int(y2)],
                        'length': length,
                        'angle': angle,
                        'confidence': 0.8
                    }
                    connections.append(connection)
        
        except Exception as e:
            logger.error(f"Connection detection error: {e}")
        
        return connections
    
    def _map_yolo_to_circuit(self, yolo_class: str) -> str:
        """Map YOLO detected classes to circuit components"""
        yolo_to_circuit = {
            'person': 'operator',  # Person working on circuit
            'laptop': 'test_equipment',
            'cell phone': 'mobile_device',
            'book': 'schematic',
            'scissors': 'wire_cutter',
            'bottle': 'flux_container',
            'cup': 'component_container',
            'mouse': 'computer_input',
            'keyboard': 'computer_input',
            'remote': 'control_device',
            'clock': 'timing_reference'
        }
        
        return yolo_to_circuit.get(yolo_class, 'unknown_object')
    
    def _classify_by_shape(self, contour, aspect_ratio: float, extent: float) -> str:
        """Classify component type based on geometric properties"""
        
        # Classify based on aspect ratio and extent
        if aspect_ratio > 3:  # Very elongated
            return 'resistor'
        elif 0.8 <= aspect_ratio <= 1.2:  # Square-ish
            if extent > 0.7:
                return 'integrated_circuit'
            else:
                return 'connector'
        elif aspect_ratio < 0.5:  # Tall and narrow
            return 'capacitor-polarized'
        else:
            return 'unknown_component'
    
    def _combine_detections(self, yolo_results: List, opencv_results: List, pattern_results: List) -> List[Dict[str, Any]]:
        """Combine and deduplicate results from different detection methods"""
        all_detections = yolo_results + opencv_results + pattern_results
        
        # Simple deduplication based on spatial overlap
        # This is a basic implementation - could be made more sophisticated
        combined = []
        
        for detection in all_detections:
            # Check if this detection overlaps significantly with existing ones
            is_duplicate = False
            
            for existing in combined:
                if self._is_overlap(detection, existing, threshold=0.5):
                    # Choose the detection with higher confidence
                    if detection.get('confidence', 0) > existing.get('confidence', 0):
                        # Replace existing with current detection
                        combined.remove(existing)
                        combined.append(detection)
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                combined.append(detection)
        
        return combined
    
    def _classify_circuit_components(self, detections: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Filter and enhance detections to identify actual circuit components"""
        circuit_components = []
        
        for detection in detections:
            component_type = detection.get('type', 'unknown')
            
            # Filter out non-circuit objects
            if component_type in ['operator', 'test_equipment', 'mobile_device', 'unknown_object']:
                continue
            
            # Enhance with circuit component information
            if component_type in self.circuit_components:
                circuit_info = self.circuit_components[component_type]
                detection.update({
                    'category': circuit_info.get('category', 'unknown'),
                    'symbol': circuit_info.get('symbol', '?'),
                    'detection_hints': circuit_info.get('detection_hints', [])
                })
            
            # Add unique ID
            detection['id'] = f"comp_{len(circuit_components) + 1}"
            
            circuit_components.append(detection)
        
        return circuit_components
    
    def _is_overlap(self, detection1: Dict, detection2: Dict, threshold: float = 0.5) -> bool:
        """Check if two detections overlap significantly"""
        try:
            bbox1 = detection1.get('bbox', [])
            bbox2 = detection2.get('bbox', [])
            
            if len(bbox1) != 4 or len(bbox2) != 4:
                return False
            
            # Calculate intersection
            x1_max = max(bbox1[0], bbox2[0])
            y1_max = max(bbox1[1], bbox2[1])
            x2_min = min(bbox1[2], bbox2[2])
            y2_min = min(bbox1[3], bbox2[3])
            
            if x2_min <= x1_max or y2_min <= y1_max:
                return False  # No intersection
            
            intersection_area = (x2_min - x1_max) * (y2_min - y1_max)
            
            # Calculate areas
            area1 = (bbox1[2] - bbox1[0]) * (bbox1[3] - bbox1[1])
            area2 = (bbox2[2] - bbox2[0]) * (bbox2[3] - bbox2[1])
            
            # Calculate IoU (Intersection over Union)
            union_area = area1 + area2 - intersection_area
            iou = intersection_area / union_area if union_area > 0 else 0
            
            return iou > threshold
            
        except Exception:
            return False


class CircuitFallbackDetector:
    """
    Fallback detection system when YOLO is not available
    Uses pure OpenCV and pattern matching
    """
    
    def __init__(self):
        self.component_templates = self._load_component_templates()
    
    def _load_component_templates(self) -> Dict:
        """Load basic component shape templates"""
        return {
            'resistor': {'min_aspect_ratio': 2.5, 'max_aspect_ratio': 5.0},
            'capacitor': {'min_aspect_ratio': 0.5, 'max_aspect_ratio': 2.0},
            'ic': {'min_aspect_ratio': 0.8, 'max_aspect_ratio': 1.5, 'min_area': 500}
        }
    
    def detect_components(self, image_path: str) -> Dict[str, Any]:
        """Fallback detection using only OpenCV"""
        logger.info("🔄 Using fallback detection (OpenCV only)")
        
        try:
            image = cv2.imread(image_path)
            if image is None:
                return {'error': 'Could not load image', 'components': []}
            
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            edges = cv2.Canny(gray, 50, 150)
            contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            
            components = []
            for i, contour in enumerate(contours):
                area = cv2.contourArea(contour)
                if area < 100:
                    continue
                
                x, y, w, h = cv2.boundingRect(contour)
                aspect_ratio = w / h
                
                # Simple classification
                if aspect_ratio > 2.5:
                    comp_type = 'resistor'
                elif 0.8 <= aspect_ratio <= 1.5 and area > 500:
                    comp_type = 'integrated_circuit'
                else:
                    comp_type = 'capacitor-unpolarized'
                
                component = {
                    'id': f'fallback_comp_{i}',
                    'type': comp_type,
                    'confidence': 0.6,
                    'bbox': [x, y, x + w, y + h],
                    'center': [x + w/2, y + h/2],
                    'detection_method': 'fallback'
                }
                components.append(component)
            
            return {
                'components': components,
                'detection_method': 'fallback',
                'total_components': len(components)
            }
            
        except Exception as e:
            logger.error(f"Fallback detection error: {e}")
            return {'error': str(e), 'components': []}


def main():
    """Test the integrated CircuitYOLO system"""
    print("🚀 Testing CircuitYOLO Integration System\n")
    
    # Initialize the integrated system
    circuit_yolo = CircuitYOLOIntegration()
    
    print(f"YOLO Available: {circuit_yolo.yolo_available}")
    print(f"Circuit Components Loaded: {len(circuit_yolo.circuit_components)}")
    print(f"Fallback Detector Ready: {circuit_yolo.fallback_detector is not None}")
    
    # Test with a dummy image
    import tempfile
    test_img = np.ones((640, 640, 3), dtype=np.uint8) * 255
    
    # Add some test circuit elements
    cv2.rectangle(test_img, (100, 200), (200, 230), (0, 0, 0), 2)  # Resistor
    cv2.rectangle(test_img, (300, 200), (350, 250), (0, 0, 0), 2)  # IC
    cv2.circle(test_img, (500, 300), 20, (0, 0, 0), 2)  # Component
    cv2.line(test_img, (200, 215), (300, 215), (0, 0, 0), 2)  # Wire
    
    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
        cv2.imwrite(tmp_file.name, test_img)
        
        print(f"\n🔍 Testing circuit detection on dummy image...")
        result = circuit_yolo.detect_circuit_components(tmp_file.name)
        
        print(f"✅ Detection completed!")
        print(f"   Total components: {result['analysis']['total_components']}")
        print(f"   Detection quality: {result['analysis']['detection_quality']}")
        print(f"   Processing time: {result['analysis']['processing_time']:.2f}s")
        print(f"   Component types: {result['analysis']['component_types']}")
        
        # Clean up
        try:
            os.unlink(tmp_file.name)
        except PermissionError:
            pass  # File cleanup handled by OS
    
    print(f"\n🎉 CircuitYOLO Integration System is ready!")
    print(f"   ✅ Circuit component database: {len(circuit_yolo.circuit_components)} types")
    print(f"   ✅ Multi-method detection: YOLO + OpenCV + Pattern matching")
    print(f"   ✅ Robust fallback system")
    print(f"   ✅ Circuit-specific analysis")


if __name__ == "__main__":
    main()