import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Check, X, RotateCw, Type, Sparkles } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

interface ImageCropperProps {
  onClose: () => void;
}

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CroppedAreaPixels {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface CropPosition {
  x: number;
  y: number;
}

export const ImageCropper = ({ onClose }: ImageCropperProps) => {
  const { currentCropImage, updateScreenshotCrop, setCurrentCropImage } =
    useAppStore();
  const [crop, setCrop] = useState<CropPosition>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);
  const [isCropping, setIsCropping] = useState<boolean>(false);

  const onCropComplete = useCallback(
    (_croppedArea: CropArea, croppedAreaPixels: CroppedAreaPixels) => {
      // Store the crop data for later use
      setCropData(croppedAreaPixels);
    },
    []
  );

  const [cropData, setCropData] = useState<CroppedAreaPixels | null>(null);

  const createCroppedImage = async () => {
    if (!currentCropImage || !cropData) return;

    setIsCropping(true);

    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("Could not get canvas context");
      }

      const image = new Image();
      image.src = currentCropImage.preview;

      await new Promise<void>((resolve) => {
        image.onload = () => resolve();
      });

      // Set canvas dimensions to the cropped area
      canvas.width = cropData.width;
      canvas.height = cropData.height;

      // Apply rotation if needed
      if (rotation !== 0) {
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.drawImage(
          image,
          cropData.x,
          cropData.y,
          cropData.width,
          cropData.height,
          -cropData.width / 2,
          -cropData.height / 2,
          cropData.width,
          cropData.height
        );
        ctx.restore();
      } else {
        // Draw the cropped area
        ctx.drawImage(
          image,
          cropData.x,
          cropData.y,
          cropData.width,
          cropData.height,
          0,
          0,
          cropData.width,
          cropData.height
        );
      }

      // Convert canvas to blob
      canvas.toBlob((blob) => {
        if (blob) {
          const croppedImageUrl = URL.createObjectURL(blob);
          updateScreenshotCrop(currentCropImage.id, croppedImageUrl, {
            x: cropData.x,
            y: cropData.y,
            width: cropData.width,
            height: cropData.height,
          });
          setCurrentCropImage(null);
          onClose();
        }
      }, "image/png");
    } catch (error) {
      console.error("Error creating cropped image:", error);
    } finally {
      setIsCropping(false);
    }
  };

  const handleCancel = () => {
    setCurrentCropImage(null);
    onClose();
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  if (!currentCropImage) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl max-w-5xl w-full mx-4 max-h-[90vh] overflow-hidden border border-gray-200/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <Type className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Select Font Region
              </h3>
              <p className="text-sm text-gray-500">
                Crop the text area you want to analyze
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleRotate}
              className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
              title="Rotate image"
            >
              <RotateCw className="w-5 h-5" />
            </button>
            <button
              onClick={handleCancel}
              className="p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all duration-200"
              title="Cancel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Cropper Container */}
        <div className="relative w-full h-96 md:h-[500px] bg-gray-50">
          <Cropper
            image={currentCropImage.preview}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            objectFit="contain"
            showGrid={true}
            cropSize={{ width: 200, height: 100 }}
            minZoom={0.5}
            maxZoom={3}
            style={{
              containerStyle: {
                width: "100%",
                height: "100%",
                backgroundColor: "#f8fafc",
              },
            }}
          />
        </div>

        {/* Controls */}
        <div className="p-6 border-t border-gray-200/50 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-3">
                <label className="text-sm font-medium text-gray-700">
                  Zoom: {Math.round(zoom * 100)}%
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Sparkles className="w-4 h-4" />
                <span>
                  Drag to move • Resize corners • Use grid for alignment
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={handleCancel}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={createCroppedImage}
                disabled={isCropping || !cropData}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium flex items-center space-x-2 shadow-lg"
              >
                {isCropping ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Extract Font Region</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
