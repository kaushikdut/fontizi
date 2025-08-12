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

# Load environment variables
load_dotenv()

logger = logging.getLogger(__name__)

class StoriaFontService:
    """
    Font recognition service using Storia AI open-source model
    Combined with Google Fonts API for font downloading
    """
    
    def __init__(self):
        self.google_fonts_api_key = os.getenv('GOOGLE_FONTS_API_KEY')
        self.google_fonts_url = "https://www.googleapis.com/webfonts/v1/webfonts"
        self.storia_model_path = os.getenv('STORIA_MODEL_PATH', './storia_model')
        
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
    
    def recognize_font(self, image_path: str) -> Dict:
        """
        Recognize font from image using Storia AI local model
        """
        try:
            if not self.storia_available:
                return {
                    "success": False,
                    "error": "Storia AI model not available. Please ensure the model is properly set up.",
                    "font_info": None
                }
            
            # Prepare image for Storia model
            # The model expects specific input format
            processed_image_path = self._preprocess_image(image_path)
            
            # Run Storia model inference
            result = self._run_storia_inference(processed_image_path)
            
            if result["success"]:
                # Process the result and add Google Fonts integration
                return self._process_storia_result(result["predictions"])
            else:
                return result
                
        except Exception as e:
            logger.error(f"Error in font recognition: {str(e)}")
            return {
                "success": False,
                "error": f"Recognition failed: {str(e)}",
                "font_info": None
            }
    
    def _preprocess_image(self, image_path: str) -> str:
        """
        Preprocess image for Storia AI model input
        """
        try:
            # Load and preprocess image
            image = Image.open(image_path)
            
            # Convert to RGB if necessary
            if image.mode != 'RGB':
                image = image.convert('RGB')
            
            # Resize to expected input size (adjust based on Storia model requirements)
            # Typical input size for font classification models
            target_size = (224, 224)  # Adjust based on actual model requirements
            image = image.resize(target_size, Image.Resampling.LANCZOS)
            
            # Save preprocessed image
            temp_dir = tempfile.mkdtemp()
            processed_path = os.path.join(temp_dir, 'preprocessed_image.jpg')
            image.save(processed_path, 'JPEG', quality=95)
            
            return processed_path
            
        except Exception as e:
            logger.error(f"Error preprocessing image: {str(e)}")
            raise
    
    def _run_storia_inference(self, image_path: str) -> Dict:
        """
        Run inference using Storia AI model
        """
        try:
            # Use our working predict.py script
            result = subprocess.run([
                'python', os.path.join(self.storia_model_path, 'predict.py'),
                image_path,
                '--top-k', '5',
                '--output', 'json'
            ], capture_output=True, text=True, check=True)
            
            predictions_data = json.loads(result.stdout)
            
            if predictions_data.get("success", False):
                # Convert the predictions to the expected format
                predictions = []
                for pred in predictions_data.get("predictions", []):
                    predictions.append({
                        'font_name': pred.get('font', 'Unknown'),
                        'confidence': pred.get('confidence', 0.0),
                        'category': self._get_font_category(pred.get('font', 'Unknown'))
                    })
                
                return {
                    "success": True,
                    "predictions": predictions
                }
            else:
                return {
                    "success": False,
                    "error": predictions_data.get("error", "Unknown error"),
                    "predictions": None
                }
                
        except subprocess.CalledProcessError as e:
            logger.error(f"Storia inference failed: {e.stderr}")
            return {
                "success": False,
                "error": f"Inference failed: {e.stderr}",
                "predictions": None
            }
        except json.JSONDecodeError as e:
            logger.error(f"Failed to parse Storia output: {e}")
            return {
                "success": False,
                "error": f"Failed to parse model output: {e}",
                "predictions": None
            }
        except Exception as e:
            logger.error(f"Error running Storia inference: {e}")
            return {
                "success": False,
                "error": f"Inference error: {e}",
                "predictions": None
            }
    
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
    
    def _process_storia_result(self, predictions: List[Dict]) -> Dict:
        """
        Process Storia AI predictions and integrate with Google Fonts
        """
        try:
            if not predictions:
                return {
                    "success": False,
                    "error": "No predictions returned from Storia model",
                    "font_info": None
                }
            
            # Extract top prediction
            primary_prediction = predictions[0]
            
            font_info = {
                "primary_font": primary_prediction.get('font_name', 'Unknown Font'),
                "confidence": primary_prediction.get('confidence', 0.0),
                "alternatives": [],
                "font_category": primary_prediction.get('category', 'Unknown'),
                "download_url": None
            }
            
            # Get alternatives (top 5)
            for pred in predictions[1:6]:
                font_info["alternatives"].append({
                    "name": pred.get('font_name', 'Unknown'),
                    "confidence": pred.get('confidence', 0.0),
                    "category": pred.get('category', 'Unknown')
                })
            
            # Try to find the font on Google Fonts
            if font_info["primary_font"]:
                google_font_info = self._find_google_font(font_info["primary_font"])
                if google_font_info:
                    font_info["download_url"] = google_font_info.get("download_url")
                    font_info["google_fonts_info"] = google_font_info
            
            return {
                "success": True,
                "font_info": font_info,
                "raw_predictions": predictions
            }
            
        except Exception as e:
            logger.error(f"Error processing Storia result: {str(e)}")
            return {
                "success": False,
                "error": f"Result processing failed: {str(e)}",
                "font_info": None
            }
    
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
        Get status of Storia AI model
        """
        return {
            "storia_available": self.storia_available,
            "available": self.storia_available,
            "model_path": self.storia_model_path,
            "google_fonts_configured": bool(self.google_fonts_api_key)
        }
