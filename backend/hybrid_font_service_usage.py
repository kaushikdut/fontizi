#!/usr/bin/env python3
"""
Hybrid Font Service Usage Guide and Examples
============================================

This script demonstrates how to use the hybrid font recognition service
for maximum accuracy font identification.
"""

import os
import sys
import json
import argparse
from pathlib import Path

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from hybrid_font_service import HybridFontService

def setup_environment():
    """Setup environment variables for the hybrid service"""
    print("🔧 Setting up Hybrid Font Service Environment...")
    
    # Check if .env file exists
    env_file = Path(__file__).parent / '.env'
    if not env_file.exists():
        print("⚠️  .env file not found. Creating example...")
        create_env_example()
    
    # Check required API keys
    check_api_keys()

def create_env_example():
    """Create example .env file"""
    env_content = """# Hybrid Font Service Environment Variables

# WhatTheFont API (Commercial - Highest accuracy)
# Get API key from: https://www.whatfontis.com/api/
WHATTHEFONT_API_KEY=your_whatthefont_api_key_here

# Google Fonts API (Free - Good for font matching)
# Get API key from: https://console.cloud.google.com/
GOOGLE_FONTS_API_KEY=your_google_fonts_api_key_here

# OpenAI API (Optional - for advanced features)
# Get API key from: https://platform.openai.com/
OPENAI_API_KEY=your_openai_api_key_here

# Storia AI Model Path (Local model)
STORIA_MODEL_PATH=./storia_model

# Confidence thresholds
MIN_CONFIDENCE=0.3
HIGH_CONFIDENCE=0.7
"""
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ Created .env.example file")
    print("📝 Please edit .env with your actual API keys")

def check_api_keys():
    """Check which API keys are available"""
    print("\n🔑 Checking API Keys:")
    
    keys = {
        'WHATTHEFONT_API_KEY': 'WhatTheFont API',
        'GOOGLE_FONTS_API_KEY': 'Google Fonts API', 
        'OPENAI_API_KEY': 'OpenAI API'
    }
    
    for key, name in keys.items():
        value = os.getenv(key)
        if value and value != f'your_{key.lower()}_here':
            print(f"✅ {name}: Configured")
        else:
            print(f"❌ {name}: Not configured")

def basic_usage_example():
    """Basic usage example"""
    print("\n🚀 Basic Usage Example:")
    
    # Initialize the service
    service = HybridFontService()
    
    # Example image path (replace with your image)
    image_path = "test.png"
    
    if not os.path.exists(image_path):
        print(f"⚠️  Image file '{image_path}' not found")
        print("📸 Please provide a valid image file path")
        return
    
    print(f"🔍 Analyzing image: {image_path}")
    
    # Recognize font using hybrid approach
    result = service.recognize_font_hybrid(image_path)
    
    # Display results
    display_results(result)

def advanced_usage_example():
    """Advanced usage with custom settings"""
    print("\n⚡ Advanced Usage Example:")
    
    service = HybridFontService()
    
    # Custom confidence weights
    service.confidence_weights = {
        'storia': 0.5,        # Give more weight to local model
        'whatthefont': 0.3,   # Commercial API
        'google_fonts': 0.15, # Google Fonts
        'custom_db': 0.05     # Custom database
    }
    
    image_path = "test.png"
    
    if not os.path.exists(image_path):
        print(f"⚠️  Image file '{image_path}' not found")
        return
    
    # Use only specific services
    result = service.recognize_font_hybrid(image_path, use_all_services=True)
    
    # Add user feedback
    if result.get('success') and result.get('top_prediction'):
        actual_font = "Arial"  # Replace with actual font
        predicted_font = result['top_prediction']['font']
        confidence = result['top_prediction']['confidence']
        
        service.add_user_feedback(image_path, actual_font, predicted_font, confidence)
        print(f"📝 Added feedback: Actual={actual_font}, Predicted={predicted_font}")
    
    display_results(result)

def display_results(result):
    """Display recognition results in a formatted way"""
    print("\n📊 Recognition Results:")
    print("=" * 50)
    
    if not result.get('success'):
        print(f"❌ Error: {result.get('error', 'Unknown error')}")
        return
    
    # Top prediction
    top_pred = result.get('top_prediction')
    if top_pred:
        print(f"🏆 Top Prediction: {top_pred['font']}")
        print(f"   Confidence: {top_pred['confidence']:.3f}")
        print(f"   Services Agreement: {top_pred.get('services_agreement', 'N/A')}")
    
    # All predictions
    predictions = result.get('predictions', [])
    if predictions:
        print(f"\n📋 All Predictions ({len(predictions)}):")
        for i, pred in enumerate(predictions[:5], 1):  # Show top 5
            confidence_bar = "█" * int(pred['confidence'] * 20)
            print(f"   {i}. {pred['font']:<25} {pred['confidence']:.3f} {confidence_bar}")
    
    # Metadata
    metadata = {
        'Processing Time': f"{result.get('processing_time', 0):.2f}s",
        'Services Used': ', '.join(result.get('services_used', [])),
        'Hybrid Confidence': f"{result.get('hybrid_confidence', 0):.3f}",
        'Ensemble Method': result.get('ensemble_method', 'N/A')
    }
    
    print(f"\n📈 Metadata:")
    for key, value in metadata.items():
        print(f"   {key}: {value}")

