import React, { useState } from "react";
import { Gauge, ChevronDown, ChevronUp, Smartphone, Monitor, TrendingUp, TrendingDown, Minus, AlertTriangle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  HoverPopover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface PageSpeedMetrics {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  totalBlockingTime?: number;
  cumulativeLayoutShift?: number;
  speedIndex?: number;
  strategy?: "mobile" | "desktop";
}

interface PerformanceSectionProps {
  metrics: PageSpeedMetrics | null;
  loading: boolean;
  onStrategyChange?: (strategy: "mobile" | "desktop") => void;
  mainCompanyMetrics?: PageSpeedMetrics | null;
}

const getScoreColor = (score: number): string => {
  if (score >= 90) return "text-emerald-500"; // Green for good
  if (score >= 50) return "text-amber-500"; // Orange for average
  return "text-rose-500"; // Red for poor
};

const getScoreBackground = (score: number): string => {
  if (score >= 90) return "bg-emerald-50 dark:bg-emerald-950/30"; // Light green background
  if (score >= 50) return "bg-amber-50 dark:bg-amber-950/30"; // Light orange background
  return "bg-rose-50 dark:bg-rose-950/30"; // Light red background
};

const getMetricDotColor = (score: number): string => {
  if (score >= 90) return "bg-emerald-500"; // Green for good
  if (score >= 50) return "bg-amber-500"; // Orange for average
  return "bg-rose-500"; // Red for poor
};

const compareScores = (competitor: number, main: number) => {
  const diff = competitor - main;
  
  if (diff > 5) {
    return { 
      icon: <TrendingUp className="w-3 h-3 text-red-500" />, 
      text: `+${diff.toFixed(0)}`,
      color: "text-red-500",
      bgColor: "bg-red-100",
      tooltip: `${competitor.toFixed(0)} vs ${main.toFixed(0)}`
    };
  } else if (diff < -5) {
    return { 
      icon: <TrendingDown className="w-3 h-3 text-green-500" />, 
      text: `${diff.toFixed(0)}`,
      color: "text-green-500",
      bgColor: "bg-green-100",
      tooltip: `${competitor.toFixed(0)} vs ${main.toFixed(0)}`
    };
  } else {
    return { 
      icon: <Minus className="w-3 h-3 text-blue-500" />, 
      text: `${diff > 0 ? "+" : ""}${diff.toFixed(0)}`,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      tooltip: `${competitor.toFixed(0)} vs ${main.toFixed(0)}`
    };
  }
};

const ScoreGauge = ({ 
  score, 
  label
}: { 
  score: number; 
  label: string;
}) => {
  const colorClass = getScoreColor(score);
  const radius = 35; // SVG circle radius
  const circumference = 2 * Math.PI * radius;
  const progress = ((100 - score) / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={radius} className="fill-none stroke-gray-100 stroke-[4]" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            className={cn(
              "fill-none stroke-[4] transition-all duration-300",
              colorClass.replace("text-", "stroke-")
            )}
            strokeDasharray={circumference}
            strokeDashoffset={progress}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("text-2xl font-medium", colorClass)}>{score}</span>
        </div>
      </div>
      <span className="text-sm font-medium text-gray-600 mt-2">{label}</span>
    </div>
  );
};

const MetricItem = ({
  label,
  value,
  unit,
  score,
  comparisonValue,
}: {
  label: string;
  value: string | number;
  unit?: string;
  score?: number;
  comparisonValue?: number;
}) => {
  const scoreClass = score !== undefined ? getScoreColor(score) : "";
  const dotColor = score !== undefined ? getMetricDotColor(score) : "";
  
  const comparison = comparisonValue !== undefined && score !== undefined
    ? compareScores(score, comparisonValue)
    : null;

  return (
    <div className="group py-3 flex justify-between items-center border-b border-gray-100 last:border-0 hover:bg-gray-50/50 rounded-lg px-3 transition-colors duration-200">
      <div className="flex items-center">
        {score !== undefined && <div className={`w-2.5 h-2.5 rounded-full ${dotColor} mr-3`}></div>}
        <span className="text-gray-700 text-sm">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn("text-gray-700 text-sm", scoreClass)}>
          {value}
          {unit && (
            <span className="text-gray-400 text-gray-700 text-sm ml-1 group-hover:text-gray-500">
              {unit}
            </span>
          )}
        </span>
        
        {comparison && (
          <HoverPopover>
            <PopoverTrigger>
              <Badge 
                variant="outline" 
                className={cn("text-xs cursor-help hover:bg-gray-100", comparison.color, comparison.bgColor)}
              >
                {comparison.icon}
                <span className="ml-1">{comparison.text}</span>
              </Badge>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-3">
              <div className="space-y-2">
                <h4 className="font-medium text-sm">{label} Comparison</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">This competitor</p>
                    <p className="font-medium">
                      {value}{unit && <span className="text-gray-400 ml-1">{unit}</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Main company</p>
                    <p className="font-medium">
                      {comparisonValue}{unit && <span className="text-gray-400 ml-1">{unit}</span>}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 italic mt-2">
                  {Math.abs(score - (comparisonValue || 0)) > 5 
                    ? score > (comparisonValue || 0)
                      ? `This metric is ${comparison.text} higher (negative for main company)`
                      : `This metric is ${comparison.text.replace('-', '')} lower (positive for main company)`
                    : 'The metrics are comparable'}
                </p>
              </div>
            </PopoverContent>
          </HoverPopover>
        )}
      </div>
    </div>
  );
};

