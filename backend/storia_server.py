#!/usr/bin/env python3
"""
Storia AI Font Recognition Server
Flask server for font recognition using Storia AI local model
"""

from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import logging
from werkzeug.utils import secure_filename
from storia_font_service import StoriaFontService
import json

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp', 'tiff', 'webp'}
MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16MB max file size

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_CONTENT_LENGTH

# Initialize Storia AI service
storia_service = StoriaFontService()

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def ensure_upload_folder():
    """Ensure upload folder exists"""
    if not os.path.exists(UPLOAD_FOLDER):
        os.makedirs(UPLOAD_FOLDER)

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Storia AI Font Recognition',
        'version': '1.0.0'
    })

@app.route('/api/storia/status', methods=['GET'])
def storia_status():
    """Check Storia AI model status"""
    try:
        status = storia_service.get_model_status()
        return jsonify(status)
    except Exception as e:
        logger.error(f"Error checking Storia status: {e}")
        return jsonify({
            'error': 'Failed to check Storia AI status',
            'details': str(e)
        }), 500

@app.route('/api/storia/identify-font', methods=['POST'])
def identify_font_storia():
    """
    Identify font using Storia AI local model
    """
    try:
        # Check if file was uploaded
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Ensure upload folder exists
        ensure_upload_folder()
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        logger.info(f"Processing image: {filename}")
        
        # Recognize font using Storia AI
        result = storia_service.recognize_font(filepath)
        
        # Clean up uploaded file
        try:
            os.remove(filepath)
        except:
            pass
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in font identification: {e}")
        return jsonify({
            'error': 'Font identification failed',
            'details': str(e)
        }), 500

@app.route('/api/identify-font', methods=['POST'])
def identify_font_compatibility():
    """
    Compatibility endpoint for frontend - redirects to Storia AI
    """
    logger.info("Compatibility endpoint /api/identify-font called - redirecting to Storia AI")
    
    try:
        # Check if file was uploaded
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Ensure upload folder exists
        ensure_upload_folder()
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        logger.info(f"Processing image via compatibility endpoint: {filename}")
        
        # Recognize font using Storia AI
        result = storia_service.recognize_font(filepath)
        
        # Clean up uploaded file
        try:
            os.remove(filepath)
        except:
            pass
        
        # Convert to the expected format for frontend compatibility
        logger.info(f"Result structure: {list(result.keys())}")
        if result.get("success", False) and result.get("font_info"):
            font_info = result["font_info"]
            logger.info(f"Font info structure: {list(font_info.keys())}")
            response_data = {
                "success": True,
                "prediction": {
                    "font": font_info.get("primary_font", "Unknown"),
                    "confidence": font_info.get("confidence", 0.0),
                    "category": font_info.get("font_category", "Unknown"),
                    "alternatives": [
                        {
                            "font": alt.get("name", "Unknown"),
                            "confidence": alt.get("confidence", 0.0)
                        }
                        for alt in font_info.get("alternatives", [])
                    ]
                },
                "download_url": font_info.get("download_url")
            }
            logger.info(f"Returning formatted response with prediction object")
            return jsonify(response_data)
        else:
            logger.info(f"Returning original result: {result}")
            return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error in compatibility endpoint: {e}")
        return jsonify({
            'error': 'Font identification failed',
            'details': str(e)
        }), 500

@app.route('/api/google-fonts/search', methods=['GET'])
def search_google_fonts():
    """
    Search for fonts on Google Fonts
    """
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify({'error': 'Search query required'}), 400
        
        result = storia_service.search_google_fonts(query)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error searching Google Fonts: {e}")
        return jsonify({
            'error': 'Google Fonts search failed',
            'details': str(e)
        }), 500

@app.route('/api/google-fonts/download', methods=['POST'])
def download_google_font():
    """
    Download font from Google Fonts
    """
    try:
        data = request.get_json()
        if not data or 'font_family' not in data:
            return jsonify({'error': 'Font family required'}), 400
        
        font_family = data['font_family']
        variants = data.get('variants', ['regular'])
        
        result = storia_service.download_font(font_family, variants)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error downloading font: {e}")
        return jsonify({
            'error': 'Font download failed',
            'details': str(e)
        }), 500

