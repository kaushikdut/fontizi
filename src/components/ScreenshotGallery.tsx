import { Trash2, Eye, Crop, Type, Sparkles } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { FontResultList } from "./FontResultList";

interface Screenshot {
  id: string;
  file: File;
  preview: string;
  uploadedAt: Date;
  croppedImage?: string;
  cropData?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export const ScreenshotGallery = () => {
  const { screenshots, removeScreenshot, setCurrentCropImage, identifyFont } =
    useAppStore();

  const handleCrop = (screenshot: Screenshot) => {
    setCurrentCropImage(screenshot);
  };

  if (screenshots.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Type className="w-8 h-8 text-gray-400" />
        </div>
        <p className="text-gray-500 text-lg font-medium">
          No font samples uploaded yet
        </p>
        <p className="text-gray-400 text-sm mt-2">
          Upload a screenshot to start font analysis
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Upload History Section */}
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {screenshots.slice(0, -1).map((screenshot) => (
            <div
              key={screenshot.id}
              className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-200/50 hover:border-gray-300/50"
            >
              <div className="relative">
                <img
                  src={screenshot.croppedImage || screenshot.preview}
                  alt="Font sample"
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Status Badge */}
                {screenshot.croppedImage && (
                  <div className="absolute top-3 right-3">
                    <div className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-medium flex items-center space-x-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Cropped</span>
                    </div>
                  </div>
                )}

                {/* Hover Actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex space-x-3">
                    <button
                      onClick={() =>
                        window.open(
                          screenshot.croppedImage || screenshot.preview,
                          "_blank"
                        )
                      }
                      className="p-3 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-colors shadow-lg"
                      title="View full size"
                    >
                      <Eye className="w-5 h-5 text-gray-700" />
                    </button>
                    <button
                      onClick={() => handleCrop(screenshot)}
                      className="p-3 bg-blue-500/90 backdrop-blur-sm rounded-xl hover:bg-blue-600 transition-colors shadow-lg"
                      title="Crop text region"
                    >
                      <Crop className="w-5 h-5 text-white" />
                    </button>
                    <button
                      onClick={() => removeScreenshot(screenshot.id)}
                      className="p-3 bg-red-500/90 backdrop-blur-sm rounded-xl hover:bg-red-600 transition-colors shadow-lg"
                      title="Delete sample"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {screenshot.file.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {screenshot.uploadedAt.toLocaleDateString()} at{" "}
                      {screenshot.uploadedAt.toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="ml-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg flex items-center justify-center">
                      <Type className="w-4 h-4 text-blue-600" />
                    </div>
                  </div>
                </div>

                {screenshot.cropData && (
                  <div className="bg-blue-50 rounded-lg p-3 mt-3">
                    <div className="flex items-center space-x-2 text-xs text-blue-700">
                      <Crop className="w-3 h-3" />
                      <span className="font-medium">
                        Cropped: {screenshot.cropData.width}×
                        {screenshot.cropData.height}
                      </span>
                    </div>
                  </div>
                )}

                {/* Analysis Status */}
                <div className="mt-4 pt-4 border-t border-gray-100">
                  {screenshot.fontResult ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs text-gray-500 font-medium">
                        Font analysis complete
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-gray-500 font-medium">
                        Ready for font analysis
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Font Results Section */}
      {screenshots.some((s) => s.fontResult) && (
        <div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-2xl font-semibold text-gray-900">
                Font Analysis Results
              </h3>
              <p className="text-gray-600 mt-1">
                Identified fonts from your uploaded images
              </p>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>
                {screenshots.filter((s) => s.fontResult).length} result
                {screenshots.filter((s) => s.fontResult).length !== 1
                  ? "s"
                  : ""}
              </span>
            </div>
          </div>

          <div className="space-y-6">
            {screenshots
              .filter((screenshot) => screenshot.fontResult)
              .map((screenshot) => (
                <div
                  key={screenshot.id}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg"
                >
                  <div className="flex items-start space-x-6 mb-4">
                    <div className="flex-shrink-0">
                      <img
                        src={screenshot.croppedImage || screenshot.preview}
                        alt="Font sample"
                        className="w-24 h-24 object-cover rounded-lg shadow-sm"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900 mb-1">
                        {screenshot.file.name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        Analyzed {screenshot.uploadedAt.toLocaleDateString()} at{" "}
                        {screenshot.uploadedAt.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <FontResultList
                    result={screenshot.fontResult!}
                    onRetry={() =>
                      identifyFont(
                        screenshot.id,
                        screenshot.confidenceThreshold
                      )
                    }
                    imageUrl={screenshot.croppedImage || screenshot.preview}
                  />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};
