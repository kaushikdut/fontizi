#!/usr/bin/env python3
"""
Startup script for Storia AI Font Recognition Server
"""

import os
import sys
import subprocess
import time

def check_dependencies():
    """Check if required dependencies are installed"""
    print("🔍 Checking dependencies...")
    
    required_packages = [
        'flask',
        'flask_cors',
        'opencv-python',
        'numpy',
        'PIL',
        'requests',
        'torch',
        'torchvision',
        'transformers'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            if package == 'PIL':
                import PIL
            else:
                __import__(package.replace('-', '_'))
            print(f"  ✅ {package}")
        except ImportError:
            print(f"  ❌ {package} - Missing")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️  Missing packages: {', '.join(missing_packages)}")
        print("Please install missing dependencies:")
        print("pip install -r requirements.txt")
        return False
    
    print("✅ All dependencies are installed!")
    return True

def check_storia_model():
    """Check if Storia AI model is available"""
    print("\n🔍 Checking Storia AI model...")
    
    try:
        from storia_font_service import StoriaFontService
        service = StoriaFontService()
        status = service.get_model_status()
        
        if status.get('storia_available', False):
            print("✅ Storia AI model is available")
            return True
        else:
            print("⚠️  Storia AI model not found")
            print("The model will be automatically downloaded on first use")
            return True
    except Exception as e:
        print(f"❌ Error checking Storia AI model: {e}")
        return False

def start_server():
    """Start the Storia AI server"""
    print("\n🚀 Starting Storia AI Font Recognition Server...")
    
    # Set environment variables
    os.environ['FLASK_DEBUG'] = 'True'
    os.environ['PORT'] = '3001'
    
    try:
        # Import and run the server
        from storia_server import app
        
        print("✅ Server started successfully!")
        print("🌐 Server running at: http://localhost:3001")
        print("📚 API Documentation:")
        print("  - Health check: GET /health")
        print("  - Font recognition: POST /api/storia/identify-font")
        print("  - Google Fonts search: GET /api/google-fonts/search")
        print("  - Font download: POST /api/google-fonts/download")
        print("  - Model status: GET /api/storia/status")
        print("\nPress Ctrl+C to stop the server")
        
        # Run the server
        app.run(host='0.0.0.0', port=3001, debug=True)
        
    except KeyboardInterrupt:
        print("\n🛑 Server stopped by user")
    except Exception as e:
        print(f"❌ Error starting server: {e}")
        return False
    
    return True

def main():
    """Main startup function"""
    print("🎯 Storia AI Font Recognition Server")
    print("=" * 50)
    
    # Check dependencies
    if not check_dependencies():
        sys.exit(1)
    
    # Check Storia AI model
    if not check_storia_model():
        print("⚠️  Continuing anyway - model will be downloaded on first use")
    
    # Start server
    start_server()

if __name__ == "__main__":
    main()
