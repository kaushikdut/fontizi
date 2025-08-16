import { useState, useEffect } from "react";
import { ExternalLink } from "lucide-react";
import type { FontIdentificationResult } from "../services/fontIdentification";
import { createWorker } from "tesseract.js";

// OCR function to extract text from image using Tesseract.js
const extractTextFromImage = async (imageUrl: string): Promise<string> => {
  try {
    const worker = await createWorker("eng");
    const {
      data: { text },
    } = await worker.recognize(imageUrl);
    await worker.terminate();

    // Clean up the extracted text
    const cleanedText = text.trim().replace(/\n+/g, " ").replace(/\s+/g, " ");

    // If no text was found or text is too short, return a fallback
    if (!cleanedText || cleanedText.length < 2) {
      return "Sample Text";
    }

    // Limit text length to avoid very long previews
    return cleanedText.length > 50
      ? cleanedText.substring(0, 50) + "..."
      : cleanedText;
  } catch (error) {
    console.error("Error extracting text:", error);
    return "Sample Text";
  }
};

interface FontResultListProps {
  result: FontIdentificationResult;
  onRetry?: () => void;
  imageUrl?: string; // Add image URL for OCR
}

export const FontResultList = ({
  result,
  onRetry,
  imageUrl,
}: FontResultListProps) => {
  const [isLoadingPreview, setIsLoadingPreview] = useState<boolean>(false);
  const [extractedText, setExtractedText] = useState<string>("Sample Text");
  const [isExtractingText, setIsExtractingText] = useState<boolean>(false);

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

  // Load Google Fonts for preview and extract text from image
  useEffect(() => {
    const loadGoogleFont = async () => {
      if (!prediction.font || prediction.font === "Unknown") return;

      setIsLoadingPreview(true);
      try {
        // Try to load the font from Google Fonts
        const fontFamily = prediction.font.replace(/\s+/g, "+");
        const link = document.createElement("link");
        link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:wght@400&display=swap`;
        link.rel = "stylesheet";
        document.head.appendChild(link);

        // Wait for font to load
        await new Promise((resolve) => setTimeout(resolve, 1500));
        setIsLoadingPreview(false);
      } catch (error) {
        console.error("Failed to load Google Font:", error);
        setIsLoadingPreview(false);
      }
    };

    // Extract text from image if available
    const extractText = async () => {
      if (imageUrl) {
        setIsExtractingText(true);
        try {
          const text = await extractTextFromImage(imageUrl);
          setExtractedText(text);
        } catch (error) {
          console.error("Failed to extract text:", error);
          setExtractedText("Sample Text");
        } finally {
          setIsExtractingText(false);
        }
      }
    };

    loadGoogleFont();
    extractText();
  }, [prediction.font, imageUrl]);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (confidence >= 60)
      return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 80) return "High";
    if (confidence >= 60) return "Medium";
    return "Low";
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50 shadow-lg">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Font Identification Results
        </h3>
        <p className="text-gray-600">
          Found{" "}
          {prediction.alternatives ? prediction.alternatives.length + 1 : 1}{" "}
          font match
          {prediction.alternatives && prediction.alternatives.length > 0
            ? "es"
            : ""}
        </p>
      </div>

      {/* Primary Result */}
      <div className="mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-gray-900 mb-1">
                {fontName}
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                {prediction.category}
              </p>

              {/* Confidence Badge */}
              <div
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getConfidenceColor(
                  confidencePercentage
                )}`}
              >
                <span>
                  {getConfidenceLevel(confidencePercentage)} Confidence
                </span>
                <span className="ml-2 font-bold">{confidencePercentage}%</span>
              </div>
            </div>

            <a
              href={`https://fonts.google.com/specimen/${fontName.replace(
                /\s+/g,
                "+"
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <ExternalLink className="w-3 h-3" />
              <span>View</span>
            </a>
          </div>

          {/* Font Preview */}
          <div className="mt-4">
            {isLoadingPreview || isExtractingText ? (
              <div className="h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-gray-500 text-sm">
                  {isExtractingText
                    ? "Extracting text from image..."
                    : "Loading font preview..."}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="text-center">
                  <div
                    className="text-2xl font-bold text-gray-900 mb-2"
                    style={{
                      fontFamily: `"${prediction.font}", Arial, sans-serif`,
                    }}
                  >
                    {extractedText}
                  </div>
                  <div className="text-sm text-gray-500">{fontName}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Alternative Results */}
      {prediction.alternatives && prediction.alternatives.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-4">
            Alternative Matches
          </h4>
          <div className="space-y-4">
            {prediction.alternatives.slice(0, 3).map((alt, index) => {
              const altConfidence = Math.round(alt.confidence * 100);
              const altFontName =
                alt.font.charAt(0).toUpperCase() + alt.font.slice(1);

              return (
                <div
                  key={index}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h5 className="text-md font-semibold text-gray-900 mb-1">
                        {altFontName}
                      </h5>

                      {/* Confidence Badge */}
                      <div
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getConfidenceColor(
                          altConfidence
                        )}`}
                      >
                        <span>
                          {getConfidenceLevel(altConfidence)} Confidence
                        </span>
                        <span className="ml-1 font-bold">{altConfidence}%</span>
                      </div>
                    </div>

                    <a
                      href={`https://fonts.google.com/specimen/${altFontName.replace(
                        /\s+/g,
                        "+"
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-1 px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors text-xs"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>View</span>
                    </a>
                  </div>

                  {/* Simple Font Preview */}
                  <div className="bg-white rounded-lg p-3 border border-gray-200">
                    <div className="text-center">
                      <div
                        className="text-lg font-bold text-gray-900 mb-1"
                        style={{
                          fontFamily: `"${alt.font}", Arial, sans-serif`,
                        }}
                      >
                        {extractedText}
                      </div>
                      <div className="text-xs text-gray-500">{altFontName}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* File Information */}
      {result.filename && (
        <div className="mt-6 pt-4 border-t border-gray-200">
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
