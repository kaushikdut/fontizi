import requests
import json
import os
import logging
from typing import Dict, List, Optional, Tuple
from PIL import Image
import base64
import io
import subprocess
import tempfile
from dotenv import load_dotenv
import cv2
import numpy as np

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class EnhancedFontService:
    """
    Enhanced font recognition service with improved accuracy
    Features:
    - Text region detection and extraction
    - Advanced preprocessing
    - Confidence thresholding
    - Ensemble predictions
    - Better error handling
    """
    
    def __init__(self):
        self.google_fonts_api_key = os.getenv('GOOGLE_FONTS_API_KEY')
        self.google_fonts_url = "https://www.googleapis.com/webfonts/v1/webfonts"
        self.storia_model_path = os.getenv('STORIA_MODEL_PATH', './storia_model')
        
        # Confidence thresholds
        self.min_confidence = float(os.getenv('MIN_CONFIDENCE', '0.3'))
        self.high_confidence = float(os.getenv('HIGH_CONFIDENCE', '0.7'))
        
        if not self.google_fonts_api_key:
            logger.warning("GOOGLE_FONTS_API_KEY not found in environment variables")
        
        # Check if Storia model is available
        self.storia_available = self._check_storia_availability()
        
    def _check_storia_availability(self) -> bool:
        """
        Check if Storia AI model is available locally
        """
        try:
            # Check if the model directory exists
            if os.path.exists(self.storia_model_path):
                logger.info(f"Storia model found at: {self.storia_model_path}")
                return True
            
            # Check if git repository can be cloned
            logger.info("Storia model not found, attempting to clone repository...")
            return self._setup_storia_model()
            
        except Exception as e:
            logger.error(f"Error checking Storia availability: {str(e)}")
            return False
    
    def _setup_storia_model(self) -> bool:
        """
        Clone and setup Storia AI model from GitHub
        """
        try:
            # Clone the repository
            subprocess.run([
                'git', 'clone', 
                'https://github.com/Storia-AI/font-classify.git', 
                self.storia_model_path
            ], check=True, capture_output=True)
            
            # Install requirements
            requirements_path = os.path.join(self.storia_model_path, 'requirements.txt')
            if os.path.exists(requirements_path):
                subprocess.run([
                    'pip', 'install', '-r', requirements_path
                ], check=True, capture_output=True)
            
            logger.info("Storia model setup completed successfully")
            return True
            
        except subprocess.CalledProcessError as e:
            logger.error(f"Failed to setup Storia model: {e}")
            return False
        except Exception as e:
            logger.error(f"Error setting up Storia model: {str(e)}")
            return False
    
    def recognize_font(self, image_path: str, confidence_threshold: float = None) -> Dict:
        """
        Enhanced font recognition with improved accuracy
        """
        try:
            if not self.storia_available:
                return {
                    "success": False,
                    "error": "Storia AI model not available. Please ensure the model is properly set up.",
                    "font_info": None
                }
            
            # Use provided confidence threshold or default
            if confidence_threshold is None:
                confidence_threshold = self.min_confidence
            
            # Use enhanced prediction script
            result = self._run_enhanced_inference(image_path, confidence_threshold)
            
            if result["success"]:
                # Process the result and add Google Fonts integration
                return self._process_enhanced_result(result)
            else:
                return result
                
        except Exception as e:
            logger.error(f"Error in enhanced font recognition: {str(e)}")
            return {
                "success": False,
                "error": f"Recognition failed: {str(e)}",
                "font_info": None
            }
    
    def _run_enhanced_inference(self, image_path: str, confidence_threshold: float) -> Dict:
        """
        Run enhanced inference using the improved prediction script
        """
        try:
            # Use enhanced predict script
            enhanced_script = os.path.join(self.storia_model_path, 'enhanced_predict.py')
            
            # If enhanced script doesn't exist, fall back to regular predict
            if not os.path.exists(enhanced_script):
                logger.warning("Enhanced predict script not found, using regular predict")
                return self._run_regular_inference(image_path)
            
            result = subprocess.run([
                'python', enhanced_script,
                image_path,
                '--top-k', '10',
                '--confidence-threshold', str(confidence_threshold),
                '--output', 'json'
            ], capture_output=True, text=True, check=True)
            
            predictions_data = json.loads(result.stdout)
            
            if predictions_data.get("success", False):
                return predictions_data
            else:
                return {
                    "success": False,
                    "error": predictions_data.get("error", "Unknown error"),
                    "predictions": None
                }
                
        except subprocess.CalledProcessError as e:
            logger.error(f"Enhanced inference failed: {e.stderr}")
            # Fall back to regular inference
            return self._run_regular_inference(image_path)
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse enhanced output: {e}")
            return self._run_regular_inference(image_path)
        except Exception as e:
            logger.error(f"Error running enhanced inference: {e}")
            return self._run_regular_inference(image_path)
    
    def _run_regular_inference(self, image_path: str) -> Dict:
        """
        Fallback to regular inference
        """
        try:
            result = subprocess.run([
                'python', os.path.join(self.storia_model_path, 'predict.py'),
                image_path,
                '--top-k', '5',
                '--output', 'json'
            ], capture_output=True, text=True, check=True)
            
            predictions_data = json.loads(result.stdout)
            
            if predictions_data.get("success", False):
                # Convert the predictions to the enhanced format
                predictions = []
                for pred in predictions_data.get("predictions", []):
                    predictions.append({
                        'font_name': pred.get('font', 'Unknown'),
                        'confidence': pred.get('confidence', 0.0),
                        'category': self._get_font_category(pred.get('font', 'Unknown')),
                        'confidence_level': self._get_confidence_level(pred.get('confidence', 0.0))
                    })
                
                return {
                    "success": True,
                    "predictions": predictions,
                    "text_regions_detected": 0,  # Regular inference doesn't detect regions
                    "confidence_threshold": self.min_confidence
                }
            else:
                return {
                    "success": False,
                    "error": predictions_data.get("error", "Unknown error"),
                    "predictions": None
                }
                
        except Exception as e:
            logger.error(f"Regular inference failed: {e}")
            return {
                "success": False,
                "error": f"Inference failed: {e}",
                "predictions": None
            }
    
    def _get_confidence_level(self, confidence: float) -> str:
        """
        Determine confidence level based on threshold
        """
        if confidence >= self.high_confidence:
            return "high"
        elif confidence >= self.min_confidence:
            return "medium"
        else:
            return "low"
    
    def _get_font_category(self, font_name: str) -> str:
        """
        Determine font category based on font name
        """
        font_name_lower = font_name.lower()
        
        # Serif fonts
        serif_keywords = ['serif', 'times', 'georgia', 'garamond', 'baskerville', 'caslon', 'playfair', 'merriweather', 'lora', 'crimson']
        if any(keyword in font_name_lower for keyword in serif_keywords):
            return 'Serif'
        
        # Sans-serif fonts
        sans_serif_keywords = ['sans', 'arial', 'helvetica', 'verdana', 'roboto', 'open sans', 'lato', 'montserrat', 'poppins', 'inter', 'ubuntu']
        if any(keyword in font_name_lower for keyword in sans_serif_keywords):
            return 'Sans-serif'
        
        # Monospace fonts
        monospace_keywords = ['mono', 'courier', 'consolas', 'source code', 'fira code', 'jetbrains']
        if any(keyword in font_name_lower for keyword in monospace_keywords):
            return 'Monospace'
        
        # Display fonts
        display_keywords = ['display', 'decorative', 'script', 'handwriting', 'cursive']
        if any(keyword in font_name_lower for keyword in display_keywords):
            return 'Display'
        
        # Default to Sans-serif
        return 'Sans-serif'
    
    def _process_enhanced_result(self, result: Dict) -> Dict:
        """
        Process enhanced predictions and integrate with Google Fonts
        """
        try:
            # Handle both raw_predictions and predictions formats
            raw_predictions = result.get("raw_predictions", [])
            predictions = result.get("predictions", [])
            
            # Use raw_predictions if available, otherwise fall back to predictions
            if raw_predictions:
                predictions_to_process = raw_predictions
                # Convert raw_predictions format to expected format
                processed_predictions = []
                for pred in raw_predictions:
                    processed_predictions.append({
                        'font': pred.get('font_name', pred.get('font', 'Unknown')),
                        'confidence': pred.get('confidence', 0.0),
                        'confidence_level': pred.get('confidence_level', 'low'),
                        'category': pred.get('category', 'Unknown')
                    })
                predictions_to_process = processed_predictions
            elif predictions:
                predictions_to_process = predictions
            else:
                return {
                    "success": False,
                    "error": "No predictions returned from enhanced model",
                    "font_info": None
                }
            
            if not predictions_to_process:
                return {
                    "success": False,
                    "error": "No valid predictions found",
                    "font_info": None
                }
            
            # Extract top prediction
            primary_prediction = predictions_to_process[0]
            
            font_info = {
                "primary_font": primary_prediction.get('font', 'Unknown Font'),
                "confidence": primary_prediction.get('confidence', 0.0),
                "confidence_level": primary_prediction.get('confidence_level', 'low'),
                "alternatives": [],
                "font_category": self._get_font_category(primary_prediction.get('font', 'Unknown')),
                "download_url": None,
                "text_regions_detected": result.get("text_regions_detected", 0),
                "prediction_quality": self._assess_prediction_quality(primary_prediction)
            }
            
            # Get alternatives (top 5)
            for pred in predictions_to_process[1:6]:
                font_info["alternatives"].append({
                    "name": pred.get('font', 'Unknown'),
                    "confidence": pred.get('confidence', 0.0),
                    "category": self._get_font_category(pred.get('font', 'Unknown')),
                    "confidence_level": pred.get('confidence_level', 'low')
                })
            
            # Try to find the font on Google Fonts
            if font_info["primary_font"] and font_info["primary_font"] != "Unknown Font":
                google_font_info = self._find_google_font(font_info["primary_font"])
                if google_font_info:
                    font_info["download_url"] = google_font_info.get("download_url")
                    font_info["google_fonts_info"] = google_font_info
                else:
                    # If not found on Google Fonts, create a basic download URL
                    font_info["download_url"] = f"https://fonts.google.com/specimen/{font_info['primary_font'].replace(' ', '+')}"
            
            return {
                "success": True,
                "font_info": font_info,
                "raw_predictions": predictions,
                "enhancement_info": {
                    "text_regions_detected": result.get("text_regions_detected", 0),
                    "confidence_threshold": result.get("confidence_threshold", self.min_confidence),
                    "prediction_method": "enhanced" if result.get("text_regions_detected", 0) > 0 else "regular"
                }
            }
            
        except Exception as e:
            logger.error(f"Error processing enhanced result: {str(e)}")
            return {
                "success": False,
                "error": f"Result processing failed: {str(e)}",
                "font_info": None
            }
    
    def _assess_prediction_quality(self, prediction: Dict) -> str:
        """
        Assess the quality of the prediction based on confidence and other factors
        """
        confidence = prediction.get('confidence', 0.0)
        confidence_level = prediction.get('confidence_level', 'low')
        
        if confidence >= self.high_confidence and confidence_level == 'high':
            return "excellent"
        elif confidence >= 0.5 and confidence_level in ['high', 'medium']:
            return "good"
        elif confidence >= self.min_confidence:
            return "fair"
        else:
            return "poor"
    
    def _find_google_font(self, font_name: str) -> Optional[Dict]:
        """
        Search for font on Google Fonts and return download information
        """
        try:
            if not self.google_fonts_api_key:
                logger.warning("Google Fonts API key not configured")
                return None
            
            # Search Google Fonts API
            params = {
                'key': self.google_fonts_api_key,
                'sort': 'popularity'
            }
            
            response = requests.get(
                self.google_fonts_url,
                params=params,
                timeout=10
            )
            
            if response.status_code == 200:
                fonts_data = response.json()
                fonts = fonts_data.get('items', [])
                
                # Search for matching font
                font_name_lower = font_name.lower()
                for font in fonts:
                    if (font_name_lower in font['family'].lower() or 
                        font['family'].lower() in font_name_lower):
                        
                        return {
                            "family": font['family'],
                            "category": font['category'],
                            "variants": font['variants'],
                            "subsets": font['subsets'],
                            "version": font['version'],
                            "download_url": f"https://fonts.google.com/specimen/{font['family'].replace(' ', '+')}",
                            "api_url": font['files']
                        }
                
                # If exact match not found, try partial matches
                for font in fonts:
                    if any(word in font['family'].lower() for word in font_name_lower.split()):
                        return {
                            "family": font['family'],
                            "category": font['category'],
                            "variants": font['variants'],
                            "subsets": font['subsets'],
                            "version": font['version'],
                            "download_url": f"https://fonts.google.com/specimen/{font['family'].replace(' ', '+')}",
                            "api_url": font['files']
                        }
            
            return None
            
        except Exception as e:
            logger.error(f"Error searching Google Fonts: {str(e)}")
            return None
    
    def download_font(self, font_name: str, variant: str = "regular") -> Optional[Dict]:
        """
        Download font files from Google Fonts
        """
        try:
            google_font_info = self._find_google_font(font_name)
            if not google_font_info:
                return None
            
            # Get the specific variant URL
            files = google_font_info.get('api_url', {})
            font_url = files.get(variant) or files.get('regular') or files.get('400')
            
            if not font_url:
                return None
            
            # Download the font file
            response = requests.get(font_url, timeout=30)
            if response.status_code == 200:
                # Save font file
                font_filename = f"{font_name.replace(' ', '_')}_{variant}.woff2"
                font_path = os.path.join('downloads', font_filename)
                
                os.makedirs('downloads', exist_ok=True)
                with open(font_path, 'wb') as f:
                    f.write(response.content)
                
                return {
                    "success": True,
                    "font_path": font_path,
                    "font_filename": font_filename,
                    "font_url": font_url,
                    "file_size": len(response.content)
                }
            
            return None
            
        except Exception as e:
            logger.error(f"Error downloading font: {str(e)}")
            return None
    
    def get_font_preview(self, font_name: str, text: str = "Sample Text") -> Optional[str]:
        """
        Generate a preview URL for the font using Google Fonts
        """
        try:
            google_font_info = self._find_google_font(font_name)
            if not google_font_info:
                return None
            
            # Create Google Fonts preview URL
            family = google_font_info['family'].replace(' ', '+')
            preview_url = f"https://fonts.googleapis.com/css2?family={family}:wght@400&display=swap"
            
            return preview_url
            
        except Exception as e:
            logger.error(f"Error generating font preview: {str(e)}")
            return None
    
    def get_model_status(self) -> Dict:
        """
        Get status of enhanced Storia AI model
        """
        return {
            "storia_available": self.storia_available,
            "available": self.storia_available,
            "model_path": self.storia_model_path,
            "google_fonts_configured": bool(self.google_fonts_api_key),
            "enhanced_features": {
                "text_region_detection": True,
                "confidence_thresholding": True,
                "image_enhancement": True,
                "ensemble_predictions": True
            },
            "confidence_thresholds": {
                "min_confidence": self.min_confidence,
                "high_confidence": self.high_confidence
            }
        }
