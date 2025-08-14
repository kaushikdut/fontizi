#!/usr/bin/env python3
"""
Enhanced Storia AI Font Recognition Server
Improved accuracy with better preprocessing and confidence filtering
"""

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import logging
import tempfile
from werkzeug.utils import secure_filename
from PIL import Image
import io
import base64
import json
from datetime import datetime

# Import enhanced font service
from enhanced_font_service import EnhancedFontService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'webp', 'bmp', 'tiff'}
MAX_FILE_SIZE = 16 * 1024 * 1024  # 16MB

# Create upload folder
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize enhanced font service
font_service = EnhancedFontService()

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_image(file):
    """Validate uploaded image"""
    try:
        # Check file size
        file.seek(0, 2)  # Seek to end
        file_size = file.tell()
        file.seek(0)  # Reset to beginning
        
        if file_size > MAX_FILE_SIZE:
            return False, f"File size ({file_size / 1024 / 1024:.1f}MB) exceeds maximum allowed size (16MB)"
        
        # Check if it's a valid image
        image = Image.open(file)
        image.verify()
        file.seek(0)  # Reset to beginning
        
        return True, "Valid image"
        
    except Exception as e:
        return False, f"Invalid image file: {str(e)}"

def preprocess_image(image_path):
    """Preprocess image for better font recognition"""
    try:
        # Load image
        image = Image.open(image_path)
        
        # Convert to RGB if necessary
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Check image dimensions
        width, height = image.size
        if width < 50 or height < 50:
            return False, "Image too small for font recognition"
        
        if width > 4000 or height > 4000:
            # Resize large images
            image.thumbnail((4000, 4000), Image.Resampling.LANCZOS)
            image.save(image_path, quality=95)
        
        return True, "Image preprocessed successfully"
        
    except Exception as e:
        return False, f"Error preprocessing image: {str(e)}"

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    try:
        status = font_service.get_model_status()
        return jsonify({
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "model_status": status,
            "enhanced_features": {
                "text_region_detection": True,
                "confidence_thresholding": True,
                "image_enhancement": True,
                "ensemble_predictions": True
            }
        })
    except Exception as e:
        return jsonify({
            "status": "unhealthy",
            "error": str(e),
            "timestamp": datetime.now().isoformat()
        }), 500

@app.route('/api/storia/identify-font', methods=['POST'])
def identify_font():
    """Enhanced font identification endpoint"""
    try:
        # Check if image file is present
        if 'image' not in request.files:
            return jsonify({
                "success": False,
                "error": "No image file provided"
            }), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({
                "success": False,
                "error": "No image file selected"
            }), 400
        
        # Validate file
        is_valid, message = validate_image(file)
        if not is_valid:
            return jsonify({
                "success": False,
                "error": message
            }), 400
        
        # Get confidence threshold from request
        confidence_threshold = request.form.get('confidence_threshold', None)
        if confidence_threshold:
            try:
                confidence_threshold = float(confidence_threshold)
                if not (0.0 <= confidence_threshold <= 1.0):
                    return jsonify({
                        "success": False,
                        "error": "Confidence threshold must be between 0.0 and 1.0"
                    }), 400
            except ValueError:
                return jsonify({
                    "success": False,
                    "error": "Invalid confidence threshold value"
                }), 400
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_path = os.path.join(UPLOAD_FOLDER, f"{timestamp}_{filename}")
        file.save(file_path)
        
        # Preprocess image
        preprocess_success, preprocess_message = preprocess_image(file_path)
        if not preprocess_success:
            return jsonify({
                "success": False,
                "error": preprocess_message
            }), 400
        
        # Perform font recognition
        result = font_service.recognize_font(file_path, confidence_threshold)
        
        # Add metadata to response
        if result["success"]:
            result["metadata"] = {
                "filename": filename,
                "upload_timestamp": timestamp,
                "file_size": os.path.getsize(file_path),
                "preprocessing_status": preprocess_message,
                "confidence_threshold_used": confidence_threshold or font_service.min_confidence
            }
        
        # Clean up uploaded file
        try:
            os.remove(file_path)
        except:
            pass  # Ignore cleanup errors
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in font identification: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}"
        }), 500

