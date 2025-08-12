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

// Storia AI and Google Fonts interfaces
export interface StoriaFontInfo {
  primary_font: string;
  confidence: number;
  alternatives: Array<{
    name: string;
    confidence: number;
    category: string;
  }>;
  font_category: string;
  download_url?: string;
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

export const identifyFont = async (
  imageFile: File
): Promise<FontIdentificationResult> => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const response = await apiClient.post("/api/identify-font", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      timeout: 120000, // 2 minutes specifically for font identification
    });

    const data: FontIdentificationResult = response.data;

    // Transform response to match existing interface
    // Handle both old and new response formats
    if (data.prediction) {
      // Old format with prediction object
      return {
        success: data.success,
        filename: data.filename,
        file_size: data.file_size,
        prediction: {
          font: data.prediction.font,
          confidence: data.prediction.confidence,
          category: data.prediction.category,
          alternatives: data.prediction.alternatives,
        },
      };
    } else {
      // New format with font info at root level
      return {
        success: data.success,
        filename: data.filename,
        file_size: data.file_size,
        prediction: {
          font: data.font || "Unknown",
          confidence: data.confidence || 0.0,
          category: data.category || "Unknown",
          alternatives:
            data.alternatives?.map((alt) => ({
              font: alt.name,
              confidence: alt.confidence,
            })) || [],
        },
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

// Storia AI Font Recognition
export const identifyFontWithStoria = async (
  imageFile: File
): Promise<StoriaFontResult> => {
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

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
      `/api/google-fonts/preview?font_name=${encodeURIComponent(
        fontName
      )}&text=${encodeURIComponent(text)}`
    );

    return response.data;
  } catch (error) {
    console.error("Font preview generation failed:", error);
    throw error;
  }
};

// Storia AI Model Status
export interface StoriaModelStatus {
  available: boolean;
  model_path: string;
  google_fonts_configured: boolean;
}

export const getStoriaModelStatus = async (): Promise<StoriaModelStatus> => {
  try {
    const response = await apiClient.get("/api/storia/status");
    return response.data;
  } catch (error) {
    console.error("Failed to get Storia model status:", error);
    throw error;
  }
};
