import { UploadButton } from "../components/UploadButton";
import { ImagePreview } from "../components/ImagePreview";
import { ScreenshotGallery } from "../components/ScreenshotGallery";
import { ErrorNotification } from "../components/ErrorNotification";
import { ImageCropper } from "../components/ImageCropper";
import { BackendStatus } from "../components/BackendStatus";
import { ServiceSelector } from "../components/ServiceSelector";
import { useAppStore } from "../store/useAppStore";
import { useState } from "react";
import { Type, Sparkles, Zap, Upload, Crop } from "lucide-react";

export const LandingPage = () => {
  const { screenshots, currentCropImage } = useAppStore();
  const [showCropper, setShowCropper] = useState<boolean>(false);

  const handleCloseCropper = () => {
    setShowCropper(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <ErrorNotification />

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl">
                <Type className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                  Fontizi
                </h1>
                <span className="text-sm text-gray-500 font-medium">
                  Enhanced AI Font Recognition
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <BackendStatus />
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">
                  {screenshots.length}{" "}
                  {screenshots.length === 1 ? "Sample" : "Samples"}
                </p>
                <p className="text-xs text-gray-500">Ready for analysis</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-blue-50 border border-blue-200 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Enhanced AI-Powered Font Recognition
            </span>
          </div>

          <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
            Identify Fonts with
            <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              {" "}
              Precision
            </span>
          </h2>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Upload screenshots, crop text regions, and let our enhanced AI identify fonts
            with remarkable accuracy. Features text region detection, confidence filtering, and ensemble predictions.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mb-4">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Smart Upload
              </h3>
              <p className="text-gray-600 text-sm">
                Drag & drop or click to upload screenshots with instant preview
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center mb-4">
                <Crop className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Precise Cropping
              </h3>
              <p className="text-gray-600 text-sm">
                Select exact text regions with our advanced cropping tools
              </p>
            </div>

            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 hover:shadow-lg transition-all duration-300">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Enhanced AI Analysis
              </h3>
              <p className="text-gray-600 text-sm">
                Get instant font identification with confidence scores and quality assessment
              </p>
            </div>
          </div>
        </div>

        {/* Service Configuration */}
        <div className="mb-12">
          <ServiceSelector />
        </div>

        {/* Upload Section */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-2">
              Start Your Font Analysis
            </h3>
            <p className="text-gray-600">
              Upload a screenshot containing text you want to identify
            </p>
          </div>
          {screenshots.length === 0 ? <UploadButton /> : <ImagePreview />}
        </div>

        {/* Gallery Section */}
        {screenshots.length > 1 && (
          <div>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">
                  Upload History
                </h3>
                <p className="text-gray-600 mt-1">
                  Previously uploaded images for font analysis
                </p>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{screenshots.length - 1} previous uploads</span>
              </div>
            </div>
            <ScreenshotGallery />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-200/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Type className="w-5 h-5 text-gray-400" />
              <span className="text-gray-500 font-medium">Fontizi</span>
            </div>
            <p className="text-gray-500 text-sm">
              Enhanced font recognition powered by AI • Built with React &
              TypeScript
            </p>
          </div>
        </div>
      </footer>

      {/* Image Cropper Modal */}
      {currentCropImage && <ImageCropper onClose={handleCloseCropper} />}
    </div>
  );
};
