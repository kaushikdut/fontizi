import React from "react";
import { Loader2, Sparkles } from "lucide-react";

interface LoadingSpinnerProps {
  message?: string;
  showProgress?: boolean;
  progress?: number;
  onCancel?: () => void;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Analyzing font...",
  showProgress = false,
  progress = 0,
  onCancel,
}) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 border border-gray-200/50 shadow-lg">
      <div className="flex flex-col items-center justify-center space-y-4">
        {/* Animated spinner */}
        <div className="relative">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          <Sparkles className="w-6 h-6 text-blue-400 absolute -top-1 -right-1 animate-pulse" />
        </div>

        {/* Loading message */}
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {message}
          </h3>
          <p className="text-sm text-gray-600">
            This may take up to 2 minutes for complex images
          </p>
        </div>

        {/* Progress bar (optional) */}
        {showProgress && (
          <div className="w-full max-w-xs">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Processing</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Loading dots animation */}
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>

        {/* Cancel button */}
        {onCancel && (
          <button
            onClick={onCancel}
            className="mt-4 px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

export const LoadingSpinnerError: React.FC<{
  error: string;
  onRetry?: () => void;
}> = ({ error, onRetry }) => {
  return (
    <div className="bg-red-50/80 backdrop-blur-sm rounded-2xl p-6 border border-red-200/50">
      <div className="flex flex-col items-center justify-center space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            Processing Failed
          </h3>
          <p className="text-sm text-red-700 mb-4">{error}</p>
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
