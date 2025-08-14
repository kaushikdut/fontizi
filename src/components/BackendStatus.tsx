import { useEffect, useState } from "react";
import { Wifi, WifiOff, CheckCircle, AlertCircle, Sparkles, Info } from "lucide-react";
import { useAppStore } from "../store/useAppStore";
import { checkBackendHealth, getStoriaModelStatus } from "../services/fontIdentification";

export const BackendStatus = () => {
  const { backendConnected, setBackendConnected } = useAppStore();
  const [modelStatus, setModelStatus] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const checkHealth = async () => {
      try {
        const isHealthy = await checkBackendHealth();
        setBackendConnected(isHealthy);
        
        // If backend is healthy, get model status
        if (isHealthy) {
          try {
            const status = await getStoriaModelStatus();
            setModelStatus(status);
          } catch (error) {
            console.error("Failed to get model status:", error);
          }
        }
      } catch (error) {
        setBackendConnected(false);
        setModelStatus(null);
      }
    };

    // Check immediately
    checkHealth();

    // Check every 30 seconds
    const interval = setInterval(checkHealth, 30000);

    return () => clearInterval(interval);
  }, [setBackendConnected]);

  if (backendConnected) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center space-x-2 text-green-600 hover:text-green-700 transition-colors"
        >
          <CheckCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Enhanced AI Ready</span>
          <Sparkles className="w-3 h-3" />
        </button>

        {/* Enhanced Features Tooltip */}
        {showDetails && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
            <div className="flex items-center space-x-2 mb-3">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <h4 className="font-medium text-gray-900">Enhanced Features</h4>
            </div>
            
            {modelStatus && (
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Model Status:</span>
                  <span className={`font-medium ${modelStatus.available ? 'text-green-600' : 'text-red-600'}`}>
                    {modelStatus.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Text Detection:</span>
                  <span className={`font-medium ${modelStatus.enhanced_features?.text_region_detection ? 'text-green-600' : 'text-gray-400'}`}>
                    {modelStatus.enhanced_features?.text_region_detection ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Confidence Filtering:</span>
                  <span className={`font-medium ${modelStatus.enhanced_features?.confidence_thresholding ? 'text-green-600' : 'text-gray-400'}`}>
                    {modelStatus.enhanced_features?.confidence_thresholding ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Image Enhancement:</span>
                  <span className={`font-medium ${modelStatus.enhanced_features?.image_enhancement ? 'text-green-600' : 'text-gray-400'}`}>
                    {modelStatus.enhanced_features?.image_enhancement ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Ensemble Predictions:</span>
                  <span className={`font-medium ${modelStatus.enhanced_features?.ensemble_predictions ? 'text-green-600' : 'text-gray-400'}`}>
                    {modelStatus.enhanced_features?.ensemble_predictions ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Min Confidence:</span>
                    <span className="font-medium text-gray-900">
                      {(modelStatus.confidence_thresholds?.min_confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">High Confidence:</span>
                    <span className="font-medium text-gray-900">
                      {(modelStatus.confidence_thresholds?.high_confidence * 100).toFixed(0)}%
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <div className="mt-3 pt-2 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                Enhanced AI with text region detection, confidence filtering, and ensemble predictions for better accuracy.
              </p>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2 text-red-600">
      <AlertCircle className="w-4 h-4" />
      <span className="text-sm font-medium">Backend Disconnected</span>
    </div>
  );
};
