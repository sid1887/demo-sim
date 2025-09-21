#!/usr/bin/env python3
"""
Direct YOLO Test - Minimal imports to avoid conflicts
"""

import os
import sys

def test_torch_first():
    """Test PyTorch first to isolate issues"""
    print("🔍 Testing PyTorch separately...")
    
    try:
        import torch
        print(f"✅ PyTorch imported: {torch.__version__}")
        
        # Test tensor creation
        x = torch.randn(2, 3)
        print(f"✅ Tensor creation works: {x.shape}")
        
        return True
        
    except Exception as e:
        print(f"❌ PyTorch failed: {e}")
        return False

def test_numpy_torch_compat():
    """Test NumPy-PyTorch compatibility"""
    print("\n🔍 Testing NumPy-PyTorch compatibility...")
    
    try:
        import numpy as np
        import torch
        
        # Create numpy array
        np_array = np.array([[1, 2, 3], [4, 5, 6]], dtype=np.float32)
        print(f"✅ NumPy array created: {np_array.shape}")
        
        # Convert to torch tensor
        torch_tensor = torch.from_numpy(np_array)
        print(f"✅ Conversion to torch tensor works: {torch_tensor.shape}")
        
        # Convert back to numpy
        back_to_np = torch_tensor.numpy()
        print(f"✅ Conversion back to numpy works: {back_to_np.shape}")
        
        return True
        
    except Exception as e:
        print(f"❌ NumPy-Torch compatibility failed: {e}")
        return False

def test_ultralytics_minimal():
    """Test Ultralytics with minimal imports"""
    print("\n🔍 Testing Ultralytics minimal import...")
    
    try:
        # Disable matplotlib for now
        os.environ['MPLBACKEND'] = 'Agg'
        
        from ultralytics import YOLO
        print("✅ Ultralytics imported successfully")
        
        # Create model (this will download yolov8n.pt if needed)
        print("📥 Loading/downloading YOLOv8n model...")
        model = YOLO('yolov8n.pt')
        print("✅ YOLOv8n model loaded")
        
        return model
        
    except Exception as e:
        print(f"❌ Ultralytics minimal test failed: {e}")
        return None

def test_yolo_inference():
    """Test YOLO inference with a simple image"""
    print("\n🔍 Testing YOLO inference...")
    
    try:
        model = test_ultralytics_minimal()
        if not model:
            return False
            
        import numpy as np
        import cv2
        
        # Create a simple test image
        test_img = np.ones((640, 640, 3), dtype=np.uint8) * 255
        
        # Add some detectable objects (rectangles that might look like objects)
        cv2.rectangle(test_img, (100, 100), (200, 200), (128, 128, 128), -1)  # Gray square
        cv2.rectangle(test_img, (300, 150), (350, 250), (64, 64, 64), -1)     # Darker rectangle
        cv2.circle(test_img, (500, 400), 60, (96, 96, 96), -1)               # Circle
        
        print("🔄 Running YOLO inference...")
        
        # Run prediction
        results = model.predict(test_img, verbose=False, save=False, show=False)
        
        print(f"✅ YOLO inference successful! Got {len(results)} result(s)")
        
        # Process results
        total_detections = 0
        for i, result in enumerate(results):
            if hasattr(result, 'boxes') and result.boxes is not None:
                num_detections = len(result.boxes)
                total_detections += num_detections
                print(f"   Result {i+1}: {num_detections} detections")
                
                # Show first few detections
                for j, box in enumerate(result.boxes[:3]):  # Show max 3
                    try:
                        conf = float(box.conf[0]) if hasattr(box, 'conf') and box.conf is not None else 0.0
                        cls = int(box.cls[0]) if hasattr(box, 'cls') and box.cls is not None else -1
                        
                        class_name = "unknown"
                        if hasattr(result, 'names') and cls in result.names:
                            class_name = result.names[cls]
                        
                        print(f"     Detection {j+1}: {class_name} (confidence: {conf:.3f})")
                        
                    except Exception as e:
                        print(f"     Detection {j+1}: Error processing - {e}")
            else:
                print(f"   Result {i+1}: No detections")
        
        print(f"📊 Total detections across all results: {total_detections}")
        
        return True
        
    except Exception as e:
        print(f"❌ YOLO inference failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def main():
    """Main test runner"""
    print("🚀 Direct YOLO Test - Minimal Dependencies\n")
    
    tests = [
        ("PyTorch Import", test_torch_first),
        ("NumPy-Torch Compatibility", test_numpy_torch_compat),
        ("YOLO Inference", test_yolo_inference)
    ]
    
    results = {}
    for name, test_func in tests:
        print(f"\n{'='*60}")
        print(f"🧪 {name}")
        print(f"{'='*60}")
        
        try:
            results[name] = test_func()
        except Exception as e:
            print(f"❌ {name} crashed: {e}")
            results[name] = False
    
    # Final summary
    print(f"\n{'='*60}")
    print("🎯 DIRECT YOLO TEST RESULTS")
    print(f"{'='*60}")
    
    passed = 0
    for name, result in results.items():
        status = "✅ SUCCESS" if result else "❌ FAILED"
        print(f"   {name}: {status}")
        if result:
            passed += 1
    
    if passed == len(tests):
        print(f"\n🎉 YOLO is fully working!")
        print("   🎯 Ready for CircuitSim integration")
        return 0
    elif passed > 0:
        print(f"\n⚠️  {passed}/{len(tests)} tests passed")
        print("   📋 Partial YOLO functionality available")
        return 1
    else:
        print(f"\n❌ All tests failed")
        print("   📋 YOLO needs more debugging")
        return 2

if __name__ == "__main__":
    sys.exit(main())