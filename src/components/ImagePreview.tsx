import { X, Upload, Crop, Eye, Sparkles, Loader2, Target } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { useRef } from "react";
import { EnhancedFontResult } from "./EnhancedFontResult";
import { LoadingSpinner } from "./LoadingSpinner";

export const ImagePreview = () => {
  const {
    screenshots,
    removeScreenshot,
    setCurrentCropImage,
    addScreenshot,
    setError,
    clearError,
    identifyFont,
    backendConnected,
    isLoading,
    setLoading,
    defaultConfidenceThreshold,
  } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (screenshots.length === 0) {
    return null;
  }

  // Get the most recent screenshot
  const latestScreenshot = screenshots[screenshots.length - 1];

  const handleRemove = () => {
    removeScreenshot(latestScreenshot.id);
  };

  const handleCrop = () => {
    setCurrentCropImage(latestScreenshot);
  };

  const handleView = () => {
    window.open(latestScreenshot.preview, "_blank");
  };

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    clearError();
    addScreenshot(file);
  };

  const handleUploadAnother = () => {
    fileInputRef.current?.click();
  };

  const handleIdentifyFont = () => {
    identifyFont(latestScreenshot.id, latestScreenshot.confidenceThreshold);
  };

  const handleCancelIdentification = () => {
    setLoading(false);
    setError("Font identification was cancelled");
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
      />

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <LoadingSpinner
            message="Analyzing font with Enhanced AI..."
            showProgress={true}
            progress={50}
            onCancel={handleCancelIdentification}
          />
        </div>
      )}

      <div className="relative border-2 border-dashed border-gray-300 rounded-3xl p-8 text-center bg-white/80 backdrop-blur-sm shadow-lg">
        {/* Preview Image */}
        <div className="relative mb-6">
          <img
            src={latestScreenshot.preview}
            alt="Uploaded screenshot"
            className="w-full h-64 object-cover rounded-2xl shadow-lg"
          />

          {/* Overlay Actions */}
          <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-all duration-300 rounded-2xl flex items-center justify-center">
            <div className="opacity-0 hover:opacity-100 transition-opacity duration-300 flex space-x-3">
              <button
                onClick={handleView}
                className="p-3 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-colors shadow-lg"
                title="View full size"
              >
                <Eye className="w-5 h-5 text-gray-700" />
              </button>
              <button
                onClick={handleCrop}
                className="p-3 bg-blue-500/90 backdrop-blur-sm rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
                title="Crop text region"
              >
                <Crop className="w-5 h-5 text-white" />
              </button>
              <button
                onClick={handleRemove}
                className="p-3 bg-red-500/90 backdrop-blur-sm rounded-xl hover:bg-red-600 transition-colors shadow-lg"
                title="Remove image"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Image Info */}
        <div className="text-center">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {latestScreenshot.file.name}
          </h3>
          <p className="text-gray-600 mb-4">
            Uploaded {latestScreenshot.uploadedAt.toLocaleDateString()} at{" "}
            {latestScreenshot.uploadedAt.toLocaleTimeString()}
          </p>

          {/* Confidence Threshold Info */}
          <div className="flex items-center justify-center space-x-2 mb-4 text-sm text-gray-600">
            <Target className="w-4 h-4" />
            <span>
              Confidence Threshold:{" "}
              {(defaultConfidenceThreshold * 100).toFixed(0)}%
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center space-x-4">
            <button
              onClick={handleCrop}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <Crop className="w-4 h-4" />
              <span>Crop Text</span>
            </button>
            <button
              onClick={handleIdentifyFont}
              disabled={!backendConnected || latestScreenshot.isIdentifying}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {latestScreenshot.isIdentifying ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              <span>
                {latestScreenshot.isIdentifying
                  ? "Analyzing with Enhanced AI..."
                  : "Identify Font"}
              </span>
            </button>
            <button
              onClick={handleRemove}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4" />
              <span>Remove</span>
            </button>
          </div>
        </div>

        {/* Enhanced Font Result */}
        {latestScreenshot.fontResult && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <EnhancedFontResult
              result={latestScreenshot.fontResult}
              onRetry={handleIdentifyFont}
              service="storia"
            />
          </div>
        )}

        {/* Upload More Button */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-3">
            Want to upload another image?
          </p>
          <button
            onClick={handleUploadAnother}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 mx-auto"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Another</span>
          </button>
        </div>
      </div>
    </div>
  );
};
