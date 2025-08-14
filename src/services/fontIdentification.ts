import axios from "axios";

// Create axios instance with default config
const apiClient = axios.create({
  timeout: 120000, // 2 minutes timeout for AI model inference
  baseURL: "http://localhost:3001",
});

export interface FontIdentificationResult {
  success: boolean;
  filename?: string;
  file_size?: number;
  font?: string;
  confidence?: number;
  category?: string;
  alternatives?: Array<{
    name: string;
    confidence: number;
    category: string;
  }>;
  download_url?: string;
  prediction?: {
    font: string;
    confidence: number;
    category: string;
    alternatives?: Array<{
      font: string;
      confidence: number;
    }>;
  };
  // Enhanced features
  metadata?: {
    filename: string;
    upload_timestamp: string;
    file_size: number;
    preprocessing_status: string;
    confidence_threshold_used: number;
  };
  enhancement_info?: {
    text_regions_detected: number;
    confidence_threshold: number;
    prediction_method: string;
  };
  error?: string;
}

export interface FontIdentificationError {
  error: string;
  success: boolean;
}

export interface FontDatabase {
  success: boolean;
  fonts: Array<{
    id: string;
    name: string;
    category: string;
  }>;
  total: number;
}

export interface ModelInfo {
  success: boolean;
  model_info: {
    name: string;
    architecture: string;
    input_shape: number[];
    num_classes: number;
    preprocessing_techniques: string[];
    paper_reference: string;
    github_reference: string;
  };
}

// Enhanced Storia AI interfaces
export interface StoriaFontInfo {
  primary_font: string;
  confidence: number;
  confidence_level: string;
  alternatives: Array<{
    name: string;
    confidence: number;
    category: string;
    confidence_level: string;
  }>;
  font_category: string;
  download_url?: string;
  text_regions_detected: number;
  prediction_quality: string;
  google_fonts_info?: {
    family: string;
    category: string;
    variants: string[];
    subsets: string[];
    version: string;
    api_url: Record<string, string>;
  };
}

export interface StoriaFontResult {
  success: boolean;
  filename?: string;
  file_size?: number;
  service: string;
  font_info?: StoriaFontInfo;
  raw_predictions?: Array<{
    font: string;
    confidence: number;
    class: string;
    version: string;
    confidence_level: string;
    count: number;
  }>;
  enhancement_info?: {
    text_regions_detected: number;
    confidence_threshold: number;
    prediction_method: string;
  };
  metadata?: {
    filename: string;
    upload_timestamp: string;
    file_size: number;
    preprocessing_status: string;
    confidence_threshold_used: number;
  };
  error?: string;
}

export interface GoogleFontInfo {
  family: string;
  category: string;
  variants: string[];
  subsets: string[];
  version: string;
  download_url: string;
  api_url: Record<string, string>;
}

export interface GoogleFontSearchResult {
  success: boolean;
  font_info?: GoogleFontInfo;
  message?: string;
}

export interface FontDownloadResult {
  success: boolean;
  download_info?: {
    font_path: string;
    font_filename: string;
    font_url: string;
    file_size: number;
  };
  message?: string;
}

export interface FontPreviewResult {
  success: boolean;
  preview_url?: string;
  font_name: string;
  sample_text: string;
}

// Enhanced font identification with confidence threshold support
export const identifyFont = async (
  imageFile: File,
  confidenceThreshold?: number
): Promise<FontIdentificationResult> => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);
    
    // Add confidence threshold if provided
    if (confidenceThreshold !== undefined) {
      formData.append("confidence_threshold", confidenceThreshold.toString());
    }

    const response = await apiClient.post("/api/storia/identify-font", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000, // 2 minutes specifically for font identification
    });

    const data: StoriaFontResult = response.data;

    // Transform enhanced response to match existing interface
    if (data.success && data.font_info) {
      return {
        success: data.success,
        filename: data.metadata?.filename,
        file_size: data.metadata?.file_size,
        font: data.font_info.primary_font,
        confidence: data.font_info.confidence,
        category: data.font_info.font_category,
        alternatives: data.font_info.alternatives,
        download_url: data.font_info.download_url,
        metadata: data.metadata,
        enhancement_info: data.enhancement_info,
        prediction: {
          font: data.font_info.primary_font,
          confidence: data.font_info.confidence,
          category: data.font_info.font_category,
          alternatives: data.font_info.alternatives?.map(alt => ({
            font: alt.name,
            confidence: alt.confidence,
          })),
        },
      };
    } else {
      return {
        success: false,
        error: data.error || "Font identification failed",
      };
    }
  } catch (error) {
    console.error("Font identification failed:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Font identification failed");
    }
  }
};

