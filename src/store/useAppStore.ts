import { create } from "zustand";
import type { FontIdentificationResult } from "../services/fontIdentification";
import { identifyFont as identifyFontService } from "../services/fontIdentification";

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
  fontResult?: FontIdentificationResult;
  isIdentifying?: boolean;
  confidenceThreshold?: number;
}

interface AppState {
  screenshots: Screenshot[];
  isLoading: boolean;
  error: string | null;
  currentCropImage: Screenshot | null;
  backendConnected: boolean;
  defaultConfidenceThreshold: number;

  // Actions
  addScreenshot: (file: File) => void;
  removeScreenshot: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  setCurrentCropImage: (screenshot: Screenshot | null) => void;
  updateScreenshotCrop: (
    id: string,
    croppedImage: string,
    cropData: { x: number; y: number; width: number; height: number }
  ) => void;
  identifyFont: (id: string, confidenceThreshold?: number) => Promise<void>;
  setBackendConnected: (connected: boolean) => void;
  setDefaultConfidenceThreshold: (threshold: number) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  screenshots: [],
  isLoading: false,
  error: null,
  currentCropImage: null,
  backendConnected: false,
  defaultConfidenceThreshold: 0.3,

  addScreenshot: (file: File) => {
    const id = crypto.randomUUID();
    const preview = URL.createObjectURL(file);
    const screenshot: Screenshot = {
      id,
      file,
      preview,
      uploadedAt: new Date(),
    };

    set((state) => ({
      screenshots: [...state.screenshots, screenshot],
    }));
  },

  removeScreenshot: (id: string) => {
    set((state) => {
      const screenshot = state.screenshots.find((s) => s.id === id);
      if (screenshot) {
        URL.revokeObjectURL(screenshot.preview);
        if (screenshot.croppedImage) {
          URL.revokeObjectURL(screenshot.croppedImage);
        }
      }
      return {
        screenshots: state.screenshots.filter((s) => s.id !== id),
      };
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  clearError: () => {
    set({ error: null });
  },

  setCurrentCropImage: (screenshot: Screenshot | null) => {
    set({ currentCropImage: screenshot });
  },

  updateScreenshotCrop: (
    id: string,
    croppedImage: string,
    cropData: { x: number; y: number; width: number; height: number }
  ) => {
    set((state) => ({
      screenshots: state.screenshots.map((s) =>
        s.id === id ? { ...s, croppedImage, cropData } : s
      ),
    }));
  },

  identifyFont: async (id: string, confidenceThreshold?: number) => {
    const state = get();
    const screenshot = state.screenshots.find((s) => s.id === id);

    if (!screenshot) {
      set({ error: "Screenshot not found" });
      return;
    }

    // Use provided confidence threshold or default
    const threshold = confidenceThreshold ?? state.defaultConfidenceThreshold;

    // Mark as identifying
    set((state) => ({
      screenshots: state.screenshots.map((s) =>
        s.id === id ? { ...s, isIdentifying: true, confidenceThreshold: threshold } : s
      ),
    }));

    try {
      // Set global loading state
      set({ isLoading: true, error: null });

      const result = await identifyFontService(screenshot.file, threshold);

      // Update with font result
      set((state) => ({
        screenshots: state.screenshots.map((s) =>
          s.id === id ? { ...s, fontResult: result, isIdentifying: false } : s
        ),
        isLoading: false,
      }));
    } catch (error) {
      let errorMessage = "Font identification failed";

      if (error instanceof Error) {
        if (error.message.includes("timeout")) {
          errorMessage =
            "Request timed out. The AI model is taking longer than expected. Please try again.";
        } else if (error.message.includes("Network Error")) {
          errorMessage =
            "Network error. Please check your connection and try again.";
        } else if (error.message.includes("confidence")) {
          errorMessage =
            "Invalid confidence threshold. Please use a value between 0.0 and 1.0.";
        } else {
          errorMessage = error.message;
        }
      }

      set((state) => ({
        screenshots: state.screenshots.map((s) =>
          s.id === id ? { ...s, isIdentifying: false } : s
        ),
        isLoading: false,
        error: errorMessage,
      }));
    }
  },

  setBackendConnected: (connected: boolean) => {
    set({ backendConnected: connected });
  },

  setDefaultConfidenceThreshold: (threshold: number) => {
    set({ defaultConfidenceThreshold: threshold });
  },
}));