def batch_processing_example():
    """Example of batch processing multiple images"""
    print("\n🔄 Batch Processing Example:")
    
    service = HybridFontService()
    
    # Example image directory
    image_dir = "test_images"
    
    if not os.path.exists(image_dir):
        print(f"⚠️  Directory '{image_dir}' not found")
        print("📁 Please create a directory with test images")
        return
    
    # Get all image files
    image_extensions = {'.png', '.jpg', '.jpeg', '.webp', '.bmp'}
    image_files = [
        f for f in os.listdir(image_dir) 
        if Path(f).suffix.lower() in image_extensions
    ]
    
    if not image_files:
        print(f"⚠️  No image files found in '{image_dir}'")
        return
    
    print(f"🔍 Processing {len(image_files)} images...")
    
    results = {}
    for i, filename in enumerate(image_files, 1):
        image_path = os.path.join(image_dir, filename)
        print(f"   [{i}/{len(image_files)}] Processing: {filename}")
        
        try:
            result = service.recognize_font_hybrid(image_path)
            results[filename] = result
        except Exception as e:
            print(f"   ❌ Error processing {filename}: {e}")
            results[filename] = {'success': False, 'error': str(e)}
    
    # Summary
    print(f"\n📊 Batch Processing Summary:")
    successful = sum(1 for r in results.values() if r.get('success'))
    print(f"   Successful: {successful}/{len(image_files)}")
    
    # Show top predictions for each
    for filename, result in results.items():
        if result.get('success') and result.get('top_prediction'):
            font = result['top_prediction']['font']
            confidence = result['top_prediction']['confidence']
            print(f"   {filename}: {font} ({confidence:.3f})")

def create_api_endpoint():
    """Create a Flask API endpoint for the hybrid service"""
    print("\n🌐 Creating Flask API Endpoint:")
    
    endpoint_code = '''
from flask import Flask, request, jsonify
from hybrid_font_service import HybridFontService
import os

app = Flask(__name__)
service = HybridFontService()

@app.route('/api/hybrid/identify-font', methods=['POST'])
def identify_font_hybrid():
    """Hybrid font identification endpoint"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save uploaded file temporarily
        import tempfile
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
            file.save(tmp.name)
            tmp_path = tmp.name
        
        # Process with hybrid service
        result = service.recognize_font_hybrid(tmp_path)
        
        # Clean up
        os.unlink(tmp_path)
        
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/hybrid/status', methods=['GET'])
def hybrid_status():
    """Get hybrid service status"""
    return jsonify({
        'whatthefont_available': service.whatthefont_available,
        'google_fonts_available': service.google_fonts_available,
        'openai_available': service.openai_available,
        'custom_db_loaded': bool(service.custom_font_db)
    })

if __name__ == '__main__':
    app.run(debug=True, port=3002)
'''
    
    with open('hybrid_api_server.py', 'w') as f:
        f.write(endpoint_code)
    
    print("✅ Created hybrid_api_server.py")
    print("🚀 Run with: python hybrid_api_server.py")

def main():
    """Main function with command line interface"""
    parser = argparse.ArgumentParser(description="Hybrid Font Service Usage Examples")
    parser.add_argument('--setup', action='store_true', help='Setup environment')
    parser.add_argument('--basic', action='store_true', help='Run basic example')
    parser.add_argument('--advanced', action='store_true', help='Run advanced example')
    parser.add_argument('--batch', action='store_true', help='Run batch processing')
    parser.add_argument('--api', action='store_true', help='Create API endpoint')
    parser.add_argument('--image', type=str, help='Path to image file for testing')
    parser.add_argument('--all', action='store_true', help='Run all examples')
    
    args = parser.parse_args()
    
    if args.setup or args.all:
        setup_environment()
    
    if args.basic or args.all:
        basic_usage_example()
    
    if args.advanced or args.all:
        advanced_usage_example()
    
    if args.batch or args.all:
        batch_processing_example()
    
    if args.api or args.all:
        create_api_endpoint()
    
    if args.image:
        # Test with specific image
        service = HybridFontService()
        result = service.recognize_font_hybrid(args.image)
        display_results(result)
    
    if not any([args.setup, args.basic, args.advanced, args.batch, args.api, args.image, args.all]):
        print("Hybrid Font Service Usage Guide")
        print("=" * 40)
        print("Available commands:")
        print("  --setup     Setup environment and check API keys")
        print("  --basic     Run basic usage example")
        print("  --advanced  Run advanced usage example")
        print("  --batch     Run batch processing example")
        print("  --api       Create Flask API endpoint")
        print("  --image     Test with specific image file")
        print("  --all       Run all examples")
        print("\nExample:")
        print("  python hybrid_font_service_usage.py --setup --basic")

if __name__ == "__main__":
    main()
