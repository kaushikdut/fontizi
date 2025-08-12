import React, { useState } from "react";
import {
  Download,
  Sparkles,
  AlertCircle,
  Info,
  ExternalLink,
  CheckCircle,
  XCircle,
} from "lucide-react";
import type {
  FontIdentificationResult,
  StoriaFontResult,
  FontDownloadResult,
} from "../services/fontIdentification";
import { downloadGoogleFont } from "../services/fontIdentification";

interface EnhancedFontResultProps {
  result: FontIdentificationResult | StoriaFontResult;
  onRetry?: () => void;
  service?: "deepfont" | "storia";
}

export const EnhancedFontResult = ({
  result,
  onRetry,
  service = "deepfont",
}: EnhancedFontResultProps) => {
  const [downloadStatus, setDownloadStatus] = useState<
    "idle" | "downloading" | "success" | "error"
  >("idle");
  const [downloadMessage, setDownloadMessage] = useState<string>("");

  const isStoriaResult = "service" in result && result.service === "Storia AI";

  // Extract font information based on service
  const getFontInfo = () => {
    if (isStoriaResult && result.font_info) {
      return {
        name: result.font_info.primary_font,
        confidence: result.font_info.confidence,
        category: result.font_info.font_category,
        alternatives: result.font_info.alternatives,
        downloadUrl: result.font_info.download_url,
        googleFontsInfo: result.font_info.google_fonts_info,
      };
    } else if ("prediction" in result) {
      return {
        name: result.prediction.font,
        confidence: result.prediction.confidence,
        category: result.prediction.category,
        alternatives: result.prediction.alternatives,
        downloadUrl: `https://fonts.google.com/specimen/${result.prediction.font.replace(
          /\s+/g,
          "+"
        )}`,
        googleFontsInfo: null,
      };
    } else if (result.font && result.confidence) {
      // Handle new response format with font info at root level
      return {
        name: result.font,
        confidence: result.confidence,
        category: result.category || "Unknown",
        alternatives:
          result.alternatives?.map((alt) => ({
            name: alt.name,
            confidence: alt.confidence,
            category: alt.category,
          })) || [],
        downloadUrl:
          result.download_url ||
          `https://fonts.google.com/specimen/${result.font.replace(
            /\s+/g,
            "+"
          )}`,
        googleFontsInfo: null,
      };
    }
    return null;
  };

  const fontInfo = getFontInfo();
  if (!fontInfo) {
    return (
      <div className="bg-red-50/80 backdrop-blur-sm rounded-2xl p-6 border border-red-200/50">
        <div className="flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-red-900 mb-2">
              Invalid Result Format
            </h3>
            <p className="text-red-700">
              Unable to process font identification result.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const confidencePercentage = Math.round(fontInfo.confidence * 100);
  const fontName =
    fontInfo.name.charAt(0).toUpperCase() + fontInfo.name.slice(1);

  const handleDownload = async () => {
    setDownloadStatus("downloading");
    setDownloadMessage("Downloading font...");

    try {
      const downloadResult = await downloadGoogleFont(fontInfo.name);

      if (downloadResult.success && downloadResult.download_info) {
        setDownloadStatus("success");
        setDownloadMessage(
          `Font downloaded successfully! (${(
            downloadResult.download_info.file_size / 1024
          ).toFixed(1)} KB)`
        );

        // Auto-clear success message after 5 seconds
        setTimeout(() => {
          setDownloadStatus("idle");
          setDownloadMessage("");
        }, 5000);
      } else {
        setDownloadStatus("error");
        setDownloadMessage(downloadResult.message || "Download failed");
      }
    } catch (error) {
      setDownloadStatus("error");
      setDownloadMessage("Download failed. Please try again.");
    }
  };

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
              {isStoriaResult ? "Storia AI" : "DeepFont"} AI-powered
              identification
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
            Category: {fontInfo.category}
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

      {/* Action Buttons */}
      <div className="mb-6 space-y-3">
        {/* Google Fonts Link */}
        {fontInfo.downloadUrl && (
          <a
            href={fontInfo.downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View on Google Fonts</span>
          </a>
        )}

        {/* Download Button */}
        {fontInfo.googleFontsInfo && (
          <button
            onClick={handleDownload}
            disabled={downloadStatus === "downloading"}
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>
              {downloadStatus === "downloading"
                ? "Downloading..."
                : "Download Font"}
            </span>
          </button>
        )}

        {/* Download Status */}
        {downloadStatus !== "idle" && (
          <div
            className={`flex items-center space-x-2 text-sm ${
              downloadStatus === "success"
                ? "text-green-600"
                : downloadStatus === "error"
                ? "text-red-600"
                : "text-blue-600"
            }`}
          >
            {downloadStatus === "success" && (
              <CheckCircle className="w-4 h-4" />
            )}
            {downloadStatus === "error" && <XCircle className="w-4 h-4" />}
            <span>{downloadMessage}</span>
          </div>
        )}
      </div>

      {/* Font Variants (Storia AI only) */}
      {isStoriaResult && fontInfo.googleFontsInfo && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Available Variants
          </h4>
          <div className="flex flex-wrap gap-2">
            {fontInfo.googleFontsInfo.variants
              .slice(0, 6)
              .map((variant, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                >
                  {variant}
                </span>
              ))}
            {fontInfo.googleFontsInfo.variants.length > 6 && (
              <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-md">
                +{fontInfo.googleFontsInfo.variants.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Alternative Predictions */}
      {fontInfo.alternatives && fontInfo.alternatives.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">
            Alternative Matches
          </h4>
          <div className="space-y-2">
            {fontInfo.alternatives.map((prediction, index) => (
              <div
                key={index}
                className="flex justify-between items-center text-sm"
              >
                <span className="text-gray-600">
                  {prediction.name || prediction.font}
                </span>
                <span className="text-gray-500">
                  {Math.round((prediction.confidence || 0) * 100)}%
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

export const EnhancedFontResultError = ({
  error,
  onRetry,
  service = "deepfont",
}: {
  error: string;
  onRetry?: () => void;
  service?: "deepfont" | "storia";
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
          <div className="text-sm text-red-600 mb-4">
            Service: {service === "storia" ? "Storia AI" : "DeepFont"}
          </div>
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
