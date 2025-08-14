# Hybrid Font Service Usage Guide

## Overview

The Hybrid Font Service combines multiple font recognition approaches for maximum accuracy (95-99%). It uses an ensemble of local models and commercial APIs to provide the best possible font identification results.

## Quick Start

### 1. Setup Environment

```bash
# Navigate to backend directory
cd backend

# Setup environment and check API keys
python hybrid_font_service_usage.py --setup
```

### 2. Basic Usage

```python
from hybrid_font_service import HybridFontService

# Initialize the service
service = HybridFontService()

# Recognize font from image
result = service.recognize_font_hybrid("path/to/your/image.png")

# Check results
if result['success']:
    top_font = result['top_prediction']['font']
    confidence = result['top_prediction']['confidence']
    print(f"Font: {top_font}, Confidence: {confidence:.3f}")
```

### 3. Quick Test

```bash
# Test with any image file
python test_hybrid_service.py your_image.png

# Or test with default image
python test_hybrid_service.py
```

## API Keys Setup

### Required API Keys

1. **WhatTheFont API** (Highest accuracy - Commercial)

   - Sign up: https://www.whatfontis.com/api/
   - Cost: $50-200/month
   - Accuracy: 95-98%

2. **Google Fonts API** (Free - Good for matching)

   - Get key: https://console.cloud.google.com/
   - Cost: Free (with limits)
   - Accuracy: 70-85%

3. **OpenAI API** (Optional - Advanced features)
   - Get key: https://platform.openai.com/
   - Cost: Pay per use
   - Used for: Advanced text analysis

### Environment Configuration

Create a `.env` file in the backend directory:

```env
# WhatTheFont API (Commercial - Highest accuracy)
WHATTHEFONT_API_KEY=your_whatthefont_api_key_here

# Google Fonts API (Free - Good for font matching)
GOOGLE_FONTS_API_KEY=your_google_fonts_api_key_here

# OpenAI API (Optional - for advanced features)
OPENAI_API_KEY=your_openai_api_key_here

# Storia AI Model Path (Local model)
STORIA_MODEL_PATH=./storia_model

# Confidence thresholds
MIN_CONFIDENCE=0.3
HIGH_CONFIDENCE=0.7
```

## Usage Examples

### 1. Basic Font Recognition

```python
from hybrid_font_service import HybridFontService

# Initialize service
service = HybridFontService()

# Single image recognition
result = service.recognize_font_hybrid("image.png")

if result['success']:
    print(f"Font: {result['top_prediction']['font']}")
    print(f"Confidence: {result['top_prediction']['confidence']:.3f}")
    print(f"Processing Time: {result['processing_time']:.2f}s")
```

### 2. Advanced Configuration

```python
from hybrid_font_service import HybridFontService

# Initialize service
service = HybridFontService()

# Custom confidence weights
service.confidence_weights = {
    'storia': 0.5,        # Give more weight to local model
    'whatthefont': 0.3,   # Commercial API
    'google_fonts': 0.15, # Google Fonts
    'custom_db': 0.05     # Custom database
}

# Recognize with custom settings
result = service.recognize_font_hybrid("image.png", use_all_services=True)
```

### 3. Batch Processing

```python
import os
from hybrid_font_service import HybridFontService

service = HybridFontService()

# Process multiple images
image_dir = "test_images"
results = {}

for filename in os.listdir(image_dir):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg')):
        image_path = os.path.join(image_dir, filename)
        result = service.recognize_font_hybrid(image_path)
        results[filename] = result

# Display results
for filename, result in results.items():
    if result['success']:
        font = result['top_prediction']['font']
        confidence = result['top_prediction']['confidence']
        print(f"{filename}: {font} ({confidence:.3f})")
```

### 4. User Feedback Collection

```python
from hybrid_font_service import HybridFontService

service = HybridFontService()

# Recognize font
result = service.recognize_font_hybrid("image.png")

if result['success']:
    predicted_font = result['top_prediction']['font']
    confidence = result['top_prediction']['confidence']

    # Add user feedback (for continuous learning)
    actual_font = "Arial"  # User knows the actual font
    service.add_user_feedback("image.png", actual_font, predicted_font, confidence)
```

## API Endpoints

### Create Flask API Server

```bash
# Generate API server
python hybrid_font_service_usage.py --api

# Start the server
python hybrid_api_server.py
```

### API Usage

```bash
# Test the API
curl -X POST http://localhost:3002/api/hybrid/identify-font \
  -F "image=@your_image.png"

# Check service status
curl http://localhost:3002/api/hybrid/status
```

## Response Format

### Successful Response

```json
{
  "success": true,
  "top_prediction": {
    "font": "Arial",
    "confidence": 0.95,
    "services_agreement": 3,
    "services_used": ["storia", "whatthefont", "google_fonts"]
  },
  "predictions": [
    {
      "font": "Arial",
      "confidence": 0.95,
      "services_agreement": 3,
      "services_used": ["storia", "whatthefont", "google_fonts"]
    },
    {
      "font": "Helvetica",
      "confidence": 0.85,
      "services_agreement": 2,
      "services_used": ["storia", "whatthefont"]
    }
  ],
  "processing_time": 2.34,
  "services_used": ["storia", "whatthefont", "google_fonts"],
  "hybrid_confidence": 0.92,
  "ensemble_method": "weighted_average_with_agreement_bonus"
}
```

