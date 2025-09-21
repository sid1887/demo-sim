#!/usr/bin/env python3
"""
Clean YOLO Setup - Download and test YOLOv8 models from scratch
"""

import os
import sys
from pathlib import Path
import tempfile

def setup_yolo_fresh():
    """Set up YOLO completely fresh"""
    print("🚀 Setting up YOLO from scratch...")
    
    # Create a clean environment
    os.environ['PYTHONPATH'] = ''
    os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'
    
    try:
        print("📦 Importing ultralytics...")
        from ultralytics import YOLO
        print("✅ Ultralytics imported successfully")
        
        # Download YOLOv8n model to a temp location first
        print("📥 Downloading YOLOv8n model...")
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_model_path = os.path.join(temp_dir, "yolov8n.pt")
            
            # Force download to temp location
            model = YOLO("yolov8n.pt")
            print("✅ YOLOv8n downloaded successfully")
            
            # Save to our models directory
            models_dir = Path(__file__).parent / "models"
            final_model_path = models_dir / "yolov8n.pt"
            
            # Copy the model files from ultralytics cache
            import shutil
            from ultralytics.utils import ASSETS
            
            # Find where ultralytics saved the model
            import platform
            if platform.system() == "Windows":
                cache_dir = Path.home() / "AppData" / "Roaming" / "Ultralytics"
            else:
                cache_dir = Path.home() / ".ultralytics"
            
            source_model = cache_dir / "yolov8n.pt"
            if source_model.exists():
                shutil.copy2(source_model, final_model_path)
                print(f"✅ Model copied to {final_model_path}")
                
                # Verify the copy
                if final_model_path.exists():
                    size_mb = final_model_path.stat().st_size / (1024 * 1024)
                    print(f"📏 Model size: {size_mb:.1f} MB")
                    return str(final_model_path)
            else:
                print("⚠️  Using model from ultralytics cache location")
                return "yolov8n.pt"  # Let ultralytics handle it
                
    except Exception as e:
        print(f"❌ YOLO setup failed: {e}")
        return None

def test_yolo_basic():
    """Test basic YOLO functionality"""
    print("\n🔍 Testing basic YOLO functionality...")
    
    try:
        model_path = setup_yolo_fresh()
        if not model_path:
            return False
            
        from ultralytics import YOLO
        import numpy as np
        
        print(f"🔄 Loading model from: {model_path}")
        model = YOLO(model_path)
        print("✅ Model loaded successfully")
        
        # Create a simple test image
        print("🎨 Creating test image...")
        import cv2
        test_img = np.ones((640, 640, 3), dtype=np.uint8) * 255
        
        # Add some detectable objects
        cv2.rectangle(test_img, (100, 100), (200, 200), (128, 128, 128), -1)
        cv2.circle(test_img, (400, 400), 50, (64, 64, 64), -1)
        cv2.rectangle(test_img, (300, 150), (350, 250), (96, 96, 96), -1)
        
        print("🔄 Running inference...")
        
        # Run inference with error handling
        results = model.predict(test_img, verbose=False, save=False)
        print(f"✅ Inference completed! Got {len(results)} result(s)")
        
        # Process results
        detections = []
        for result in results:
            if hasattr(result, 'boxes') and result.boxes is not None:
                for box in result.boxes:
                    try:
                        # Extract detection info
                        conf = float(box.conf[0]) if hasattr(box, 'conf') and box.conf is not None else 0.0
                        cls = int(box.cls[0]) if hasattr(box, 'cls') and box.cls is not None else -1
                        
                        # Get class name if available
                        class_name = "unknown"
                        if hasattr(result, 'names') and cls in result.names:
                            class_name = result.names[cls]
                        
                        detection = {
                            "class": cls,
                            "class_name": class_name,
                            "confidence": conf
                        }
                        detections.append(detection)
                        
                        print(f"   🎯 Detection: {class_name} (confidence: {conf:.3f})")
                        
                    except Exception as e:
                        print(f"   ⚠️  Error processing detection: {e}")
                        continue
        
        print(f"📊 Total detections: {len(detections)}")
        return True
        
    except Exception as e:
        print(f"❌ YOLO test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

def create_yolo_config():
    """Create YOLO configuration for circuit detection"""
    print("\n🔧 Creating YOLO configuration...")
    
    try:
        config = {
            "model": {
                "type": "yolov8n",
                "path": "models/yolov8n.pt",
                "classes": 80,  # COCO classes
                "input_size": [640, 640]
            },
            "detection": {
                "confidence_threshold": 0.5,
                "nms_threshold": 0.4,
                "max_detections": 100
            },
            "circuit_mapping": {
                "person": "human_operator",
                "laptop": "control_device",
                "cell phone": "mobile_device",
                "book": "manual_schematic",
                "scissors": "wire_cutter",
                "bottle": "component_container"
            },
            "processing": {
                "preprocessing": True,
                "postprocessing": True,
                "visualization": False
            }
        }
        
        config_path = Path(__file__).parent / "yolo_config.json"
        with open(config_path, 'w') as f:
            import json
            json.dump(config, f, indent=2)
        
        print(f"✅ Configuration saved to: {config_path}")
        return str(config_path)
        
    except Exception as e:
        print(f"❌ Config creation failed: {e}")
        return None

def main():
    """Main setup function"""
    print("🚀 Complete YOLO Rebuild - Fresh Start\n")
    
    tests = [
        ("YOLO Basic Test", test_yolo_basic),
        ("YOLO Configuration", create_yolo_config)
    ]
    
    results = {}
    for name, test_func in tests:
        try:
            print(f"\n{'='*50}")
            print(f"Running: {name}")
            print(f"{'='*50}")
            results[name] = test_func()
        except Exception as e:
            print(f"❌ {name} crashed: {e}")
            results[name] = False
    
    # Summary
    print(f"\n{'='*50}")
    print("🎯 YOLO Rebuild Summary")
    print(f"{'='*50}")
    
    passed = 0
    for name, result in results.items():
        status = "✅ SUCCESS" if result else "❌ FAILED"
        print(f"   {name}: {status}")
        if result:
            passed += 1
    
    if passed == len(tests):
        print(f"\n🎉 YOLO rebuild completed successfully!")
        print("   📋 Ready for integration with CircuitSim")
        return 0
    else:
        print(f"\n⚠️  {passed}/{len(tests)} components working")
        print("   📋 Partial functionality available")
        return 1

if __name__ == "__main__":
    sys.exit(main())