// Base64 image identification
export const identifyFontBase64 = async (
  base64Image: string,
  confidenceThreshold?: number
): Promise<FontIdentificationResult> => {
  try {
    const payload: any = {
      image: base64Image,
    };
    
    if (confidenceThreshold !== undefined) {
      payload.confidence_threshold = confidenceThreshold;
    }

    const response = await apiClient.post("/api/storia/identify-font-base64", payload, {
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 120000,
    });

    const data: StoriaFontResult = response.data;

    // Transform enhanced response to match existing interface
    if (data.success && data.font_info) {
      return {
        success: data.success,
        filename: data.metadata?.filename,
        file_size: data.metadata?.file_size,
        font: data.font_info.primary_font,
        confidence: data.font_info.confidence,
        category: data.font_info.font_category,
        alternatives: data.font_info.alternatives,
        download_url: data.font_info.download_url,
        metadata: data.metadata,
        enhancement_info: data.enhancement_info,
        prediction: {
          font: data.font_info.primary_font,
          confidence: data.font_info.confidence,
          category: data.font_info.font_category,
          alternatives: data.font_info.alternatives?.map(alt => ({
            font: alt.name,
            confidence: alt.confidence,
          })),
        },
      };
    } else {
      return {
        success: false,
        error: data.error || "Font identification failed",
      };
    }
  } catch (error) {
    console.error("Base64 font identification failed:", error);
    if (error instanceof Error) {
      throw error;
    } else {
      throw new Error("Font identification failed");
    }
  }
};

export const checkBackendHealth = async (): Promise<boolean> => {
  try {
    const response = await apiClient.get("/health");
    return response.status === 200;
  } catch (error) {
    console.error("Backend health check failed:", error);
    return false;
  }
};

export const getAvailableFonts = async (): Promise<FontDatabase> => {
  try {
    const response = await apiClient.get("/api/fonts");
    return response.data;
  } catch (error) {
    console.error("Failed to get available fonts:", error);
    throw error;
  }
};

// Enhanced Storia AI Font Recognition
export const identifyFontWithStoria = async (
  imageFile: File,
  confidenceThreshold?: number
): Promise<StoriaFontResult> => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);
    
    if (confidenceThreshold !== undefined) {
      formData.append("confidence_threshold", confidenceThreshold.toString());
    }

    const response = await apiClient.post(
      "/api/storia/identify-font",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Storia font identification failed:", error);
    throw error;
  }
};

// Google Fonts Services
export const searchGoogleFonts = async (
  fontName: string
): Promise<GoogleFontSearchResult> => {
  try {
    const response = await apiClient.get(
      `/api/google-fonts/search?q=${encodeURIComponent(fontName)}`
    );
    return response.data;
  } catch (error) {
    console.error("Google Fonts search failed:", error);
    throw error;
  }
};

export const downloadGoogleFont = async (
  fontName: string,
  variant: string = "regular"
): Promise<FontDownloadResult> => {
  try {
    const response = await apiClient.post(
      "/api/google-fonts/download",
      {
        font_name: fontName,
        variant,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("Font download failed:", error);
    throw error;
  }
};

export const getFontPreview = async (
  fontName: string,
  text: string = "Sample Text"
): Promise<FontPreviewResult> => {
  try {
    const response = await apiClient.get(
      `/api/fonts/preview?font_name=${encodeURIComponent(
        fontName
      )}&text=${encodeURIComponent(text)}`
    );

    return response.data;
  } catch (error) {
    console.error("Font preview generation failed:", error);
    throw error;
  }
};

// Enhanced Storia AI Model Status
export interface StoriaModelStatus {
  available: boolean;
  model_path: string;
  google_fonts_configured: boolean;
  enhanced_features: {
    text_region_detection: boolean;
    confidence_thresholding: boolean;
    image_enhancement: boolean;
    ensemble_predictions: boolean;
  };
  confidence_thresholds: {
    min_confidence: number;
    high_confidence: number;
  };
}

export const getStoriaModelStatus = async (): Promise<StoriaModelStatus> => {
  try {
    const response = await apiClient.get("/api/storia/status");
    return response.data.status;
  } catch (error) {
    console.error("Failed to get Storia model status:", error);
    throw error;
  }
};

// Accuracy feedback endpoint
export interface AccuracyFeedback {
  actual_font?: string;
  predicted_font?: string;
  confidence?: number;
  image_quality?: string;
  feedback?: string;
}

export const submitAccuracyFeedback = async (
  feedback: AccuracyFeedback
): Promise<{ success: boolean; message: string; feedback_id: string }> => {
  try {
    const response = await apiClient.post("/api/accuracy/improve", feedback, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to submit accuracy feedback:", error);
    throw error;
  }
};
