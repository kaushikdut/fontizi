#!/usr/bin/env python3
"""
Simple Font API - Storia AI Only
================================

Flask API that uses only Storia AI to identify fonts
and returns just the font name without download functionality.
"""

from flask import Flask, request, jsonify
from simple_font_service import SimpleFontService
import os
import tempfile
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
service = SimpleFontService()

@app.route('/api/font/identify', methods=['POST'])
def identify_font():
    """Identify font from uploaded image"""
    try:
        # Check if file was uploaded
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image file provided',
                'font_name': None
            }), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected',
                'font_name': None
            }), 400
        
        # Check file extension
        allowed_extensions = {'png', 'jpg', 'jpeg', 'webp', 'bmp'}
        if not file.filename.lower().endswith(tuple('.' + ext for ext in allowed_extensions)):
            return jsonify({
                'success': False,
                'error': 'Invalid file type. Supported: PNG, JPG, JPEG, WEBP, BMP',
                'font_name': None
            }), 400
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
            file.save(tmp.name)
            tmp_path = tmp.name
        
        try:
            # Identify font
            result = service.identify_font(tmp_path)
            
            # Clean up temporary file
            os.unlink(tmp_path)
            
            if result['success']:
                return jsonify({
                    'success': True,
                    'font_name': result['font_name'],
                    'confidence': result['confidence'],
                    'processing_time': result['processing_time'],
                    'model_used': result['model_used']
                })
            else:
                return jsonify({
                    'success': False,
                    'error': result['error'],
                    'font_name': None
                }), 500
                
        except Exception as e:
            # Clean up temporary file
            try:
                os.unlink(tmp_path)
            except:
                pass
            
            logger.error(f"Error processing image: {str(e)}")
            return jsonify({
                'success': False,
                'error': f'Processing failed: {str(e)}',
                'font_name': None
            }), 500
            
    except Exception as e:
        logger.error(f"Error in font identification: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}',
            'font_name': None
        }), 500

@app.route('/api/font/identify-name-only', methods=['POST'])
def identify_font_name_only():
    """Identify font and return only the font name"""
    try:
        # Check if file was uploaded
        if 'image' not in request.files:
            return jsonify({
                'success': False,
                'error': 'No image file provided',
                'font_name': None
            }), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({
                'success': False,
                'error': 'No file selected',
                'font_name': None
            }), 400
        
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix='.png') as tmp:
            file.save(tmp.name)
            tmp_path = tmp.name
        
        try:
            # Get only font name
            font_name = service.get_font_name_only(tmp_path)
            
            # Clean up temporary file
            os.unlink(tmp_path)
            
            if font_name:
                return jsonify({
                    'success': True,
                    'font_name': font_name
                })
            else:
                return jsonify({
                    'success': False,
                    'error': 'Font recognition failed',
                    'font_name': None
                }), 500
                
        except Exception as e:
            # Clean up temporary file
            try:
                os.unlink(tmp_path)
            except:
                pass
            
            logger.error(f"Error processing image: {str(e)}")
            return jsonify({
                'success': False,
                'error': f'Processing failed: {str(e)}',
                'font_name': None
            }), 500
            
    except Exception as e:
        logger.error(f"Error in font identification: {str(e)}")
        return jsonify({
            'success': False,
            'error': f'Server error: {str(e)}',
            'font_name': None
        }), 500

@app.route('/api/font/status', methods=['GET'])
def font_status():
    """Get service status"""
    return jsonify({
        'service': 'Simple Font Recognition',
        'model': 'Storia AI',
        'storia_available': service.storia_available,
        'status': 'ready' if service.storia_available else 'not_ready'
    })

@app.route('/api/font/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Simple Font Recognition',
        'model_available': service.storia_available
    })

@app.route('/', methods=['GET'])
def home():
    """Home endpoint with usage information"""
    return jsonify({
        'service': 'Simple Font Recognition API',
        'description': 'Uses Storia AI to identify fonts from images',
        'endpoints': {
            '/api/font/identify': 'POST - Identify font with full details',
            '/api/font/identify-name-only': 'POST - Get only font name',
            '/api/font/status': 'GET - Service status',
            '/api/font/health': 'GET - Health check'
        },
        'usage': {
            'method': 'POST',
            'content_type': 'multipart/form-data',
            'parameter': 'image (file)',
            'response': 'JSON with font_name and confidence'
        }
    })

if __name__ == '__main__':
    # Check if Storia AI is available
    if not service.storia_available:
        print("❌ Storia AI model not available!")
        print("Please ensure your Storia AI model is properly set up.")
        exit(1)
    
    print("🚀 Starting Simple Font Recognition API...")
    print("✅ Storia AI model is available")
    print("📡 API will be available at: http://localhost:3003")
    print("🔗 Endpoints:")
    print("   POST /api/font/identify - Full font recognition")
    print("   POST /api/font/identify-name-only - Font name only")
    print("   GET  /api/font/status - Service status")
    print("   GET  /api/font/health - Health check")
    
    app.run(debug=True, host='0.0.0.0', port=3003)