const PerformanceSection = ({ 
  metrics, 
  loading, 
  onStrategyChange,
  mainCompanyMetrics 
}: PerformanceSectionProps) => {
  const [strategy, setStrategy] = useState<"mobile" | "desktop">("desktop");
  const [isExpanded, setIsExpanded] = useState(false);

  const handleStrategyChange = (newStrategy: "mobile" | "desktop") => {
    setStrategy(newStrategy);
    if (onStrategyChange) {
      onStrategyChange(newStrategy);
    }
  };

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const renderHeader = () => (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Gauge className="w-5 h-5 text-[#9b87f5]" />
        <h3 className="font-medium">Performance Insights</h3>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1 bg-white hover:bg-gray-50">
            {strategy === "mobile" ? (
              <>
                <Smartphone className="w-4 h-4" />
                <span>Mobile</span>
              </>
            ) : (
              <>
                <Monitor className="w-4 h-4" />
                <span>Desktop</span>
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleStrategyChange("mobile")}>
            <Smartphone className="mr-2 h-4 w-4" />
            <span>Mobile</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleStrategyChange("desktop")}>
            <Monitor className="mr-2 h-4 w-4" />
            <span>Desktop</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-3">
        {renderHeader()}
        <div className="flex justify-around py-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex flex-col items-center">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-4 w-20 mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (metrics === null) {
    return (
      <div className="space-y-6">
        {renderHeader()}
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-gray-700">Data not available at this time</h4>
              <p className="text-gray-500 text-sm mt-1">
                We couldn't retrieve performance metrics for this website.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {renderHeader()}

      <div className="bg-white text-gray-800 rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
        <div className="px-6 pt-6 pb-3">
          <div className="flex justify-around py-4">
            <ScoreGauge score={metrics.performance} label="Performance" />
            <ScoreGauge score={metrics.accessibility} label="Accessibility" />
            <ScoreGauge score={metrics.bestPractices} label="Best Practices" />
            <ScoreGauge score={metrics.seo} label="SEO" />
          </div>

          <div className="mt-6">
            <p className="text-center text-sm text-gray-500 italic">
              Values are estimated and may vary. Performance score is calculated from these metrics.
            </p>
          </div>
        </div>

        <Separator />

        <div className="bg-white/80 backdrop-blur-sm">
          <button 
            onClick={toggleExpand} 
            className="w-full p-4 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <span className="uppercase tracking-wide text-gray-500 font-medium">Core Web Vitals</span>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4 text-gray-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-400" />
            )}
          </button>
          
          {isExpanded && (
            <div className="p-6 pt-2 space-y-1">
              {metrics.firstContentfulPaint !== undefined && (
                <MetricItem
                  label="First Contentful Paint"
                  value={metrics.firstContentfulPaint.toFixed(1)}
                  unit="s"
                  score={
                    metrics.firstContentfulPaint < 2 ? 90 : metrics.firstContentfulPaint < 4 ? 50 : 0
                  }
                  comparisonValue={mainCompanyMetrics?.firstContentfulPaint}
                />
              )}

              {metrics.largestContentfulPaint !== undefined && (
                <MetricItem
                  label="Largest Contentful Paint"
                  value={metrics.largestContentfulPaint.toFixed(1)}
                  unit="s"
                  score={
                    metrics.largestContentfulPaint < 2.5
                      ? 90
                      : metrics.largestContentfulPaint < 4
                      ? 50
                      : 0
                  }
                  comparisonValue={mainCompanyMetrics?.largestContentfulPaint}
                />
              )}

              {metrics.totalBlockingTime !== undefined && (
                <MetricItem
                  label="Total Blocking Time"
                  value={Math.round(metrics.totalBlockingTime)}
                  unit="ms"
                  score={
                    metrics.totalBlockingTime < 200 ? 90 : metrics.totalBlockingTime < 600 ? 50 : 0
                  }
                  comparisonValue={mainCompanyMetrics?.totalBlockingTime}
                />
              )}

              {metrics.cumulativeLayoutShift !== undefined && (
                <MetricItem
                  label="Cumulative Layout Shift"
                  value={metrics.cumulativeLayoutShift.toFixed(3)}
                  score={
                    metrics.cumulativeLayoutShift < 0.1
                      ? 90
                      : metrics.cumulativeLayoutShift < 0.25
                      ? 50
                      : 0
                  }
                  comparisonValue={mainCompanyMetrics?.cumulativeLayoutShift}
                />
              )}

              {metrics.speedIndex !== undefined && (
                <MetricItem
                  label="Speed Index"
                  value={metrics.speedIndex.toFixed(1)}
                  unit="s"
                  score={metrics.speedIndex < 3.4 ? 90 : metrics.speedIndex < 5.8 ? 50 : 0}
                  comparisonValue={mainCompanyMetrics?.speedIndex}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PerformanceSection;
