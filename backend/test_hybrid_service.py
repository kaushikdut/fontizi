#!/usr/bin/env python3
"""
Simple Test Script for Hybrid Font Service
==========================================

This script provides a quick way to test the hybrid font recognition service.
"""

import os
import sys
from hybrid_font_service import HybridFontService

def test_hybrid_service():
    """Test the hybrid font service with a sample image"""
    
    print("🧪 Testing Hybrid Font Service")
    print("=" * 40)
    
    # Initialize the service
    print("🔧 Initializing Hybrid Font Service...")
    service = HybridFontService()
    
    # Check available services
    print(f"\n📊 Available Services:")
    print(f"   WhatTheFont API: {'✅' if service.whatthefont_available else '❌'}")
    print(f"   Google Fonts API: {'✅' if service.google_fonts_available else '❌'}")
    print(f"   OpenAI API: {'✅' if service.openai_available else '❌'}")
    print(f"   Custom Database: {'✅' if service.custom_font_db else '❌'}")
    
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
        result = service.recognize_font_hybrid(image_path)
        
        # Display results
        print(f"\n📊 Results:")
        print("-" * 30)
        
        if result.get('success'):
            top_pred = result.get('top_prediction')
            if top_pred:
                print(f"🏆 Top Prediction: {top_pred['font']}")
                print(f"   Confidence: {top_pred['confidence']:.3f}")
                print(f"   Services: {', '.join(top_pred.get('services_used', []))}")
            
            predictions = result.get('predictions', [])
            if predictions:
                print(f"\n📋 All Predictions:")
                for i, pred in enumerate(predictions[:3], 1):
                    print(f"   {i}. {pred['font']} ({pred['confidence']:.3f})")
            
            print(f"\n⏱️  Processing Time: {result.get('processing_time', 0):.2f}s")
            print(f"🔗 Services Used: {', '.join(result.get('services_used', []))}")
            print(f"🎯 Hybrid Confidence: {result.get('hybrid_confidence', 0):.3f}")
            
        else:
            print(f"❌ Error: {result.get('error', 'Unknown error')}")
            
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
    
    service = HybridFontService()
    
    try:
        result = service.recognize_font_hybrid(image_path)
        
        if result.get('success'):
            top_pred = result.get('top_prediction')
            if top_pred:
                print(f"🏆 Font: {top_pred['font']}")
                print(f"   Confidence: {top_pred['confidence']:.3f}")
                print(f"   Services: {', '.join(top_pred.get('services_used', []))}")
            
            print(f"\n⏱️  Time: {result.get('processing_time', 0):.2f}s")
        else:
            print(f"❌ Error: {result.get('error')}")
            
    except Exception as e:
        print(f"❌ Exception: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Test with specific image
        test_with_custom_image(sys.argv[1])
    else:
        # Test with default image
        test_hybrid_service()
