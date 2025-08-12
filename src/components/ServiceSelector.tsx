import React from "react";
import { Sparkles, Zap, Info } from "lucide-react";

export type FontService = "deepfont" | "storia";

interface ServiceSelectorProps {
  selectedService: FontService;
  onServiceChange: (service: FontService) => void;
  disabled?: boolean;
}

export const ServiceSelector = ({
  selectedService,
  onServiceChange,
  disabled = false,
}: ServiceSelectorProps) => {
  const services = [
    {
      id: "deepfont" as FontService,
      name: "DeepFont",
      description: "Local AI model with fast processing",
      icon: Sparkles,
      features: ["Fast processing", "No API costs", "Offline capable"],
      color: "from-blue-500 to-indigo-600",
    },
    {
      id: "storia" as FontService,
      name: "Storia AI",
      description: "Open-source local font recognition model",
      icon: Zap,
      features: [
        "Higher accuracy",
        "Google Fonts integration",
        "Font downloads",
        "Completely free",
      ],
      color: "from-purple-500 to-pink-600",
    },
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center space-x-2 mb-4">
        <Info className="w-5 h-5 text-gray-600" />
        <h3 className="text-lg font-semibold text-gray-900">
          Choose Recognition Service
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {services.map((service) => {
          const Icon = service.icon;
          const isSelected = selectedService === service.id;

          return (
            <button
              key={service.id}
              onClick={() => onServiceChange(service.id)}
              disabled={disabled}
              className={`
                relative p-4 rounded-xl border-2 transition-all duration-200 text-left
                ${
                  isSelected
                    ? `border-blue-500 bg-gradient-to-r ${service.color} text-white shadow-lg`
                    : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-md"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {/* Selection indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-md">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                </div>
              )}

              <div className="flex items-start space-x-3">
                <div
                  className={`
                  p-2 rounded-lg
                  ${isSelected ? "bg-white/20" : "bg-gray-100"}
                `}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      isSelected ? "text-white" : "text-gray-600"
                    }`}
                  />
                </div>

                <div className="flex-1">
                  <h4
                    className={`font-semibold mb-1 ${
                      isSelected ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {service.name}
                  </h4>
                  <p
                    className={`text-sm mb-3 ${
                      isSelected ? "text-white/90" : "text-gray-600"
                    }`}
                  >
                    {service.description}
                  </p>

                  {/* Features list */}
                  <ul className="space-y-1">
                    {service.features.map((feature, index) => (
                      <li
                        key={index}
                        className={`text-xs flex items-center space-x-1 ${
                          isSelected ? "text-white/80" : "text-gray-500"
                        }`}
                      >
                        <div
                          className={`w-1 h-1 rounded-full ${
                            isSelected ? "bg-white/60" : "bg-gray-400"
                          }`}
                        ></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Service-specific notes */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <div className="text-sm text-blue-800">
          <strong>Note:</strong>
          {selectedService === "storia"
            ? " Storia AI is an open-source model that runs locally. The model will be automatically downloaded and set up on first use."
            : " DeepFont uses a local AI model and doesn't require external API keys."}
        </div>
      </div>
    </div>
  );
};
