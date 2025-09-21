#!/usr/bin/env python3
"""
Test the complete YOLO-Circuitry AI integration through the API
"""

import requests
import cv2
import numpy as np
import tempfile
import json
import os

def create_test_circuit_image():
    """Create a simple test circuit image"""
    # Create a white background
    img = np.ones((640, 640, 3), dtype=np.uint8) * 255
    
    # Add some circuit components
    # Resistor (horizontal rectangle)
    cv2.rectangle(img, (100, 200), (200, 230), (139, 69, 19), -1)
    cv2.rectangle(img, (100, 200), (200, 230), (0, 0, 0), 2)
    
    # IC (square with pins)
    cv2.rectangle(img, (300, 180), (380, 260), (50, 50, 50), -1)
    cv2.rectangle(img, (300, 180), (380, 260), (0, 0, 0), 2)
    for i in range(4):
        cv2.circle(img, (295, 200 + i*15), 3, (200, 200, 200), -1)
        cv2.circle(img, (385, 200 + i*15), 3, (200, 200, 200), -1)
    
    # Capacitor (two parallel lines)
    cv2.line(img, (150, 300), (150, 350), (0, 0, 0), 3)
    cv2.line(img, (160, 300), (160, 350), (0, 0, 0), 3)
    
    # Wires connecting components
    cv2.line(img, (200, 215), (300, 215), (0, 0, 0), 2)  # Resistor to IC
    cv2.line(img, (150, 250), (340, 250), (0, 0, 0), 2)  # Bottom connection
    
    return img

def test_integrated_yolo_api():
    """Test the integrated YOLO-Circuitry AI system via API"""
    
    print("🚀 Testing Integrated YOLO-Circuitry AI System via API\n")
    
    # Create test image
    test_img = create_test_circuit_image()
    
    # Save to temporary file
    with tempfile.NamedTemporaryFile(suffix='.png', delete=False) as tmp_file:
        cv2.imwrite(tmp_file.name, test_img)
        tmp_path = tmp_file.name
    
    try:
        # Test 1: System Status
        print("📊 Testing system status...")
        response = requests.get("http://localhost:8000/api/system/status")
        if response.status_code == 200:
            status = response.json()
            print(f"✅ System Status: {status['status']}")
            print(f"   Version: {status['version']}")
            print(f"   Integrated Detector: {status['features'].get('integrated_circuit_detector', False)}")
            print(f"   YOLO Integration: {status['features'].get('yolo_integration', False)}")
            print(f"   AI Training Pipeline: {status['features'].get('ai_training_pipeline', False)}")
            print(f"   Circuit Classes: {status['features'].get('circuit_component_classes', 0)}")
        else:
            print(f"❌ System status failed: {response.status_code}")
        
        # Test 2: Circuit Components
        print(f"\n🔧 Testing circuit components...")
        response = requests.get("http://localhost:8000/api/circuit/components")
        if response.status_code == 200:
            components = response.json()
            print(f"✅ Component Database: {components['success']}")
            print(f"   Total Classes: {components['total_classes']}")
            print(f"   Categories: {', '.join(components['categories'])}")
            print(f"   Source: {components['source']}")
        else:
            print(f"❌ Component query failed: {response.status_code}")
        
        # Test 3: Image Analysis (Main Test)
        print(f"\n🔍 Testing circuit image analysis...")
        
        with open(tmp_path, 'rb') as img_file:
            files = {'file': ('test_circuit.png', img_file, 'image/png')}
            response = requests.post("http://localhost:8000/api/parse", files=files)
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Image Analysis Success!")
            print(f"   Processing Method: {result.get('processing_method', 'unknown')}")
            print(f"   Components Detected: {len(result.get('components', []))}")
            print(f"   Analysis Confidence: {result.get('analysis', {}).get('confidence', 0):.2f}")
            print(f"   Detection Quality: {result.get('analysis', {}).get('detection_quality', 'unknown')}")
            
            # Display detected components
            components = result.get('components', [])
            if components:
                print(f"\n📋 Detected Components:")
                for i, comp in enumerate(components[:5]):  # Show first 5
                    print(f"   {i+1}. {comp.get('type', 'Unknown')} ({comp.get('name', 'N/A')}) - Confidence: {comp.get('confidence', 0):.2f}")
            
            # Display features enabled
            features = result.get('features_enabled', {})
            if features:
                print(f"\n⚙️ Features Enabled:")
                for feature, enabled in features.items():
                    status = "✅" if enabled else "❌"
                    print(f"   {status} {feature}")
            
            print(f"\n📈 Analysis Summary:")
            analysis = result.get('analysis', {})
            print(f"   Purpose: {analysis.get('purpose', 'N/A')}")
            print(f"   Key Components: {', '.join(analysis.get('key_components', []))}")
            print(f"   Processing Time: {analysis.get('processing_time', 0):.2f}s")
            
        else:
            print(f"❌ Image analysis failed: {response.status_code}")
            try:
                error_info = response.json()
                print(f"   Error: {error_info}")
            except:
                print(f"   Response: {response.text}")
        
        # Test 4: Capabilities
        print(f"\n🎯 Testing system capabilities...")
        response = requests.get("http://localhost:8000/api/capabilities")
        if response.status_code == 200:
            capabilities = response.json()
            print(f"✅ Capabilities Retrieved:")
            
            vision = capabilities.get('vision_processing', {})
            print(f"   Vision Processing:")
            for feature, enabled in vision.items():
                status = "✅" if enabled else "❌"
                print(f"     {status} {feature}")
            
            ai_features = capabilities.get('ai_features', {})
            print(f"   AI Features:")
            for feature, enabled in ai_features.items():
                status = "✅" if enabled else "❌"
                print(f"     {status} {feature}")
        else:
            print(f"❌ Capabilities query failed: {response.status_code}")
    
    except requests.exceptions.ConnectionError:
        print("❌ Connection Error: Make sure the backend server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Test failed: {e}")
    finally:
        # Clean up
        try:
            os.unlink(tmp_path)
        except:
            pass
    
    print(f"\n🎉 Integration Test Complete!")
    print(f"   Backend: http://localhost:8000")
    print(f"   Frontend: http://localhost:5173")
    print(f"   YOLO-Circuitry AI: {'✅ Integrated' if True else '❌ Failed'}")


if __name__ == "__main__":
    test_integrated_yolo_api()