@app.route('/api/google-fonts/preview', methods=['GET'])
def get_font_preview():
    """
    Get font preview URL from Google Fonts
    """
    try:
        font_family = request.args.get('font_family', '')
        if not font_family:
            return jsonify({'error': 'Font family required'}), 400
        
        result = storia_service.get_font_preview(font_family)
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"Error getting font preview: {e}")
        return jsonify({
            'error': 'Failed to get font preview',
            'details': str(e)
        }), 500

@app.route('/api/fonts', methods=['GET'])
def get_available_fonts():
    """
    Get list of available fonts in the database
    """
    try:
        # Return a list of fonts that Storia AI can recognize
        fonts = [
            {"name": "Arial", "category": "Sans-serif", "family": "Arial"},
            {"name": "Helvetica", "category": "Sans-serif", "family": "Helvetica"},
            {"name": "Times New Roman", "category": "Serif", "family": "Times New Roman"},
            {"name": "Georgia", "category": "Serif", "family": "Georgia"},
            {"name": "Verdana", "category": "Sans-serif", "family": "Verdana"},
            {"name": "Roboto", "category": "Sans-serif", "family": "Roboto"},
            {"name": "Open Sans", "category": "Sans-serif", "family": "Open Sans"},
            {"name": "Lato", "category": "Sans-serif", "family": "Lato"},
            {"name": "Montserrat", "category": "Sans-serif", "family": "Montserrat"},
            {"name": "Poppins", "category": "Sans-serif", "family": "Poppins"},
            {"name": "Inter", "category": "Sans-serif", "family": "Inter"},
            {"name": "Ubuntu", "category": "Sans-serif", "family": "Ubuntu"},
            {"name": "Source Sans Pro", "category": "Sans-serif", "family": "Source Sans Pro"},
            {"name": "Nunito", "category": "Sans-serif", "family": "Nunito"},
            {"name": "Raleway", "category": "Sans-serif", "family": "Raleway"},
            {"name": "Playfair Display", "category": "Serif", "family": "Playfair Display"},
            {"name": "Merriweather", "category": "Serif", "family": "Merriweather"},
            {"name": "Lora", "category": "Serif", "family": "Lora"},
            {"name": "Crimson Text", "category": "Serif", "family": "Crimson Text"},
            {"name": "Libre Baskerville", "category": "Serif", "family": "Libre Baskerville"}
        ]
        
        return jsonify({
            'total': len(fonts),
            'fonts': fonts
        })
        
    except Exception as e:
        logger.error(f"Error getting fonts: {e}")
        return jsonify({
            'error': 'Failed to get fonts',
            'details': str(e)
        }), 500

@app.route('/api/model/info', methods=['GET'])
def get_model_info():
    """
    Get information about the Storia AI model
    """
    try:
        model_info = {
            'name': 'Storia AI Font Classifier',
            'architecture': 'Local AI Model',
            'input_shape': 'Variable (Image)',
            'output_classes': 'Multiple font categories',
            'model_type': 'Open-source local model',
            'repository': 'https://github.com/Storia-AI/font-classify',
            'features': [
                'Local processing (no API calls)',
                'Offline capability',
                'High accuracy font recognition',
                'Support for multiple font categories'
            ]
        }
        
        return jsonify({
            'model_info': model_info
        })
        
    except Exception as e:
        logger.error(f"Error getting model info: {e}")
        return jsonify({
            'error': 'Failed to get model info',
            'details': str(e)
        }), 500

@app.errorhandler(413)
def too_large(e):
    """Handle file too large error"""
    return jsonify({'error': 'File too large. Maximum size is 16MB.'}), 413

@app.errorhandler(404)
def not_found(e):
    """Handle 404 errors"""
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(e):
    """Handle internal server errors"""
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Check if Storia AI model is available
    status = storia_service.get_model_status()
    if not status.get('storia_available', False):
        logger.warning("Storia AI model not available. Some features may not work.")
    
    # Start the server
    port = int(os.environ.get('PORT', 3001))
    debug = os.environ.get('FLASK_DEBUG', 'False').lower() == 'true'
    
    logger.info(f"Starting Storia AI Font Recognition Server on port {port}")
    logger.info(f"Debug mode: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug)
