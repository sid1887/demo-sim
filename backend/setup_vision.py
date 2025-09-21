#!/usr/bin/env python3
"""
Setup script for CircuitSim AI Vision Enhancement
Handles installation of vision dependencies with fallback options
"""

import subprocess
import sys
import os
from pathlib import Path

def run_command(cmd, description=""):
    """Run command with error handling"""
    print(f"📦 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e.stderr}")
        return False

def install_basic_deps():
    """Install core dependencies that should work on all systems"""
    basic_packages = [
        "fastapi",
        "uvicorn[standard]", 
        "python-multipart",
        "pydantic",
        "requests",
        "python-dotenv",
        "google-genai"
    ]
    
    print("🚀 Installing core dependencies...")
    for package in basic_packages:
        if run_command(f"pip install {package}", f"Installing {package}"):
            print(f"  ✅ {package} installed")
        else:
            print(f"  ⚠️  {package} installation failed")

def install_vision_deps():
    """Try to install vision dependencies with fallbacks"""
    print("\n🔍 Installing vision processing dependencies...")
    
    # Try different approaches for NumPy/OpenCV installation
    vision_approaches = [
        {
            "name": "Pre-compiled binaries (recommended)",
            "packages": [
                "numpy",  # Let pip choose compatible version
                "opencv-python-headless",  # Smaller package
                "ultralytics"
            ]
        },
        {
            "name": "Specific versions",
            "packages": [
                "numpy==1.24.0",  # Older version with better compatibility
                "opencv-python==4.8.1.78",
                "ultralytics==8.0.200"
            ]
        }
    ]
    
    for approach in vision_approaches:
        print(f"\n🔄 Trying: {approach['name']}")
        success = True
        
        for package in approach['packages']:
            if not run_command(f"pip install {package}", f"Installing {package}"):
                success = False
                break
        
        if success:
            print(f"✅ Vision dependencies installed successfully using: {approach['name']}")
            return True
        else:
            print(f"❌ Failed with: {approach['name']}")
    
    print("\n⚠️  Could not install vision dependencies. The system will work with Gemini-only mode.")
    return False

def copy_yolo_weights():
    """Copy YOLO weights from circuitry repo if available"""
    circuitry_path = Path("../circuitry/best.pt")
    target_path = Path("app/best.pt")
    
    if circuitry_path.exists():
        try:
            import shutil
            shutil.copy2(circuitry_path, target_path)
            print(f"✅ YOLO weights copied to {target_path}")
            return True
        except Exception as e:
            print(f"⚠️  Could not copy YOLO weights: {e}")
    else:
        print("ℹ️  YOLO weights not found in ../circuitry/best.pt")
    
    return False

def test_imports():
    """Test if imports work correctly"""
    print("\n🧪 Testing imports...")
    
    test_cases = [
        ("fastapi", "FastAPI core"),
        ("google.genai", "Gemini AI"),
        ("cv2", "OpenCV"),
        ("ultralytics", "YOLOv8"),
        ("numpy", "NumPy")
    ]
    
    results = {}
    
    for module, description in test_cases:
        try:
            __import__(module)
            results[description] = "✅ Available"
        except ImportError:
            results[description] = "❌ Not available"
    
    print("\n📋 Import Test Results:")
    for desc, status in results.items():
        print(f"  {desc}: {status}")
    
    return results

def main():
    """Main setup routine"""
    print("🔧 CircuitSim AI Vision Enhancement Setup")
    print("=" * 50)
    
    # Step 1: Install core dependencies
    install_basic_deps()
    
    # Step 2: Try to install vision dependencies
    vision_success = install_vision_deps()
    
    # Step 3: Copy YOLO weights if available
    copy_yolo_weights()
    
    # Step 4: Test imports
    test_results = test_imports()
    
    # Step 5: Summary
    print("\n" + "=" * 50)
    print("🎯 Setup Summary:")
    
    core_working = all(status == "✅ Available" for desc, status in test_results.items() 
                      if desc in ["FastAPI core", "Gemini AI"])
    
    if core_working:
        print("✅ Core functionality ready (Gemini Vision)")
        
        if vision_success:
            print("✅ Enhanced vision processing available (YOLO + OpenCV + Gemini)")
        else:
            print("⚠️  Enhanced vision processing unavailable (Gemini-only mode)")
            
        print("\n🚀 You can now start the backend server:")
        print("   uvicorn app.main:app --reload")
    else:
        print("❌ Core dependencies missing. Please install manually:")
        print("   pip install fastapi uvicorn google-genai")

if __name__ == "__main__":
    main()