@app.route('/api/storia/identify-font-base64', methods=['POST'])
def identify_font_base64():
    """Font identification endpoint for base64 encoded images"""
    try:
        data = request.get_json()
        if not data or 'image' not in data:
            return jsonify({
                "success": False,
                "error": "No base64 image data provided"
            }), 400
        
        # Decode base64 image
        try:
            image_data = base64.b64decode(data['image'])
            image = Image.open(io.BytesIO(image_data))
        except Exception as e:
            return jsonify({
                "success": False,
                "error": f"Invalid base64 image data: {str(e)}"
            }), 400
        
        # Get confidence threshold
        confidence_threshold = data.get('confidence_threshold', None)
        if confidence_threshold:
            try:
                confidence_threshold = float(confidence_threshold)
                if not (0.0 <= confidence_threshold <= 1.0):
                    return jsonify({
                        "success": False,
                        "error": "Confidence threshold must be between 0.0 and 1.0"
                    }), 400
            except ValueError:
                return jsonify({
                    "success": False,
                    "error": "Invalid confidence threshold value"
                }), 400
        
        # Save temporary file
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        temp_path = os.path.join(UPLOAD_FOLDER, f"temp_{timestamp}.png")
        image.save(temp_path)
        
        # Preprocess image
        preprocess_success, preprocess_message = preprocess_image(temp_path)
        if not preprocess_success:
            return jsonify({
                "success": False,
                "error": preprocess_message
            }), 400
        
        # Perform font recognition
        result = font_service.recognize_font(temp_path, confidence_threshold)
        
        # Add metadata
        if result["success"]:
            result["metadata"] = {
                "image_format": image.format,
                "image_size": image.size,
                "upload_timestamp": timestamp,
                "preprocessing_status": preprocess_message,
                "confidence_threshold_used": confidence_threshold or font_service.min_confidence
            }
        
        # Clean up
        try:
            os.remove(temp_path)
        except:
            pass
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in base64 font identification: {str(e)}")
        return jsonify({
            "success": False,
            "error": f"Internal server error: {str(e)}"
        }), 500

@app.route('/api/storia/status', methods=['GET'])
def get_model_status():
    """Get enhanced model status"""
    try:
        status = font_service.get_model_status()
        return jsonify({
            "success": True,
            "status": status,
            "enhanced_features": {
                "text_region_detection": True,
                "confidence_thresholding": True,
                "image_enhancement": True,
                "ensemble_predictions": True,
                "advanced_preprocessing": True
            },
            "confidence_thresholds": {
                "min_confidence": font_service.min_confidence,
                "high_confidence": font_service.high_confidence
            }
        })
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/google-fonts/search', methods=['GET'])
def search_google_fonts():
    """Search Google Fonts"""
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify({
                "success": False,
                "error": "Search query is required"
            }), 400
        
        # This would integrate with Google Fonts API
        # For now, return a placeholder response
        return jsonify({
            "success": True,
            "query": query,
            "results": [],
            "message": "Google Fonts search not yet implemented"
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/google-fonts/download', methods=['POST'])
def download_font():
    """Download font from Google Fonts"""
    try:
        data = request.get_json()
        if not data or 'font_name' not in data:
            return jsonify({
                "success": False,
                "error": "Font name is required"
            }), 400
        
        font_name = data['font_name']
        variant = data.get('variant', 'regular')
        
        result = font_service.download_font(font_name, variant)
        
        if result:
            return jsonify({
                "success": True,
                "font_info": result
            })
        else:
            return jsonify({
                "success": False,
                "error": f"Could not download font: {font_name}"
            }), 404
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/fonts/preview', methods=['GET'])
def get_font_preview():
    """Get font preview URL"""
    try:
        font_name = request.args.get('font_name', '')
        text = request.args.get('text', 'Sample Text')
        
        if not font_name:
            return jsonify({
                "success": False,
                "error": "Font name is required"
            }), 400
        
        preview_url = font_service.get_font_preview(font_name, text)
        
        if preview_url:
            return jsonify({
                "success": True,
                "preview_url": preview_url,
                "font_name": font_name,
                "sample_text": text
            })
        else:
            return jsonify({
                "success": False,
                "error": f"Could not generate preview for font: {font_name}"
            }), 404
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.route('/api/accuracy/improve', methods=['POST'])
def improve_accuracy():
    """Endpoint to provide feedback for accuracy improvement"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({
                "success": False,
                "error": "No feedback data provided"
            }), 400
        
        # Log feedback for model improvement
        feedback = {
            "timestamp": datetime.now().isoformat(),
            "user_feedback": data,
            "model_version": "enhanced_v1.0"
        }
        
        # Save feedback to file (in production, this would go to a database)
        feedback_file = "accuracy_feedback.jsonl"
        with open(feedback_file, "a") as f:
            f.write(json.dumps(feedback) + "\n")
        
        return jsonify({
            "success": True,
            "message": "Feedback received and logged for model improvement",
            "feedback_id": datetime.now().strftime("%Y%m%d_%H%M%S")
        })
        
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({
        "success": False,
        "error": "Endpoint not found"
    }), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({
        "success": False,
        "error": "Internal server error"
    }), 500

if __name__ == '__main__':
    print("🚀 Starting Enhanced Storia AI Font Recognition Server...")
    print("📊 Enhanced Features:")
    print("  - Text region detection and extraction")
    print("  - Advanced image preprocessing")
    print("  - Confidence thresholding")
    print("  - Ensemble predictions")
    print("  - Better error handling")
    print("  - Base64 image support")
    print("  - Accuracy feedback collection")
    
    app.run(host='0.0.0.0', port=3001, debug=True)
