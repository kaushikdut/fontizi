# Fontizi: Storia AI + Google Fonts Integration

This project now supports advanced font recognition using **Storia AI** and seamless font downloading through **Google Fonts API**.

## 🚀 Features

### Font Recognition Services

- **DeepFont**: Local AI model for fast, offline font recognition
- **Storia AI**: Open-source local model for advanced font recognition

### Google Fonts Integration

- **Font Search**: Find fonts on Google Fonts
- **Font Download**: Direct download of font files
- **Font Previews**: Generate preview URLs for identified fonts
- **Font Variants**: Display available font weights and styles

## 📋 Prerequisites

### Required Setup

1. **Storia AI Model** - Open-source model from [GitHub](https://github.com/Storia-AI/font-classify)
2. **Google Fonts API Key** - Get from [Google Cloud Console](https://console.cloud.google.com/)

### System Requirements

- Node.js 18+ (Frontend)
- Python 3.8+ (Backend)
- Git

## 🛠️ Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd fontizi
```

### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Copy environment file
cp env.example .env

# Edit .env with your configuration
# STORIA_MODEL_PATH=./storia_model
# GOOGLE_FONTS_API_KEY=your_google_fonts_api_key_here
```

### 3. Frontend Setup

```bash
cd ..

# Install Node.js dependencies
npm install
# or
pnpm install
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Flask Configuration
FLASK_DEBUG=False
PORT=3001

# Storia AI Model Configuration
STORIA_MODEL_PATH=./storia_model

# Google Fonts API Configuration
GOOGLE_FONTS_API_KEY=your_google_fonts_api_key_here
```

### API Key Setup

#### Storia AI Model

1. The integration will automatically clone the repository from [GitHub](https://github.com/Storia-AI/font-classify)
2. No manual setup required - the model runs locally
3. No API key needed - completely free and offline

#### Google Fonts

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Fonts API
4. Create credentials (API Key)
5. Add to `.env` file

## 🚀 Running the Application

### Start Backend

```bash
cd backend
python deepfont_server.py
```

The backend will start on `http://localhost:3001`

### Start Frontend

```bash
npm run dev
# or
pnpm dev
```

The frontend will start on `http://localhost:5173`

## 📡 API Endpoints

### Font Recognition

#### DeepFont (Local AI)

```http
POST /api/identify-font
Content-Type: multipart/form-data
Body: image file
```

#### Storia AI (Local Model)

```http
POST /api/storia/identify-font
Content-Type: multipart/form-data
Body: image file
```

### Google Fonts Integration

#### Search Fonts

```http
GET /api/google-fonts/search?q={font_name}
```

#### Download Font

```http
POST /api/google-fonts/download
Content-Type: application/json
Body: {"font_name": "Roboto", "variant": "regular"}
```

#### Font Preview

```http
GET /api/google-fonts/preview?font_name={font_name}&text={sample_text}
```

## 🎨 Frontend Components

### Service Selector

Choose between DeepFont and Storia AI for font recognition:

```tsx
import { ServiceSelector } from "./components/ServiceSelector";

<ServiceSelector
  selectedService={selectedService}
  onServiceChange={setSelectedService}
/>;
```

### Enhanced Font Result

Display results with download capabilities:

```tsx
import { EnhancedFontResult } from "./components/EnhancedFontResult";

<EnhancedFontResult
  result={fontResult}
  service={selectedService}
  onRetry={handleRetry}
/>;
```

## 🔄 Usage Flow

### 1. Choose Service

- Select between DeepFont (local) or Storia AI (local)
- DeepFont: Fast, no API costs, offline capable
- Storia AI: Higher accuracy, Google Fonts integration, also offline

### 2. Upload Image

- Drag & drop or click to upload
- Supported formats: PNG, JPG, JPEG, GIF, BMP, TIFF
- Max file size: 10MB

### 3. Font Recognition

- Automatic processing with selected service
- Real-time progress indication
- Error handling with retry options

### 4. View Results

- Identified font name and confidence
- Font category and alternatives
- Google Fonts integration (Storia AI only)

### 5. Download Font

- View on Google Fonts (opens in new tab)
- Direct download of font files
- Available variants display

## 🏗️ Architecture

```
Frontend (React + TypeScript)
├── Service Selector
├── Image Upload
├── Font Result Display
└── Download Integration

Backend (Flask + Python)
├── DeepFont Model (Local AI)
├── Storia AI Service
├── Google Fonts API
└── File Management

External Services
├── Storia AI API
└── Google Fonts API
```

## 🔍 Error Handling

### Common Issues

1. **API Key Missing**

   ```
   Error: Storia API key not configured
   Solution: Add STORIA_API_KEY to .env file
   ```

2. **Font Not Found**

   ```
   Error: No font found matching 'FontName'
   Solution: Try different font name variations
   ```

3. **Network Issues**
   ```
   Error: API request failed
   Solution: Check internet connection and API endpoints
   ```

### Debug Mode

Enable debug logging:

```env
FLASK_DEBUG=True
```

## 📊 Performance

### DeepFont (Local)

- **Speed**: ~1-3 seconds
- **Accuracy**: Good for common fonts
- **Cost**: Free (no API calls)
- **Offline**: Yes

### Storia AI (Local)

- **Speed**: ~2-5 seconds
- **Accuracy**: Excellent for all fonts
- **Cost**: Free (no API calls)
- **Offline**: Yes (runs locally)

## 🔒 Security

### Best Practices

1. **API Key Protection**: Never commit keys to version control
2. **File Validation**: All uploaded files are validated
3. **Rate Limiting**: Implemented to prevent abuse
4. **CORS**: Properly configured for production

### Environment Variables

```bash
# Never commit these files
.env
*.key
secrets/
```

## 💰 Cost Considerations

### Storia AI

- Completely free (open-source)
- No API costs
- Runs locally on your machine

### Google Fonts

- Free for basic usage
- Check [Google Fonts quotas](https://developers.google.com/fonts/docs/developer_api#quota)

## 🚀 Deployment

### Backend Deployment

```bash
# Using Docker
docker build -t fontizi-backend .
docker run -p 3001:3001 fontizi-backend

# Using Python directly
python deepfont_server.py
```

### Frontend Deployment

```bash
# Build for production
npm run build

# Deploy to Vercel/Netlify
vercel --prod
```

## 🔮 Future Enhancements

### Planned Features

1. **Font Similarity**: Find similar fonts
2. **Batch Processing**: Multiple font identification
3. **Custom Fonts**: Upload custom font files
4. **Font Analytics**: Usage statistics
5. **OCR Integration**: Extract text from images

### API Improvements

1. **Caching**: Cache Google Fonts responses
2. **Rate Limiting**: Advanced rate limiting
3. **Webhooks**: Real-time notifications
4. **GraphQL**: More efficient queries

## 📚 Documentation

### Additional Resources

- [Storia AI GitHub Repository](https://github.com/Storia-AI/font-classify)
- [Google Fonts API Documentation](https://developers.google.com/fonts/docs/developer_api)
- [DeepFont Paper](https://arxiv.org/abs/1507.03196)

### Code Examples

- [Backend Integration Guide](backend/STORIA_INTEGRATION.md)
- [Frontend Service Examples](src/services/fontIdentification.ts)
- [Component Usage](src/components/EnhancedFontResult.tsx)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help

1. Check the [FAQ](FAQ.md)
2. Search [Issues](https://github.com/your-repo/issues)
3. Create a new issue with details

### Contact

- Email: support@fontizi.com
- Discord: [Fontizi Community](https://discord.gg/fontizi)
- Twitter: [@fontizi](https://twitter.com/fontizi)

---

**Happy Font Recognition! 🎨✨**
