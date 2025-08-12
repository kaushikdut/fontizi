# Fontizi Backend - Storia AI

A Flask-based backend service for font recognition using Storia AI local model.

## Features

- **Font Recognition**: Identify fonts from uploaded images using Storia AI
- **Google Fonts Integration**: Search and download fonts from Google Fonts
- **Local Processing**: No API calls required - runs completely offline
- **RESTful API**: Clean API endpoints for frontend integration
- **File Upload**: Support for multiple image formats
- **CORS Support**: Cross-origin resource sharing enabled

## Quick Start

1. **Install Dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

2. **Set up Environment**:

   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start the Server**:

   ```bash
   python start_storia.py
   ```

4. **Access the API**:
   - Server runs on: `http://localhost:3001`
   - Health check: `GET /health`
   - Font recognition: `POST /api/storia/identify-font`

## API Endpoints

### Font Recognition (Storia AI)

- `POST /api/storia/identify-font` - Identify font from uploaded image
- `GET /api/storia/status` - Check Storia AI model status
- `GET /api/fonts` - Get list of available fonts
- `GET /api/model/info` - Get model information

### Google Fonts Integration

- `GET /api/google-fonts/search?q=<query>` - Search Google Fonts
- `POST /api/google-fonts/download` - Download font files
- `GET /api/google-fonts/preview?font_family=<name>` - Get font preview

## Configuration

Edit the `.env` file to configure:

- `STORIA_MODEL_PATH` - Path to Storia AI model (default: ./storia_model)
- `GOOGLE_FONTS_API_KEY` - Google Fonts API key (optional)
- `FLASK_DEBUG` - Enable debug mode
- `PORT` - Server port (default: 3001)

## Project Structure

```
backend/
├── storia_server.py        # Main Flask server
├── storia_font_service.py  # Storia AI and Google Fonts service
├── start_storia.py         # Startup script
├── requirements.txt        # Python dependencies
├── env.example            # Environment configuration example
├── uploads/               # Temporary file uploads
├── storia_model/          # Storia AI model (auto-downloaded)
└── README.md             # This file
```

## Storia AI Model

The Storia AI model is an open-source local model that provides:

- **High Accuracy**: Advanced font recognition capabilities
- **Offline Processing**: No internet connection required
- **Multiple Categories**: Support for serif, sans-serif, and decorative fonts
- **Automatic Setup**: Model is automatically downloaded on first use

### Model Setup

The Storia AI model will be automatically downloaded from the official repository:

- Repository: https://github.com/Storia-AI/font-classify
- Location: `./storia_model/`
- Size: ~500MB (first download)

## Development

### Starting the Server

```bash
# Using startup script (recommended)
python start_storia.py

# Direct server start
python storia_server.py
```

### Checking Model Status

```bash
curl http://localhost:3001/api/storia/status
```

## Integration

This backend is designed to work with the Fontizi frontend. See `FRONTEND_INTEGRATION.md` for detailed integration instructions.

## Troubleshooting

### Model Not Found

If the Storia AI model is not available:

1. Check internet connection for first download
2. Verify `STORIA_MODEL_PATH` in `.env`
3. Check available disk space (~500MB required)

### Dependencies Issues

If you encounter dependency issues:

```bash
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

## Performance

- **Inference Speed**: ~200-500ms per image
- **Accuracy**: High accuracy for common fonts
- **Offline Support**: ✅ Yes (no internet required after setup)
- **Resource Usage**: Moderate (local GPU/CPU processing)

## API Response Format

### Font Recognition Response

```json
{
  "success": true,
  "font": "arial",
  "confidence": 0.85,
  "category": "Sans-serif",
  "alternatives": [
    { "font": "helvetica", "confidence": 0.12 },
    { "font": "verdana", "confidence": 0.03 }
  ]
}
```

### Google Fonts Search Response

```json
{
  "success": true,
  "fonts": [
    {
      "family": "Roboto",
      "category": "sans-serif",
      "variants": ["300", "regular", "500", "700"],
      "subsets": ["latin"],
      "version": "v30",
      "lastModified": "2023-01-25"
    }
  ]
}
```

## References

- [Storia AI Repository](https://github.com/Storia-AI/font-classify)
- [Google Fonts API](https://developers.google.com/fonts/docs/css2)
- [Flask Documentation](https://flask.palletsprojects.com/)
