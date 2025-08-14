#!/usr/bin/env python3
"""
Setup script for Enhanced Font Recognition System
Installs dependencies and configures the improved system
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def run_command(command, description):
    """Run a command and handle errors"""
    print(f"🔄 {description}...")
    try:
        result = subprocess.run(command, shell=True, check=True, capture_output=True, text=True)
        print(f"✅ {description} completed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {description} failed: {e.stderr}")
        return False

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Python 3.8 or higher is required")
        return False
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor} detected")
    return True

def install_dependencies():
    """Install required dependencies"""
    dependencies = [
        "opencv-python>=4.5.0",
        "albumentations>=1.3.0",
        "timm>=0.9.0",
        "torch>=1.12.0",
        "torchvision>=0.13.0",
        "tensorboard>=2.10.0",
        "huggingface-hub>=0.10.0",
        "onnxruntime>=1.12.0",
        "Pillow>=9.0.0",
        "numpy>=1.21.0",
        "requests>=2.28.0",
        "python-dotenv>=0.19.0",
        "flask>=2.2.0",
        "flask-cors>=3.0.10",
        "werkzeug>=2.2.0"
    ]
    
    print("📦 Installing dependencies...")
    for dep in dependencies:
        if not run_command(f"pip install {dep}", f"Installing {dep}"):
            return False
    return True

def setup_storia_model():
    """Setup Storia AI model"""
    print("🤖 Setting up Storia AI model...")
    
    # Check if model directory exists
    model_path = Path("storia_model")
    if model_path.exists():
        print("✅ Storia model directory already exists")
        return True
    
    # Clone the repository
    if not run_command(
        "git clone https://github.com/Storia-AI/font-classify.git storia_model",
        "Cloning Storia AI repository"
    ):
        return False
    
    # Install model requirements
    requirements_path = model_path / "requirements.txt"
    if requirements_path.exists():
        if not run_command(
            f"pip install -r {requirements_path}",
            "Installing model requirements"
        ):
            return False
    
    return True

def copy_enhanced_files():
    """Copy enhanced files to the model directory"""
    print("📁 Setting up enhanced files...")
    
    # Copy enhanced predict script
    enhanced_predict_src = Path("storia_model/enhanced_predict.py")
    if enhanced_predict_src.exists():
        print("✅ Enhanced predict script already exists")
    else:
        print("❌ Enhanced predict script not found")
        return False
    
    # Copy data augmentation script
    data_aug_src = Path("storia_model/data_augmentation.py")
    if data_aug_src.exists():
        print("✅ Data augmentation script already exists")
    else:
        print("❌ Data augmentation script not found")
        return False
    
    # Copy enhanced training script
    enhanced_train_src = Path("storia_model/enhanced_train.py")
    if enhanced_train_src.exists():
        print("✅ Enhanced training script already exists")
    else:
        print("❌ Enhanced training script not found")
        return False
    
    return True

def create_directories():
    """Create necessary directories"""
    print("📂 Creating directories...")
    
    directories = [
        "uploads",
        "downloads",
        "logs",
        "training_dataset",
        "enhanced_model"
    ]
    
    for directory in directories:
        Path(directory).mkdir(exist_ok=True)
        print(f"✅ Created directory: {directory}")
    
    return True

def create_env_file():
    """Create environment configuration file"""
    print("⚙️ Creating environment configuration...")
    
    env_content = """# Enhanced Font Recognition Configuration

# Model Configuration
STORIA_MODEL_PATH=./storia_model
MIN_CONFIDENCE=0.3
HIGH_CONFIDENCE=0.7

# Google Fonts API (optional)
# GOOGLE_FONTS_API_KEY=your_api_key_here

# Server Configuration
FLASK_DEBUG=True
PORT=3001

# Training Configuration
BATCH_SIZE=32
LEARNING_RATE=0.001
NUM_EPOCHS=100
"""
    
    env_file = Path(".env")
    if not env_file.exists():
        with open(env_file, "w") as f:
            f.write(env_content)
        print("✅ Created .env file")
    else:
        print("✅ .env file already exists")
    
    return True

def test_installation():
    """Test the installation"""
    print("🧪 Testing installation...")
    
    # Test imports
    try:
        import cv2
        import torch
        import albumentations
        import timm
        import onnxruntime
        print("✅ All dependencies imported successfully")
    except ImportError as e:
        print(f"❌ Import error: {e}")
        return False
    
    # Test model availability
    try:
        from enhanced_font_service import EnhancedFontService
        service = EnhancedFontService()
        status = service.get_model_status()
        if status.get("storia_available", False):
            print("✅ Storia model is available")
        else:
            print("⚠️ Storia model not available (will be downloaded on first use)")
    except Exception as e:
        print(f"⚠️ Model test failed: {e}")
    
    return True

def main():
    """Main setup function"""
    print("🚀 Setting up Enhanced Font Recognition System")
    print("=" * 50)
    
    # Check Python version
    if not check_python_version():
        sys.exit(1)
    
    # Install dependencies
    if not install_dependencies():
        print("❌ Failed to install dependencies")
        sys.exit(1)
    
    # Setup Storia model
    if not setup_storia_model():
        print("❌ Failed to setup Storia model")
        sys.exit(1)
    
    # Copy enhanced files
    if not copy_enhanced_files():
        print("❌ Failed to setup enhanced files")
        sys.exit(1)
    
    # Create directories
    if not create_directories():
        print("❌ Failed to create directories")
        sys.exit(1)
    
    # Create environment file
    if not create_env_file():
        print("❌ Failed to create environment file")
        sys.exit(1)
    
    # Test installation
    if not test_installation():
        print("❌ Installation test failed")
        sys.exit(1)
    
    print("\n🎉 Enhanced Font Recognition System setup completed!")
    print("\n📋 Next steps:")
    print("1. Start the enhanced server:")
    print("   python enhanced_storia_server.py")
    print("\n2. Test the API:")
    print("   curl http://localhost:3001/health")
    print("\n3. Generate training data (optional):")
    print("   cd storia_model")
    print("   python data_augmentation.py --fonts-dir /path/to/fonts --output-dir ../training_dataset")
    print("\n4. Train enhanced model (optional):")
    print("   python enhanced_train.py --image_folder ../training_dataset/train --output_folder ../enhanced_model")
    print("\n📚 For more information, see ACCURACY_IMPROVEMENT_GUIDE.md")

if __name__ == "__main__":
    main()
