import { useState } from "react";
import {
  Download,
  Sparkles,
  AlertCircle,
  Info,
  CheckCircle,
  XCircle,
  Target,
  Zap,
  Eye,
  TrendingUp,
} from "lucide-react";
import type {
  FontIdentificationResult,
  StoriaFontResult,
} from "../services/fontIdentification";
import {
  downloadGoogleFont,
  submitAccuracyFeedback,
} from "../services/fontIdentification";

interface EnhancedFontResultProps {
  result: FontIdentificationResult | StoriaFontResult;
  onRetry?: () => void;
}

export const EnhancedFontResult = ({
  result,
  onRetry,
}: EnhancedFontResultProps) => {
  const [downloadStatus, setDownloadStatus] = useState<
    "idle" | "downloading" | "success" | "error"
  >("idle");
  const [downloadMessage, setDownloadMessage] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  const isStoriaResult = "service" in result && result.service === "Storia AI";

  // Extract font information based on service
  const getFontInfo = () => {
    if (isStoriaResult && result.font_info) {
      return {
        name: result.font_info.primary_font,
        confidence: result.font_info.confidence,
        confidenceLevel: result.font_info.confidence_level,
        category: result.font_info.font_category,
        alternatives: result.font_info.alternatives,
        downloadUrl: result.font_info.download_url,
        googleFontsInfo: result.font_info.google_fonts_info,
        textRegionsDetected: result.font_info.text_regions_detected,
        predictionQuality: result.font_info.prediction_quality,
      };
    } else if ("prediction" in result && result.prediction) {
      const fontResult = result as FontIdentificationResult;
      const confidence = fontResult.confidence || 0;
      return {
        name: result.prediction.font,
        confidence: result.prediction.confidence,
        confidenceLevel:
          confidence >= 0.7 ? "high" : confidence >= 0.3 ? "medium" : "low",
        category: result.prediction.category,
        alternatives: result.prediction.alternatives,
        downloadUrl: `https://fonts.google.com/specimen/${result.prediction.font.replace(
          /\s+/g,
          "+"
        )}`,
        googleFontsInfo: null,
        textRegionsDetected:
          result.enhancement_info?.text_regions_detected || 0,
        predictionQuality:
          confidence >= 0.7 ? "excellent" : confidence >= 0.5 ? "good" : "fair",
      };
    } else if (
      "font" in result &&
      result.font &&
      "confidence" in result &&
      result.confidence
    ) {
      // Handle new response format with font info at root level
      const fontResult = result as FontIdentificationResult;
      const confidence = fontResult.confidence || 0;
      const font = fontResult.font || "Unknown";
      return {
        name: font,
        confidence: confidence,
        confidenceLevel:
          confidence >= 0.7 ? "high" : confidence >= 0.3 ? "medium" : "low",
        category: fontResult.category || "Unknown",
        alternatives:
          fontResult.alternatives?.map((alt) => ({
            name: alt.name,
            confidence: alt.confidence,
            category: alt.category,
          })) || [],
        downloadUrl:
          fontResult.download_url ||
          `https://fonts.google.com/specimen/${font.replace(/\s+/g, "+")}`,
        googleFontsInfo: null,
        textRegionsDetected:
          fontResult.enhancement_info?.text_regions_detected || 0,
        predictionQuality:
          confidence >= 0.7 ? "excellent" : confidence >= 0.5 ? "good" : "fair",
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

  const getConfidenceColor = (level: string) => {
    switch (level) {
      case "high":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getQualityColor = (quality: string) => {
    switch (quality) {
      case "excellent":
        return "text-green-600 bg-green-50 border-green-200";
      case "good":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "fair":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "poor":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const handleDownload = async () => {
    if (!fontInfo.downloadUrl || !fontInfo.name) return;

    setDownloadStatus("downloading");
    setDownloadMessage("Downloading font...");

    try {
      const downloadResult = await downloadGoogleFont(fontInfo.name);

      if (downloadResult.success) {
        setDownloadStatus("success");
        setDownloadMessage("Font downloaded successfully!");
      } else {
        setDownloadStatus("error");
        setDownloadMessage("Download failed. Please try again.");
      }
    } catch (error) {
      setDownloadStatus("error");
      setDownloadMessage("Download failed. Please try again.");
    }
  };

  const handleFeedbackSubmit = async (feedback: any) => {
    try {
      await submitAccuracyFeedback({
        predicted_font: fontInfo.name,
        confidence: fontInfo.confidence,
        feedback: feedback.comment,
      });
      setFeedbackSubmitted(true);
      setShowFeedback(false);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    }
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
      {/* Enhanced Features Badge */}
      <div className="flex items-center space-x-2 mb-4">
        <Sparkles className="w-4 h-4 text-blue-600" />
        <span className="text-sm font-medium text-blue-700">
          Enhanced AI Recognition
        </span>
      </div>

      {/* Main Result */}
      <div className="mb-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              {fontInfo.name}
            </h3>
            <p className="text-gray-600 mb-3">{fontInfo.category}</p>

            {/* Enhanced Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div
                className={`px-3 py-2 rounded-lg border text-sm font-medium ${getConfidenceColor(
                  fontInfo.confidenceLevel
                )}`}
              >
                <div className="flex items-center space-x-1">
                  <Target className="w-3 h-3" />
                  <span>Confidence: {fontInfo.confidenceLevel}</span>
                </div>
                <div className="text-xs mt-1">
                  {((fontInfo.confidence || 0) * 100).toFixed(1)}%
                </div>
              </div>

              <div
                className={`px-3 py-2 rounded-lg border text-sm font-medium ${getQualityColor(
                  fontInfo.predictionQuality
                )}`}
              >
                <div className="flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Quality: {fontInfo.predictionQuality}</span>
                </div>
              </div>

              <div className="px-3 py-2 rounded-lg border text-sm font-medium text-blue-600 bg-blue-50 border-blue-200">
                <div className="flex items-center space-x-1">
                  <Eye className="w-3 h-3" />
                  <span>Text Regions: {fontInfo.textRegionsDetected}</span>
                </div>
              </div>

              <div className="px-3 py-2 rounded-lg border text-sm font-medium text-purple-600 bg-purple-50 border-purple-200">
                <div className="flex items-center space-x-1">
                  <Zap className="w-3 h-3" />
                  <span>Enhanced</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            {fontInfo.downloadUrl && (
              <button
                onClick={handleDownload}
                disabled={downloadStatus === "downloading"}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </button>
            )}

            <button
              onClick={() => setShowFeedback(!showFeedback)}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Info className="w-4 h-4" />
              <span>Feedback</span>
            </button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {downloadStatus === "success" && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-green-700 text-sm">{downloadMessage}</span>
          </div>
        )}

        {downloadStatus === "error" && (
          <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
            <XCircle className="w-4 h-4 text-red-600" />
            <span className="text-red-700 text-sm">{downloadMessage}</span>
          </div>
        )}

        {/* Feedback Form */}
        {showFeedback && !feedbackSubmitted && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 className="font-medium text-gray-900 mb-2">
              Help Improve Accuracy
            </h4>
            <textarea
              placeholder="Was this prediction correct? Any feedback to help improve accuracy?"
              className="w-full p-3 border border-gray-300 rounded-lg resize-none"
              rows={3}
            />
            <div className="flex space-x-2 mt-2">
              <button
                onClick={() =>
                  handleFeedbackSubmit({ comment: "Correct prediction" })
                }
                className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
              >
                Correct
              </button>
              <button
                onClick={() =>
                  handleFeedbackSubmit({ comment: "Incorrect prediction" })
                }
                className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
              >
                Incorrect
              </button>
              <button
                onClick={() => setShowFeedback(false)}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {feedbackSubmitted && (
          <div className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-lg mb-4">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span className="text-green-700 text-sm">
              Thank you for your feedback!
            </span>
          </div>
        )}
      </div>

      {/* Alternatives */}
      {fontInfo.alternatives && fontInfo.alternatives.length > 0 && (
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-3">
            Alternative Fonts
          </h4>
          <div className="space-y-2">
            {fontInfo.alternatives
              .slice(0, 5)
              .map((alt: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">{alt.name}</p>
                    <p className="text-sm text-gray-600">{alt.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {(alt.confidence * 100).toFixed(1)}%
                    </p>
                    <p className="text-xs text-gray-500">
                      {alt.confidence_level ||
                        (alt.confidence >= 0.7
                          ? "high"
                          : alt.confidence >= 0.3
                          ? "medium"
                          : "low")}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Enhanced Metadata */}
      {result.metadata && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            Analysis Details
          </h4>
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
            <div>File: {result.metadata.filename}</div>
            <div>Size: {(result.metadata.file_size / 1024).toFixed(1)} KB</div>
            <div>
              Threshold:{" "}
              {(result.metadata.confidence_threshold_used * 100).toFixed(0)}%
            </div>
            <div>Status: {result.metadata.preprocessing_status}</div>
          </div>
        </div>
      )}

      {/* Retry Button */}
      {onRetry && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onRetry}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export const EnhancedFontResultError = ({
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
          <div className="text-sm text-red-600 mb-4">Service: Storia AI</div>
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
