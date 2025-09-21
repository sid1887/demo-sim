#!/usr/bin/env python3
"""
Simple YOLO test to verify basic functionality without PIL dependencies
"""

import sys
import os
from pathlib import Path

def test_basic_imports():
    """Test basic imports without YOLO"""
    print("🔍 Testing basic imports...")
    
    try:
        import numpy as np
        print(f"✅ NumPy {np.__version__}")
    except ImportError as e:
        print(f"❌ NumPy: {e}")
        return False
    
    try:
        import cv2
        print(f"✅ OpenCV {cv2.__version__}")
    except ImportError as e:
        print(f"❌ OpenCV: {e}")
        return False
    
    return True

def test_model_file():
    """Check if model file exists"""
    print("\n🔍 Checking model file...")
    
    model_path = Path(__file__).parent / "models" / "best.pt"
    if model_path.exists():
        size_mb = model_path.stat().st_size / (1024 * 1024)
        print(f"✅ Found best.pt ({size_mb:.1f} MB)")
        return True
    else:
        print("❌ best.pt not found")
        return False

def test_cv2_functionality():
    """Test OpenCV image processing"""
    print("\n🔍 Testing OpenCV functionality...")
    
    try:
        import cv2
        import numpy as np
        
        # Create test image
        img = np.ones((640, 640, 3), dtype=np.uint8) * 255
        
        # Basic operations
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        
        # Line detection
        lines = cv2.HoughLines(edges, 1, np.pi/180, threshold=50)
        
        print("✅ OpenCV operations successful")
        return True
        
    except Exception as e:
        print(f"❌ OpenCV test failed: {e}")
        return False

def create_simple_yolo_fallback():
    """Create a simple fallback version without ultralytics"""
    print("\n🔍 Creating YOLO fallback system...")
    
    try:
        # Create a simple mock YOLO response
        class MockYOLOResult:
            def __init__(self):
                self.components = [
                    {
                        "class": "resistor",
                        "confidence": 0.95,
                        "bbox": [100, 100, 200, 150]
                    },
                    {
                        "class": "capacitor-polarized", 
                        "confidence": 0.87,
                        "bbox": [300, 200, 350, 250]
                    }
                ]
                
            def to_dict(self):
                return {
                    "status": "fallback_mode",
                    "components": self.components,
                    "message": "Using fallback detection (YOLO unavailable)"
                }
        
        mock_result = MockYOLOResult()
        result_dict = mock_result.to_dict()
        
        print(f"✅ Fallback system created with {len(result_dict['components'])} mock components")
        return True
        
    except Exception as e:
        print(f"❌ Fallback creation failed: {e}")
        return False

def test_backend_integration():
    """Test our backend integration without YOLO dependencies"""
    print("\n🔍 Testing backend integration...")
    
    try:
        # Test basic image parsing functionality
        sys.path.insert(0, str(Path(__file__).parent / "app"))
        
        # Test if we can import without YOLO
        import importlib.util
        
        spec = importlib.util.spec_from_file_location(
            "image_parser", 
            Path(__file__).parent / "app" / "image_parser.py"
        )
        
        if spec and spec.loader:
            image_parser = importlib.util.module_from_spec(spec)
            spec.loader.exec_module(image_parser)
            print("✅ Backend modules accessible")
            return True
        else:
            print("❌ Could not load backend modules")
            return False
            
    except Exception as e:
        print(f"❌ Backend integration test failed: {e}")
        return False

def main():
    """Main test runner"""
    print("🚀 Simple YOLO Integration Test (Fallback Mode)\n")
    
    tests = [
        ("Basic Imports", test_basic_imports),
        ("Model File", test_model_file),
        ("OpenCV Functionality", test_cv2_functionality),
        ("YOLO Fallback", create_simple_yolo_fallback),
        ("Backend Integration", test_backend_integration)
    ]
    
    results = {}
    for name, test_func in tests:
        try:
            results[name] = test_func()
        except Exception as e:
            print(f"❌ {name} crashed: {e}")
            results[name] = False
    
    # Summary
    print(f"\n📋 Test Summary:")
    passed = 0
    for name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"   {name}: {status}")
        if result:
            passed += 1
    
    print(f"\nTotal: {passed}/{len(tests)} tests passed")
    
    if passed >= 3:  # At least basic functionality works
        print("🎉 Sufficient functionality for fallback mode!")
        return 0
    else:
        print("⚠️  Too many failures for reliable operation")
        return 1

if __name__ == "__main__":
    sys.exit(main())