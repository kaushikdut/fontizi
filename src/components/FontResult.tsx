import { Download, Sparkles, AlertCircle, Info } from "lucide-react";
import type { FontIdentificationResult } from "../services/fontIdentification";

interface FontResultProps {
  result: FontIdentificationResult;
  onRetry?: () => void;
}

export const FontResult = ({ result, onRetry }: FontResultProps) => {
  // Handle both old and new response formats
  const prediction = result.prediction || {
    font: result.font || "Unknown",
    confidence: result.confidence || 0.0,
    category: result.category || "Unknown",
    alternatives:
      result.alternatives?.map((alt) => ({
        font: alt.name,
        confidence: alt.confidence,
      })) || [],
  };

  const confidencePercentage = Math.round(prediction.confidence * 100);
  const fontName =
    prediction.font.charAt(0).toUpperCase() + prediction.font.slice(1);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Font Identified
          </h3>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-600">
              DeepFont AI-powered identification
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-blue-600">{fontName}</div>
          <div className="text-sm text-gray-500">
            {confidencePercentage}% confidence
          </div>
        </div>
      </div>

      {/* Font Category */}
      <div className="mb-4">
        <div className="inline-flex items-center space-x-2 bg-gray-100 px-3 py-1 rounded-full">
          <Info className="w-4 h-4 text-gray-600" />
          <span className="text-sm text-gray-700">
            Category: {prediction.category}
          </span>
        </div>
      </div>

      {/* Confidence Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Confidence</span>
          <span>{confidencePercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${confidencePercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Download Link */}
      <div className="mb-6">
        <a
          href={`https://fonts.google.com/specimen/${fontName.replace(
            /\s+/g,
            "+"
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <Download className="w-4 h-4" />
          <span>View on Google Fonts</span>
        </a>
      </div>

      {/* Alternative Predictions */}
      {result.prediction?.alternatives &&
        result.prediction.alternatives.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">
              Alternative Matches
            </h4>
            <div className="space-y-2">
              {result.prediction.alternatives.map((prediction, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm"
                >
                  <span className="text-gray-600">
                    {prediction.font.charAt(0).toUpperCase() +
                      prediction.font.slice(1)}
                  </span>
                  <span className="text-gray-500">
                    {Math.round(prediction.confidence * 100)}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      {/* File Information */}
      {result.filename && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            <div>File: {result.filename}</div>
            {result.file_size && (
              <div>Size: {(result.file_size / 1024).toFixed(1)} KB</div>
            )}
          </div>
        </div>
      )}

      {/* Retry Button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Try again
        </button>
      )}
    </div>
  );
};

export const FontResultError = ({
  error,
  onRetry,
}: {
  error: string;
  onRetry?: () => void;
}) => {
  return (
    <div className="bg-red-50/80 backdrop-blur-sm rounded-2xl p-6 border border-red-200/50">
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Font Identification Failed
          </h3>
          <p className="text-red-700 mb-4">{error}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              <Sparkles className="w-4 h-4" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
