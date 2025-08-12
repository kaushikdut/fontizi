# Storia AI + Google Fonts Integration Guide

This guide explains how to integrate Storia AI for font recognition and Google Fonts for font downloading in your fontizi project.

## Overview

The integration provides:

- **Font Recognition**: Using Storia AI's open-source font recognition model
- **Font Downloading**: Direct integration with Google Fonts API
- **Font Previews**: Generate preview URLs for identified fonts
- **Alternative Recognition**: Fallback to existing DeepFont model

## Setup Instructions

### 1. Model Setup

#### Storia AI Model

Storia AI is an open-source model that runs locally. The integration will automatically:

1. Clone the repository from [GitHub](https://github.com/Storia-AI/font-classify)
2. Install required dependencies
3. Set up the model for local inference

No API key is required - the model runs entirely on your local machine.

#### Google Fonts API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Fonts API
4. Create credentials (API Key)
5. Add to `.env` file:
   ```
   GOOGLE_FONTS_API_KEY=your_google_fonts_api_key_here
   ```

### 2. Installation

Install the required dependencies:

```bash
cd backend
pip install -r requirements.txt
```

### 3. Environment Configuration

Copy the example environment file:

```bash
cp env.example .env
```

Edit `.env` with your actual API keys.

## API Endpoints

### Font Recognition with Storia AI

**Endpoint**: `POST /api/storia/identify-font`

**Request**:

- Content-Type: `multipart/form-data`
- Body: `image` file

**Response**:

```json
{
  "success": true,
  "filename": "sample.png",
  "file_size": 12345,
  "service": "Storia AI",
  "font_info": {
    "primary_font": "Roboto",
    "confidence": 0.95,
    "alternatives": [
      {
        "name": "Open Sans",
        "confidence": 0.85,
        "category": "Sans-serif"
      }
    ],
    "font_category": "Sans-serif",
    "download_url": "https://fonts.google.com/specimen/Roboto",
    "google_fonts_info": {
      "family": "Roboto",
      "category": "sans-serif",
      "variants": ["100", "300", "400", "500", "700", "900"],
      "subsets": ["latin", "latin-ext"],
      "version": "v30",
      "api_url": {
        "100": "https://fonts.gstatic.com/s/roboto/v30/...",
        "400": "https://fonts.gstatic.com/s/roboto/v30/..."
      }
    }
  }
}
```

### Google Fonts Search

**Endpoint**: `GET /api/google-fonts/search?q={font_name}`

**Response**:

```json
{
  "success": true,
  "font_info": {
    "family": "Roboto",
    "category": "sans-serif",
    "variants": ["100", "300", "400", "500", "700", "900"],
    "subsets": ["latin", "latin-ext"],
    "version": "v30",
    "download_url": "https://fonts.google.com/specimen/Roboto",
    "api_url": {
      "100": "https://fonts.gstatic.com/s/roboto/v30/...",
      "400": "https://fonts.gstatic.com/s/roboto/v30/..."
    }
  }
}
```

### Font Download

**Endpoint**: `POST /api/google-fonts/download`

**Request**:

```json
{
  "font_name": "Roboto",
  "variant": "regular"
}
```

**Response**:

```json
{
  "success": true,
  "download_info": {
    "font_path": "downloads/Roboto_regular.woff2",
    "font_filename": "Roboto_regular.woff2",
    "font_url": "https://fonts.gstatic.com/s/roboto/v30/...",
    "file_size": 12345
  }
}
```

### Font Preview

**Endpoint**: `GET /api/google-fonts/preview?font_name={font_name}&text={sample_text}`

**Response**:

```json
{
  "success": true,
  "preview_url": "https://fonts.googleapis.com/css2?family=Roboto:wght@400&display=swap",
  "font_name": "Roboto",
  "sample_text": "Sample Text"
}
```

## Frontend Integration

### Using the Storia AI Service

```typescript
// services/fontIdentification.ts
export const identifyFontWithStoria = async (file: File) => {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch("/api/storia/identify-font", {
    method: "POST",
    body: formData,
  });

  return response.json();
};

export const searchGoogleFonts = async (fontName: string) => {
  const response = await fetch(
    `/api/google-fonts/search?q=${encodeURIComponent(fontName)}`
  );
  return response.json();
};

export const downloadGoogleFont = async (
  fontName: string,
  variant: string = "regular"
) => {
  const response = await fetch("/api/google-fonts/download", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ font_name: fontName, variant }),
  });

  return response.json();
};
```

### Component Example

```tsx
// components/FontResult.tsx
import React, { useState } from "react";
import {
  identifyFontWithStoria,
  downloadGoogleFont,
} from "../services/fontIdentification";

const FontResult: React.FC<{ file: File }> = ({ file }) => {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleIdentify = async () => {
    setLoading(true);
    try {
      const response = await identifyFontWithStoria(file);
      setResult(response);
    } catch (error) {
      console.error("Font identification failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (fontName: string) => {
    try {
      const downloadResult = await downloadGoogleFont(fontName);
      if (downloadResult.success) {
        // Handle successful download
        console.log("Font downloaded:", downloadResult.download_info);
      }
    } catch (error) {
      console.error("Font download failed:", error);
    }
  };

  return (
    <div>
      <button onClick={handleIdentify} disabled={loading}>
        {loading ? "Identifying..." : "Identify Font with Storia AI"}
      </button>

      {result && result.success && (
        <div>
          <h3>Identified Font: {result.font_info.primary_font}</h3>
          <p>Confidence: {(result.font_info.confidence * 100).toFixed(1)}%</p>
          <p>Category: {result.font_info.font_category}</p>

          {result.font_info.download_url && (
            <div>
              <a
                href={result.font_info.download_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                View on Google Fonts
              </a>
              <button
                onClick={() => handleDownload(result.font_info.primary_font)}
              >
                Download Font
              </button>
            </div>
          )}

          {result.font_info.alternatives.length > 0 && (
            <div>
              <h4>Alternative Fonts:</h4>
              <ul>
                {result.font_info.alternatives.map(
                  (alt: any, index: number) => (
                    <li key={index}>
                      {alt.name} ({(alt.confidence * 100).toFixed(1)}%)
                    </li>
                  )
                )}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FontResult;
```

## Error Handling

The service includes comprehensive error handling:

1. **API Key Missing**: Returns error if API keys are not configured
2. **Network Errors**: Handles timeouts and connection issues
3. **Invalid Files**: Validates file types and sizes
4. **Font Not Found**: Graceful handling when fonts aren't found on Google Fonts

## Performance Considerations

1. **Caching**: Consider implementing caching for Google Fonts API responses
2. **Rate Limiting**: Be aware of API rate limits for both services
3. **File Size**: Large images may take longer to process
4. **Concurrent Requests**: Handle multiple simultaneous font identification requests

## Troubleshooting

### Common Issues

1. **"Storia API key not configured"**

   - Check your `.env` file has the correct API key
   - Ensure the key is valid and active

2. **"Google Fonts API key not configured"**

   - Verify your Google Cloud project has the Fonts API enabled
   - Check API key permissions

3. **"API request failed"**

   - Check network connectivity
   - Verify API endpoints are correct
   - Check rate limiting

4. **"No font found"**
   - Try different font name variations
   - Check if the font exists on Google Fonts
   - Consider using alternative recognition methods

### Debug Mode

Enable debug logging by setting:

```
FLASK_DEBUG=True
```

This will provide detailed logs for troubleshooting API interactions.

## Security Considerations

1. **API Key Protection**: Never commit API keys to version control
2. **File Validation**: Always validate uploaded files
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **CORS**: Configure CORS properly for production

## Cost Considerations

- **Storia AI**: Check their pricing for API usage
- **Google Fonts**: Free for basic usage, check quotas
- **Bandwidth**: Consider costs for font file downloads

## Future Enhancements

1. **Font Similarity**: Add font similarity matching
2. **Batch Processing**: Support for multiple font identification
3. **Font Categories**: Enhanced font categorization
4. **Custom Fonts**: Support for custom font uploads
5. **Font Analytics**: Usage statistics and trends