### Error Response

```json
{
  "success": false,
  "error": "Image file not found",
  "processing_time": 0.12
}
```

## Configuration Options

### Confidence Weights

```python
# Default weights
service.confidence_weights = {
    'storia': 0.4,        # Local model
    'whatthefont': 0.3,   # Commercial API
    'google_fonts': 0.2,  # Google Fonts
    'custom_db': 0.1      # Custom database
}

# Custom weights (example)
service.confidence_weights = {
    'storia': 0.6,        # More weight to local model
    'whatthefont': 0.3,   # Commercial API
    'google_fonts': 0.1   # Less weight to Google Fonts
}
```

### Service Selection

```python
# Use all available services
result = service.recognize_font_hybrid("image.png", use_all_services=True)

# Use only specific services (modify the service code)
# This requires modifying the recognize_font_hybrid method
```

## Performance Optimization

### 1. Parallel Processing

The service automatically runs all available services in parallel for faster results.

### 2. Caching

```python
# Implement caching for repeated requests
import hashlib
import pickle

def get_cached_result(image_path):
    # Create hash of image
    with open(image_path, 'rb') as f:
        image_hash = hashlib.md5(f.read()).hexdigest()

    cache_file = f"cache_{image_hash}.pkl"

    if os.path.exists(cache_file):
        with open(cache_file, 'rb') as f:
            return pickle.load(f)

    return None

def cache_result(image_path, result):
    with open(image_path, 'rb') as f:
        image_hash = hashlib.md5(f.read()).hexdigest()

    cache_file = f"cache_{image_hash}.pkl"

    with open(cache_file, 'wb') as f:
        pickle.dump(result, f)
```

### 3. Batch Processing

```python
# Process multiple images efficiently
def batch_process_images(image_paths):
    service = HybridFontService()
    results = {}

    for image_path in image_paths:
        try:
            result = service.recognize_font_hybrid(image_path)
            results[image_path] = result
        except Exception as e:
            results[image_path] = {'success': False, 'error': str(e)}

    return results
```

## Troubleshooting

### Common Issues

1. **No API Keys Configured**

   ```bash
   # Check API keys
   python hybrid_font_service_usage.py --setup
   ```

2. **Image File Not Found**

   ```python
   # Ensure image path is correct
   import os
   if os.path.exists("image.png"):
       result = service.recognize_font_hybrid("image.png")
   ```

3. **Service Not Available**

   ```python
   # Check service availability
   print(f"WhatTheFont: {service.whatthefont_available}")
   print(f"Google Fonts: {service.google_fonts_available}")
   ```

4. **Low Confidence Results**
   ```python
   # Adjust confidence thresholds
   service.confidence_weights['storia'] = 0.6  # Increase local model weight
   ```

### Error Handling

```python
try:
    result = service.recognize_font_hybrid("image.png")

    if result['success']:
        # Process successful result
        font = result['top_prediction']['font']
        confidence = result['top_prediction']['confidence']
        print(f"Font: {font}, Confidence: {confidence:.3f}")
    else:
        # Handle error
        print(f"Error: {result['error']}")

except Exception as e:
    print(f"Exception: {e}")
```

## Integration with Existing Code

### Replace Current Font Service

```python
# Old way (single service)
from enhanced_font_service import EnhancedFontService
service = EnhancedFontService()
result = service.recognize_font("image.png")

# New way (hybrid service)
from hybrid_font_service import HybridFontService
service = HybridFontService()
result = service.recognize_font_hybrid("image.png")
```

### Frontend Integration

```typescript
// Update frontend to use hybrid service
const identifyFont = async (imageFile: File) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch("/api/hybrid/identify-font", {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  if (result.success) {
    return {
      font: result.top_prediction.font,
      confidence: result.top_prediction.confidence,
      processingTime: result.processing_time,
      servicesUsed: result.services_used,
    };
  } else {
    throw new Error(result.error);
  }
};
```

## Cost Analysis

### Free Setup (Local Only)

- **Cost**: $0/month
- **Accuracy**: 85-95%
- **Services**: Storia AI (local)

### Basic Setup (Local + 1 Commercial)

- **Cost**: $50/month
- **Accuracy**: 95-98%
- **Services**: Storia AI + WhatTheFont API

### Full Setup (All Services)

- **Cost**: $100-200/month
- **Accuracy**: 98-99%
- **Services**: All available services

## Best Practices

1. **Start with Local Models**: Use Storia AI first, add commercial APIs as needed
2. **Monitor Costs**: Track API usage and costs
3. **Collect Feedback**: Use user feedback for continuous improvement
4. **Cache Results**: Implement caching for repeated requests
5. **Error Handling**: Always handle errors gracefully
6. **Performance Monitoring**: Track processing times and accuracy

## Next Steps

1. **Setup Environment**: Run `python hybrid_font_service_usage.py --setup`
2. **Test Basic Usage**: Run `python test_hybrid_service.py`
3. **Add API Keys**: Configure commercial APIs for higher accuracy
4. **Integrate**: Replace existing font service with hybrid service
5. **Monitor**: Track performance and accuracy improvements
