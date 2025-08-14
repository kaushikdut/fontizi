#!/usr/bin/env python3
"""
Simple Font Service - Storia AI Only
====================================

This service uses only your current Storia AI setup to identify fonts
and returns just the font name without any download functionality.
"""

import os
import sys
import logging
from typing import Dict, Optional

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import your existing Storia AI setup
try:
    from storia_model.enhanced_predict import predict_font_enhanced
except ImportError:
    try:
        from storia_model.predict import predict_font
    except ImportError:
        print("❌ Storia AI model not found. Please ensure the model is properly set up.")
        sys.exit(1)

logger = logging.getLogger(__name__)

class SimpleFontService:
    """
    Simple font recognition service using only Storia AI
    Returns only font name without download functionality
    """
    
    def __init__(self):
        self.storia_model_path = os.getenv('STORIA_MODEL_PATH', './storia_model')
        self.min_confidence = float(os.getenv('MIN_CONFIDENCE', '0.3'))
        
        # Check if Storia model is available
        self.storia_available = self._check_storia_availability()
        
        if not self.storia_available:
            logger.error("Storia AI model not available")
        else:
            logger.info("Simple Font Service initialized with Storia AI")
    
    def _check_storia_availability(self) -> bool:
        """Check if Storia AI model is available"""
        try:
            # Check if the model directory exists
            if os.path.exists(self.storia_model_path):
                logger.info(f"Storia model found at: {self.storia_model_path}")
                return True
            
            # Check if we can import the prediction function
            try:
                from storia_model.enhanced_predict import predict_font_enhanced
                return True
            except ImportError:
                try:
                    from storia_model.predict import predict_font
                    return True
                except ImportError:
                    return False
                    
        except Exception as e:
            logger.error(f"Error checking Storia availability: {str(e)}")
            return False
    
    def identify_font(self, image_path: str) -> Dict:
        """
        Identify font from image using Storia AI only
        Returns only the font name and confidence
        """
        try:
            if not self.storia_available:
                return {
                    "success": False,
                    "error": "Storia AI model not available",
                    "font_name": None,
                    "confidence": 0.0
                }
            
            if not os.path.exists(image_path):
                return {
                    "success": False,
                    "error": f"Image file not found: {image_path}",
                    "font_name": None,
                    "confidence": 0.0
                }
            
            # Use enhanced prediction if available, otherwise fallback to basic
            try:
                result = predict_font_enhanced(image_path, top_k=1, confidence_threshold=self.min_confidence)
            except Exception:
                # Fallback to basic prediction
                result = predict_font(image_path, top_k=1)
            
            if result.get('success') and result.get('top_prediction'):
                top_pred = result['top_prediction']
                
                # Extract font name
                font_name = top_pred.get('font', 'Unknown')
                confidence = top_pred.get('confidence', 0.0)
                
                return {
                    "success": True,
                    "font_name": font_name,
                    "confidence": confidence,
                    "processing_time": result.get('processing_time', 0),
                    "model_used": "Storia AI"
                }
            else:
                return {
                    "success": False,
                    "error": result.get('error', 'Font recognition failed'),
                    "font_name": None,
                    "confidence": 0.0
                }
                
        except Exception as e:
            logger.error(f"Error in font identification: {str(e)}")
            return {
                "success": False,
                "error": f"Recognition failed: {str(e)}",
                "font_name": None,
                "confidence": 0.0
            }
    
    def get_font_name_only(self, image_path: str) -> Optional[str]:
        """
        Get only the font name as a string
        Returns None if recognition fails
        """
        result = self.identify_font(image_path)
        
        if result.get('success'):
            return result.get('font_name')
        else:
            logger.error(f"Font recognition failed: {result.get('error')}")
            return None

# Global instance
simple_font_service = SimpleFontService()

def main():
    """Simple command line interface"""
    import argparse
    
    parser = argparse.ArgumentParser(description="Simple Font Recognition - Storia AI Only")
    parser.add_argument("image_path", help="Path to the image file")
    parser.add_argument("--name-only", action="store_true", help="Return only font name")
    
    args = parser.parse_args()
    
    service = SimpleFontService()
    
    if args.name_only:
        # Return only font name
        font_name = service.get_font_name_only(args.image_path)
        if font_name:
            print(font_name)
        else:
            print("Font recognition failed")
            sys.exit(1)
    else:
        # Return full result
        result = service.identify_font(args.image_path)
        
        if result['success']:
            print(f"Font: {result['font_name']}")
            print(f"Confidence: {result['confidence']:.3f}")
            print(f"Processing Time: {result['processing_time']:.2f}s")
        else:
            print(f"Error: {result['error']}")
            sys.exit(1)

if __name__ == "__main__":
    main()
