#!/usr/bin/env python3
"""
Simple Font Recognition Test
============================

Test script for the simple font service that uses only Storia AI
and returns just the font name.
"""

import os
import sys
from simple_font_service import SimpleFontService

def test_simple_font_recognition():
    """Test the simple font recognition service"""
    
    print("🧪 Testing Simple Font Recognition (Storia AI Only)")
    print("=" * 50)
    
    # Initialize the service
    print("🔧 Initializing Simple Font Service...")
    service = SimpleFontService()
    
    if not service.storia_available:
        print("❌ Storia AI model not available!")
        print("Please ensure your Storia AI model is properly set up.")
        return
    
    print("✅ Storia AI model is available")
    
    # Find a test image
    test_images = [
        "test.png",
        "test.jpg", 
        "test.jpeg",
        "sample.png",
        "sample.jpg",
        "image.png",
        "image.jpg"
    ]
    
    image_path = None
    for img in test_images:
        if os.path.exists(img):
            image_path = img
            break
    
    if not image_path:
        print("\n❌ No test image found!")
        print("📸 Please place a test image (PNG/JPG) in the current directory")
        print("   Supported names: test.png, sample.png, image.png, etc.")
        return
    
    print(f"\n🔍 Found test image: {image_path}")
    
    # Test font recognition
    print(f"\n🚀 Running font recognition...")
    try:
        # Method 1: Get full result
        result = service.identify_font(image_path)
        
        print(f"\n📊 Full Result:")
        print("-" * 30)
        
        if result['success']:
            print(f"🏆 Font Name: {result['font_name']}")
            print(f"   Confidence: {result['confidence']:.3f}")
            print(f"   Processing Time: {result['processing_time']:.2f}s")
            print(f"   Model Used: {result['model_used']}")
        else:
            print(f"❌ Error: {result['error']}")
        
        # Method 2: Get only font name
        print(f"\n📝 Font Name Only:")
        print("-" * 30)
        font_name = service.get_font_name_only(image_path)
        if font_name:
            print(f"Font: {font_name}")
        else:
            print("Font recognition failed")
            
    except Exception as e:
        print(f"❌ Exception occurred: {e}")
        import traceback
        traceback.print_exc()

def test_with_custom_image(image_path):
    """Test with a specific image file"""
    print(f"🧪 Testing with custom image: {image_path}")
    print("=" * 50)
    
    if not os.path.exists(image_path):
        print(f"❌ Image file not found: {image_path}")
        return
    
    service = SimpleFontService()
    
    if not service.storia_available:
        print("❌ Storia AI model not available!")
        return
    
    try:
        # Get only the font name
        font_name = service.get_font_name_only(image_path)
        
        if font_name:
            print(f"🏆 Font: {font_name}")
        else:
            print("❌ Font recognition failed")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Test with specific image
        test_with_custom_image(sys.argv[1])
    else:
        # Test with default image
        test_simple_font_recognition()
