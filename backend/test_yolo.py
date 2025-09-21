#!/usr/bin/env python3
"""
Test script to verify YOLO integration is working correctly
"""

import os
import sys
from pathlib import Path

def test_imports():
    """Test that all required modules can be imported"""
    print("🔍 Testing module imports...")
    
    try:
        import numpy as np
        print("✅ numpy imported successfully!")
        print(f"   Version: {np.__version__}")
    except ImportError as e:
        print(f"❌ numpy import failed: {e}")
        return False
    
    try:
        import cv2
        print("✅ OpenCV imported successfully!")
        print(f"   Version: {cv2.__version__}")
    except ImportError as e:
        print(f"❌ OpenCV import failed: {e}")
        return False
    
    try:
        from ultralytics import YOLO
        print("✅ Ultralytics YOLO imported successfully!")
    except ImportError as e:
        print(f"❌ YOLO import failed: {e}")
        print("   This might be due to dependency conflicts.")
        return False
    
    return True

def test_model_file():
    """Test that the YOLO model file exists"""
    print("\n🔍 Testing YOLO model file...")
    
    model_path = Path(__file__).parent / "models" / "best.pt"
    print(f"📁 Looking for model at: {model_path}")
    
    if model_path.exists():
        file_size = model_path.stat().st_size / (1024 * 1024)  # MB
        print(f"✅ Model file found! Size: {file_size:.1f} MB")
        return True
    else:
        print("❌ Model file not found!")
        return False

def test_yolo_loading():
    """Test YOLO model loading (if imports work)"""
    print("\n🔍 Testing YOLO model loading...")
    
    try:
        from ultralytics import YOLO
        model_path = Path(__file__).parent / "models" / "best.pt"
        
        print("🔄 Loading YOLO model...")
        model = YOLO(str(model_path))
        print("✅ YOLO model loaded successfully!")
        
        # Test with a simple dummy image
        print("🎨 Testing with dummy image...")
        import numpy as np
        test_img = np.ones((640, 640, 3), dtype=np.uint8) * 255
        
        print("🔄 Running inference...")
        results = model(test_img, verbose=False)
        print(f"✅ Inference completed! Got {len(results)} result(s)")
        
        return True
        
    except Exception as e:
        print(f"❌ YOLO loading/testing failed: {e}")
        return False

def test_opencv():
    """Test basic OpenCV functionality"""
    print("\n🔍 Testing OpenCV functionality...")
    
    try:
        import cv2
        import numpy as np
        
        # Create test image
        img = np.ones((100, 100, 3), dtype=np.uint8) * 255
        
        # Test basic operations
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 50, 150)
        lines = cv2.HoughLines(edges, 1, np.pi/180, threshold=50)
        
        print("✅ OpenCV operations successful!")
        return True
        
    except Exception as e:
        print(f"❌ OpenCV test failed: {e}")
        return False

def test_vision_processor():
    """Test our vision processor module"""
    print("\n🔍 Testing vision processor module...")
    
    try:
        # Add the app directory to the path
        sys.path.insert(0, str(Path(__file__).parent / "app"))
        
        from vision_processor import VisionProcessor
        processor = VisionProcessor()
        print("✅ Vision processor imported and initialized!")
        
        # Test dummy image processing
        import numpy as np
        test_img = np.ones((640, 640, 3), dtype=np.uint8) * 255
        
        print("🔄 Testing image processing...")
        # Create a temporary test image file
        import tempfile
        with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp_file:
            import cv2
            cv2.imwrite(tmp_file.name, test_img)
            result = processor.process_circuit_image(tmp_file.name)
            
        print(f"✅ Image processing completed! Got result with {len(result.get('components', []))} components")
        
        return True
        
    except Exception as e:
        print(f"❌ Vision processor test failed: {e}")
        return False

def main():
    """Main test function"""
    print("🚀 Starting YOLO + OpenCV integration tests...\n")
    
    # Run all tests
    tests = [
        ("Module Imports", test_imports),
        ("Model File", test_model_file),
        ("OpenCV", test_opencv),
        ("YOLO Loading", test_yolo_loading),
        ("Vision Processor", test_vision_processor)
    ]
    
    results = {}
    
    for test_name, test_func in tests:
        try:
            results[test_name] = test_func()
        except Exception as e:
            print(f"❌ {test_name} test crashed: {e}")
            results[test_name] = False
    
    # Print summary
    print(f"\n📋 Test Results Summary:")
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"   {test_name}: {status}")
    
    passed_count = sum(results.values())
    total_count = len(results)
    
    if passed_count == total_count:
        print(f"\n🎉 All {total_count} tests passed! YOLO integration is ready!")
        return 0
    elif passed_count > 0:
        print(f"\n⚠️  {passed_count}/{total_count} tests passed. Some functionality may work.")
        return 1
    else:
        print(f"\n❌ All tests failed. Please check the errors above.")
        return 2

if __name__ == "__main__":
    sys.exit(main())