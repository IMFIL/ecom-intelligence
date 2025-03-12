
import React from "react";
import { DollarSign, AlertCircle, TrendingUp, BarChart, Calendar, TrendingDown, Minus } from "lucide-react";
import { Competitor } from "@/types/competitor";
import { Badge } from "@/components/ui/badge";
import { 
  HoverPopover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";

interface BusinessMetricsProps {
  revenue?: string;
  traffic?: string;
  threats?: string[];
  mainCompany?: Competitor | null;
}

const formatValue = (value: string | undefined): number => {
  if (!value) return 0;
  
  const matches = value.match(/(\d+(?:\.\d+)?)/g);
  if (!matches) return 0;
  
  const numericValue = parseFloat(matches[0]);
  
  if (value.includes('B')) {
    return numericValue * 1000;
  } else if (value.includes('M')) {
    return numericValue;
  } else if (value.includes('K')) {
    return numericValue / 1000;
  }
  
  return numericValue;
};

// Format traffic values properly - show K for thousands when below 1M
const formatTrafficDisplay = (value: string | undefined): string => {
  if (!value) return "N/A";
  
  const numericValue = formatValue(value);
  
  // If value is less than 1 (meaning less than 1M), convert to thousands format
  if (numericValue < 1 && numericValue > 0) {
    // Convert from millions to thousands (multiply by 1000)
    const inThousands = numericValue * 1000;
    return `${inThousands.toFixed(1)}K`;
  }
  
  return value;
};

const compareValues = (competitorValue: string | undefined, mainCompanyValue: string | undefined) => {
  if (!competitorValue || !mainCompanyValue) return { icon: <Minus className="w-4 h-4 text-gray-400" />, text: "No comparison" };
  
  const compValue = formatValue(competitorValue);
  const mainValue = formatValue(mainCompanyValue);
  
  if (compValue > mainValue) {
    return { 
      icon: <TrendingUp className="w-4 h-4 text-red-500" />, 
      text: "Higher",
      value: `+${((compValue - mainValue) / mainValue * 100).toFixed(0)}%`,
      tooltipText: `${competitorValue} vs ${mainCompanyValue}`,
      variant: "destructive" as const
    };
  } else if (compValue < mainValue) {
    return { 
      icon: <TrendingDown className="w-4 h-4 text-green-500" />, 
      text: "Lower",
      value: `-${((mainValue - compValue) / mainValue * 100).toFixed(0)}%`,
      tooltipText: `${competitorValue} vs ${mainCompanyValue}`,
      variant: "success" as const
    };
  } else {
    return { 
      icon: <Minus className="w-4 h-4 text-blue-500" />, 
      text: "Equal",
      value: "0%",
      tooltipText: `${competitorValue} vs ${mainCompanyValue}`,
      variant: "outline" as const
    };
  }
};

const BusinessMetrics = ({ revenue, traffic, threats, mainCompany }: BusinessMetricsProps) => {
  // Removed revenueComparison variable
  const trafficComparison = mainCompany && mainCompany.traffic && traffic ? compareValues(traffic, mainCompany.traffic) : null;
  
  // Format the traffic value for display
  const displayTraffic = formatTrafficDisplay(traffic);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
          <DollarSign className="w-4 h-4 mr-2 text-[#9b87f5]" />
          Revenue Information
        </h4>
        <div className="space-y-2">
          <div className="bg-gray-50 p-2 rounded">
            <div className="flex items-center text-xs text-gray-500 mb-1">
              <DollarSign className="w-3 h-3 mr-1" />
              Estimated Annual Revenue
            </div>
            <div className="flex items-center justify-between">
              <div className="text-sm">
                {revenue || "No public information available"}
              </div>
              {/* Revenue comparison removed here */}
            </div>
          </div>
        </div>
      </div>

      {traffic && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <TrendingUp className="w-4 h-4 mr-2 text-blue-500" />
            Traffic
          </h4>

          <div className="mt-2 bg-gray-50 p-2 rounded">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-xs text-gray-500 mb-1">
                <BarChart className="w-3 h-3 mr-1" />
                Page Views
              </div>
              <div className="flex items-center text-xs">
                <Calendar className="w-3 h-3 mr-1" />
                <span>Jan 2025</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">{displayTraffic}</span>
              
              {mainCompany && mainCompany.traffic && trafficComparison && (
                <HoverPopover>
                  <PopoverTrigger>
                    <Badge 
                      variant={trafficComparison.variant}
                      className="flex items-center gap-1 cursor-help hover:bg-gray-100"
                    >
                      {trafficComparison.icon}
                      <span className="text-xs">{trafficComparison.value}</span>
                    </Badge>
                  </PopoverTrigger>
                  <PopoverContent className="w-64 p-3">
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Traffic Comparison</h4>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-xs text-gray-500">Competitor</p>
                          <p className="font-medium">{displayTraffic}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">{mainCompany.name}</p>
                          <p className="font-medium">{formatTrafficDisplay(mainCompany.traffic)}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 italic mt-2">
                        {trafficComparison.text === "Higher" 
                          ? `This competitor has ${trafficComparison.value} higher traffic than ${mainCompany.name} (negative)`
                          : trafficComparison.text === "Lower"
                          ? `This competitor has ${trafficComparison.value.replace('-', '')} lower traffic than ${mainCompany.name} (positive)`
                          : `The traffic is equal to ${mainCompany.name}`}
                      </p>
                    </div>
                  </PopoverContent>
                </HoverPopover>
              )}
            </div>
          </div>
        </div>
      )}

      {threats && threats.length > 0 && (
        <div className={(revenue || traffic) ? "md:col-span-2 mt-2" : ""}>
          <h4 className="font-medium text-gray-900 mb-2 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
            Threats
          </h4>
          <ul className="space-y-2">
            {threats.map((threat, index) => (
              <li
                key={index}
                className="text-gray-700 text-sm flex items-start bg-gray-50 p-2 rounded"
              >
                <span className="text-red-500 mr-2 font-bold">•</span>
                {threat}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BusinessMetrics;
