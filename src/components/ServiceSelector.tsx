import { useState } from "react";
import { Settings, Sparkles, Target, Info } from "lucide-react";
import { useAppStore } from "../store/useAppStore";

export const ServiceSelector = () => {
  const { defaultConfidenceThreshold, setDefaultConfidenceThreshold } =
    useAppStore();
  const [showConfig, setShowConfig] = useState(false);

  const handleConfidenceChange = (value: number) => {
    setDefaultConfidenceThreshold(value);
  };

  return (
    <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-gray-200/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Enhanced AI Service
            </h3>
            <p className="text-sm text-gray-600">
              Storia AI with advanced features
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowConfig(!showConfig)}
          className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Enhanced Features List */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-gray-700">Text Region Detection</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
          <span className="text-gray-700">Confidence Filtering</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
          <span className="text-gray-700">Image Enhancement</span>
        </div>
        <div className="flex items-center space-x-2 text-sm">
          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
          <span className="text-gray-700">Ensemble Predictions</span>
        </div>
      </div>

      {/* Configuration Panel */}
      {showConfig && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <div className="space-y-4">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <Target className="w-4 h-4 text-gray-600" />
                <label className="text-sm font-medium text-gray-700">
                  Confidence Threshold:{" "}
                  {(defaultConfidenceThreshold * 100).toFixed(0)}%
                </label>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.9"
                step="0.1"
                value={defaultConfidenceThreshold}
                onChange={(e) =>
                  handleConfidenceChange(parseFloat(e.target.value))
                }
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10% (More Results)</span>
                <span>90% (Higher Accuracy)</span>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-start space-x-2">
                <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">
                    Confidence Threshold Guide:
                  </p>
                  <ul className="space-y-1 text-xs">
                    <li>
                      • <strong>10-30%:</strong> More results, may include less
                      accurate predictions
                    </li>
                    <li>
                      • <strong>30-50%:</strong> Balanced accuracy and coverage
                      (Recommended)
                    </li>
                    <li>
                      • <strong>50-90%:</strong> Higher accuracy, fewer results
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Indicator */}
      <div className="flex items-center space-x-2 text-sm text-green-600">
        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
        <span>Enhanced features enabled</span>
      </div>
    </div>
  );
};
