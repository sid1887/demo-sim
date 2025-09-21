#!/usr/bin/env python3
"""
Circuit AI Training Pipeline
Integrates YOLO training with circuit-specific datasets for component detection
"""

import os
import json
import numpy as np
import cv2
from pathlib import Path
import logging
from typing import Dict, List, Any, Tuple

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CircuitAITrainer:
    """
    Circuit-specific AI training pipeline that works with both YOLO and custom models
    """
    
    def __init__(self):
        self.base_dir = Path(__file__).parent
        self.dataset_dir = self.base_dir / "circuit_dataset"
        self.models_dir = self.base_dir / "models"
        self.config_dir = self.base_dir / "config"
        
        # Ensure directories exist
        self.dataset_dir.mkdir(exist_ok=True)
        self.models_dir.mkdir(exist_ok=True)
        self.config_dir.mkdir(exist_ok=True)
        
        self.circuit_classes = self._define_circuit_classes()
        self.yolo_available = self._check_yolo_availability()
        
    def _define_circuit_classes(self) -> Dict[str, Dict[str, Any]]:
        """Define circuit component classes for training"""
        classes = {
            # Passive Components
            0: {'name': 'resistor', 'category': 'passive', 'symbol': 'R'},
            1: {'name': 'capacitor_polarized', 'category': 'passive', 'symbol': 'C+'},
            2: {'name': 'capacitor_unpolarized', 'category': 'passive', 'symbol': 'C'},
            3: {'name': 'inductor', 'category': 'passive', 'symbol': 'L'},
            
            # Semiconductors
            4: {'name': 'diode', 'category': 'semiconductor', 'symbol': 'D'},
            5: {'name': 'led', 'category': 'semiconductor', 'symbol': 'LED'},
            6: {'name': 'transistor_npn', 'category': 'semiconductor', 'symbol': 'Q'},
            7: {'name': 'transistor_pnp', 'category': 'semiconductor', 'symbol': 'Q'},
            
            # Integrated Circuits
            8: {'name': 'ic_dip', 'category': 'active', 'symbol': 'IC'},
            9: {'name': 'op_amp', 'category': 'active', 'symbol': 'OpAmp'},
            10: {'name': 'microcontroller', 'category': 'active', 'symbol': 'MCU'},
            
            # Logic Gates
            11: {'name': 'and_gate', 'category': 'logic', 'symbol': 'AND'},
            12: {'name': 'or_gate', 'category': 'logic', 'symbol': 'OR'},
            13: {'name': 'not_gate', 'category': 'logic', 'symbol': 'NOT'},
            14: {'name': 'nand_gate', 'category': 'logic', 'symbol': 'NAND'},
            15: {'name': 'nor_gate', 'category': 'logic', 'symbol': 'NOR'},
            16: {'name': 'xor_gate', 'category': 'logic', 'symbol': 'XOR'},
            
            # Power and Ground
            17: {'name': 'voltage_source', 'category': 'power', 'symbol': 'V'},
            18: {'name': 'current_source', 'category': 'power', 'symbol': 'I'},
            19: {'name': 'ground', 'category': 'power', 'symbol': 'GND'},
            20: {'name': 'vcc', 'category': 'power', 'symbol': 'VCC'},
            
            # Connections
            21: {'name': 'wire', 'category': 'connection', 'symbol': '—'},
            22: {'name': 'junction', 'category': 'connection', 'symbol': '•'},
            23: {'name': 'terminal', 'category': 'connection', 'symbol': 'T'},
            
            # Test Equipment
            24: {'name': 'multimeter', 'category': 'instrument', 'symbol': 'MM'},
            25: {'name': 'oscilloscope', 'category': 'instrument', 'symbol': 'OSC'},
            26: {'name': 'function_generator', 'category': 'instrument', 'symbol': 'FG'}
        }
        
        return classes
    
    def _check_yolo_availability(self) -> bool:
        """Check if YOLO is available for training"""
        try:
            from ultralytics import YOLO
            return True
        except ImportError:
            logger.warning("⚠️ YOLO not available for training")
            return False
    
    def create_yolo_dataset_config(self) -> str:
        """Create YOLO dataset configuration file"""
        
        # Create class names list
        class_names = [self.circuit_classes[i]['name'] for i in sorted(self.circuit_classes.keys())]
        
        config = {
            'path': str(self.dataset_dir.absolute()),
            'train': 'images/train',
            'val': 'images/val',
            'test': 'images/test',
            'nc': len(class_names),
            'names': class_names
        }
        
        config_path = self.config_dir / "circuit_dataset.yaml"
        with open(config_path, 'w') as f:
            import yaml
            yaml.dump(config, f, default_flow_style=False)
        
        logger.info(f"✅ YOLO dataset config created: {config_path}")
        return str(config_path)
    
    def create_training_dataset_structure(self):
        """Create the proper directory structure for YOLO training"""
        
        # Create YOLO dataset structure
        directories = [
            self.dataset_dir / "images" / "train",
            self.dataset_dir / "images" / "val", 
            self.dataset_dir / "images" / "test",
            self.dataset_dir / "labels" / "train",
            self.dataset_dir / "labels" / "val",
            self.dataset_dir / "labels" / "test"
        ]
        
        for directory in directories:
            directory.mkdir(parents=True, exist_ok=True)
            logger.info(f"📁 Created directory: {directory}")
        
        # Create README for dataset
        readme_content = """# Circuit Component Dataset

This dataset contains labeled circuit components for training YOLO models.

## Structure
- `images/train/` - Training images
- `images/val/` - Validation images  
- `images/test/` - Test images
- `labels/train/` - Training labels (YOLO format)
- `labels/val/` - Validation labels (YOLO format)
- `labels/test/` - Test labels (YOLO format)

## Label Format
YOLO format: `class_id center_x center_y width height`
- All values normalized to [0, 1]
- class_id corresponds to circuit component classes

## Circuit Component Classes
"""
        
        for class_id, class_info in self.circuit_classes.items():
            readme_content += f"{class_id}: {class_info['name']} ({class_info['symbol']})\n"
        
        readme_path = self.dataset_dir / "README.md"
        with open(readme_path, 'w') as f:
            f.write(readme_content)
        
        logger.info(f"📄 Created dataset README: {readme_path}")
    
    def generate_synthetic_training_data(self, num_images: int = 100):
        """Generate synthetic circuit images for training"""
        logger.info(f"🎨 Generating {num_images} synthetic circuit images...")
        
        train_dir = self.dataset_dir / "images" / "train"
        train_labels_dir = self.dataset_dir / "labels" / "train"
        
        for i in range(num_images):
            # Create blank circuit board background
            img = np.ones((640, 640, 3), dtype=np.uint8) * 255
            
            # Add some circuit board texture
            noise = np.random.normal(0, 10, (640, 640, 3))
            img = np.clip(img + noise, 0, 255).astype(np.uint8)
            
            # Generate random circuit components
            components = []
            labels = []
            
            num_components = np.random.randint(3, 10)
            
            for j in range(num_components):
                # Random component type
                class_id = np.random.randint(0, len(self.circuit_classes))
                
                # Random position and size
                x = np.random.randint(50, 590)
                y = np.random.randint(50, 590)
                w = np.random.randint(20, 80)
                h = np.random.randint(15, 60)
                
                # Draw component based on type
                component_name = self.circuit_classes[class_id]['name']
                self._draw_component(img, component_name, x, y, w, h)
                
                # Create YOLO label (normalized coordinates)
                center_x = (x + w/2) / 640
                center_y = (y + h/2) / 640
                norm_w = w / 640
                norm_h = h / 640
                
                labels.append(f"{class_id} {center_x:.6f} {center_y:.6f} {norm_w:.6f} {norm_h:.6f}")
            
            # Save image
            img_path = train_dir / f"circuit_{i:04d}.jpg"
            cv2.imwrite(str(img_path), img)
            
            # Save labels
            label_path = train_labels_dir / f"circuit_{i:04d}.txt"
            with open(label_path, 'w') as f:
                f.write('\n'.join(labels))
            
            if (i + 1) % 10 == 0:
                logger.info(f"   Generated {i + 1}/{num_images} images")
        
        logger.info(f"✅ Synthetic dataset generation complete")
    
    def _draw_component(self, img: np.ndarray, component_type: str, x: int, y: int, w: int, h: int):
        """Draw a circuit component on the image"""
        
        if 'resistor' in component_type:
            # Draw resistor as rectangle with zigzag
            cv2.rectangle(img, (x, y), (x+w, y+h), (139, 69, 19), 2)
            # Add color bands
            band_width = w // 5
            colors = [(255, 0, 0), (255, 255, 0), (0, 255, 0)]
            for i, color in enumerate(colors):
                cv2.rectangle(img, 
                             (x + i*band_width, y), 
                             (x + (i+1)*band_width, y+h), 
                             color, -1)
        
        elif 'capacitor' in component_type:
            if 'polarized' in component_type:
                # Cylindrical capacitor
                cv2.rectangle(img, (x, y), (x+w, y+h), (0, 0, 0), 2)
                # Add polarity marking
                cv2.putText(img, '+', (x+5, y+h-5), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 0, 0), 2)
            else:
                # Ceramic capacitor
                cv2.rectangle(img, (x, y), (x+w, y+h), (255, 255, 0), -1)
                cv2.rectangle(img, (x, y), (x+w, y+h), (0, 0, 0), 1)
        
        elif 'inductor' in component_type:
            # Draw coil shape
            center_x = x + w//2
            center_y = y + h//2
            for i in range(3):
                cv2.circle(img, (center_x - w//4 + i*w//4, center_y), h//4, (150, 75, 0), 2, lineType=cv2.LINE_AA)
        
        elif 'diode' in component_type or 'led' in component_type:
            # Triangle with line
            cv2.line(img, (x, y+h//2), (x+w//2, y), (0, 0, 0), 2)
            cv2.line(img, (x+w//2, y), (x+w//2, y+h), (0, 0, 0), 2)
            cv2.line(img, (x+w//2, y+h), (x, y+h//2), (0, 0, 0), 2)
            cv2.line(img, (x+w//2, y), (x+w, y+h//2), (0, 0, 0), 2)
            
            if 'led' in component_type:
                # Add LED color
                colors = [(0, 0, 255), (0, 255, 0), (255, 0, 0), (0, 255, 255)]
                color = colors[np.random.randint(0, len(colors))]
                cv2.circle(img, (x+w//2, y+h//2), min(w, h)//4, color, -1)
        
        elif 'transistor' in component_type:
            # Simple transistor shape
            cv2.circle(img, (x+w//2, y+h//2), min(w, h)//2, (0, 0, 0), 2)
            cv2.line(img, (x, y+h//2), (x+w, y+h//2), (0, 0, 0), 2)
        
        elif 'ic' in component_type or 'op_amp' in component_type:
            # DIP package
            cv2.rectangle(img, (x, y), (x+w, y+h), (50, 50, 50), -1)
            cv2.rectangle(img, (x, y), (x+w, y+h), (0, 0, 0), 2)
            # Add pins
            pin_spacing = h // 8
            for i in range(4):
                cv2.circle(img, (x, y + pin_spacing * (i+2)), 2, (200, 200, 200), -1)
                cv2.circle(img, (x+w, y + pin_spacing * (i+2)), 2, (200, 200, 200), -1)
        
        elif 'gate' in component_type:
            if 'and' in component_type:
                # AND gate - D shape
                cv2.ellipse(img, (x+w//2, y+h//2), (w//2, h//2), 0, -90, 90, (0, 0, 0), 2)
                cv2.line(img, (x, y), (x, y+h), (0, 0, 0), 2)
            elif 'or' in component_type:
                # OR gate - curved input
                cv2.ellipse(img, (x+w//2, y+h//2), (w//2, h//2), 0, 0, 360, (0, 0, 0), 2)
            else:
                # Generic gate
                cv2.rectangle(img, (x, y), (x+w, y+h), (128, 128, 128), -1)
                cv2.rectangle(img, (x, y), (x+w, y+h), (0, 0, 0), 2)
        
        else:
            # Default component
            cv2.rectangle(img, (x, y), (x+w, y+h), (128, 128, 128), -1)
            cv2.rectangle(img, (x, y), (x+w, y+h), (0, 0, 0), 2)
    
    def train_yolo_model(self, epochs: int = 50) -> str:
        """Train YOLO model on circuit dataset"""
        
        if not self.yolo_available:
            logger.error("❌ YOLO not available for training")
            return None
        
        logger.info(f"🚀 Starting YOLO training for {epochs} epochs...")
        
        try:
            from ultralytics import YOLO
            
            # Create dataset config
            dataset_config = self.create_yolo_dataset_config()
            
            # Initialize model
            model = YOLO('yolov8n.pt')  # Start with pre-trained model
            
            # Train the model
            results = model.train(
                data=dataset_config,
                epochs=epochs,
                imgsz=640,
                batch=16,
                name='circuit_yolo',
                project=str(self.models_dir),
                exist_ok=True,
                patience=10,
                save=True,
                plots=True
            )
            
            # Save the trained model
            model_path = self.models_dir / "circuit_yolo_trained.pt"
            model.save(str(model_path))
            
            logger.info(f"✅ YOLO training complete! Model saved: {model_path}")
            return str(model_path)
            
        except Exception as e:
            logger.error(f"❌ YOLO training failed: {e}")
            return None
    
    def create_hybrid_training_pipeline(self):
        """Create a hybrid training pipeline combining YOLO and custom models"""
        
        pipeline_config = {
            'name': 'CircuitAI Hybrid Training Pipeline',
            'version': '1.0',
            'components': {
                'yolo': {
                    'enabled': self.yolo_available,
                    'model': 'yolov8n',
                    'task': 'component_detection',
                    'confidence_threshold': 0.25
                },
                'opencv': {
                    'enabled': True,
                    'methods': ['contour_detection', 'template_matching', 'hough_lines'],
                    'task': 'wire_detection'
                },
                'custom_cnn': {
                    'enabled': False,  # Can be implemented later
                    'architecture': 'mobilenet_v2',
                    'task': 'component_classification'
                }
            },
            'dataset': {
                'classes': self.circuit_classes,
                'synthetic_generation': True,
                'augmentation': True
            },
            'training': {
                'batch_size': 16,
                'learning_rate': 0.001,
                'epochs': 50,
                'validation_split': 0.2
            },
            'evaluation': {
                'metrics': ['mAP', 'precision', 'recall', 'f1_score'],
                'test_images': 100
            }
        }
        
        config_path = self.config_dir / "hybrid_training_config.json"
        with open(config_path, 'w') as f:
            json.dump(pipeline_config, f, indent=2)
        
        logger.info(f"📋 Hybrid training pipeline config created: {config_path}")
        return config_path
    
    def setup_complete_training_environment(self):
        """Set up the complete training environment"""
        logger.info("🏗️ Setting up complete CircuitAI training environment...")
        
        # 1. Create dataset structure
        self.create_training_dataset_structure()
        
        # 2. Generate synthetic training data
        self.generate_synthetic_training_data(100)
        
        # 3. Create YOLO dataset config
        self.create_yolo_dataset_config()
        
        # 4. Create hybrid training pipeline
        self.create_hybrid_training_pipeline()
        
        # 5. Create training script
        self._create_training_script()
        
        logger.info("✅ Complete training environment ready!")
        logger.info(f"   📁 Dataset: {self.dataset_dir}")
        logger.info(f"   📁 Models: {self.models_dir}")
        logger.info(f"   📁 Config: {self.config_dir}")
        logger.info(f"   🎯 YOLO Available: {self.yolo_available}")
        logger.info(f"   🔢 Circuit Classes: {len(self.circuit_classes)}")
    
    def _create_training_script(self):
        """Create a training script for easy model training"""
        
        script_content = '''#!/usr/bin/env python3
"""
CircuitAI Training Script
Run this script to train circuit component detection models
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from circuit_ai_trainer import CircuitAITrainer

def main():
    print("Training CircuitAI Models")
    
    trainer = CircuitAITrainer()
    
    # Setup training environment
    trainer.setup_complete_training_environment()
    
    # Train YOLO if available
    if trainer.yolo_available:
        print("\\nStarting YOLO training...")
        model_path = trainer.train_yolo_model(epochs=50)
        if model_path:
            print(f"YOLO model trained successfully: {model_path}")
        else:
            print("YOLO training failed")
    else:
        print("YOLO not available, skipping YOLO training")
    
    print("\\nTraining complete!")

if __name__ == "__main__":
    main()
'''
        
        script_path = self.base_dir / "train_circuit_ai.py"
        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(script_content)
        
        # Make executable on Unix systems
        try:
            os.chmod(script_path, 0o755)
        except:
            pass
        
        logger.info(f"📜 Training script created: {script_path}")


def main():
    """Test the CircuitAI training system"""
    print("🚀 CircuitAI Training Pipeline Test\n")
    
    trainer = CircuitAITrainer()
    
    print(f"YOLO Available: {trainer.yolo_available}")
    print(f"Circuit Classes: {len(trainer.circuit_classes)}")
    print(f"Base Directory: {trainer.base_dir}")
    
    # Setup complete training environment
    trainer.setup_complete_training_environment()
    
    print(f"\n🎉 CircuitAI Training Pipeline is ready!")
    print(f"   📁 Dataset directory: {trainer.dataset_dir}")
    print(f"   🏷️ Circuit classes: {len(trainer.circuit_classes)}")
    print(f"   🎯 YOLO integration: {'✅' if trainer.yolo_available else '❌'}")
    print(f"   🎨 Synthetic data generation: ✅")
    print(f"   🔄 Hybrid training pipeline: ✅")


if __name__ == "__main__":
    main()