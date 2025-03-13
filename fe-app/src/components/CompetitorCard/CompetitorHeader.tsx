import React from "react";
import { Award, Activity, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LayoutGrid, Home, ShoppingCart, CreditCard } from "lucide-react";
import { API_BASE_URL } from "@/config";
import AnalysisResults from "./AnalysisResults";

interface CompetitorHeaderProps {
  name: string;
  description: string;
  website?: string;
}

const CompetitorHeader = ({ name, description, website }: CompetitorHeaderProps) => {
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [screenshotPath, setScreenshotPath] = React.useState<string | null>(null);

  const checkExistingScreenshots = async (pageGroup: string) => {
    if (!website) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/check-screenshots?url=${encodeURIComponent(
          website
        )}&page_group=${pageGroup}`
      );

      if (!response.ok) {
        console.error("Failed to check screenshots");
        return;
      }

      const data = await response.json();
      if (data.exists) {
        setScreenshotPath(data.path);
      }
    } catch (error) {
      console.error("Error checking screenshots:", error);
    }
  };

  // Check for existing screenshots when component mounts
  React.useEffect(() => {
    checkExistingScreenshots("PDP");
  }, [website]);

  const startAnalysis = async (pageGroup: string) => {
    try {
      setIsAnalyzing(true);
      setScreenshotPath(null);
      console.log(`Starting analysis: ${pageGroup} for ${name}`);

      if (!website) {
        console.error("No website URL provided for analysis");
        return;
      }

      // Create an AbortController with a 10-minute timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10 * 60 * 1000); // 10 minutes in milliseconds

      const response = await fetch(`${API_BASE_URL}/analyze-pages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: website,
          page_group: pageGroup,
          company_name: name,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId); // Clear the timeout if request completes

      if (!response.ok) {
        const error = await response.text();
        console.error("Analysis request failed:", error);
        return;
      }

      const result = await response.json();
      console.log("Analysis completed:", result);
      setScreenshotPath(result);
    } catch (error) {
      console.error("Error starting analysis:", error);
      // TODO: Add error handling UI feedback
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Award className="w-5 h-5 mr-2 text-[#9b87f5]" />
          {name}
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="whitespace-nowrap border-[#9b87f5] text-[#9b87f5] hover:bg-[#9b87f5] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isAnalyzing || !!screenshotPath}
            >
              <Activity className={`w-4 h-4 mr-2 ${isAnalyzing ? "animate-spin" : ""}`} />
              {isAnalyzing ? "Analyzing..." : screenshotPath ? "PDP Analysis Complete" : "Analyze"}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuItem
              onClick={() => startAnalysis("PDP")}
              disabled={isAnalyzing || !!screenshotPath}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LayoutGrid className="w-4 h-4 mr-2" /> PDP
            </DropdownMenuItem>
            {/* <DropdownMenuItem onClick={() => startAnalysis("PLP")}>
              <LayoutGrid className="w-4 h-4 mr-2" /> PLP
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => startAnalysis("Homepage")}>
              <Home className="w-4 h-4 mr-2" /> Homepage
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => startAnalysis("Cart")}>
              <ShoppingCart className="w-4 h-4 mr-2" /> Cart
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => startAnalysis("Checkout")}>
              <CreditCard className="w-4 h-4 mr-2" /> Checkout
            </DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="text-gray-600 leading-relaxed text-sm">{description}</p>

      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#9b87f5] hover:underline flex items-center mt-2 text-sm"
        >
          <Globe className="w-3.5 h-3.5 mr-1" />
          {website}
        </a>
      )}

      <AnalysisResults screenshotPath={screenshotPath} />
    </div>
  );
};

export default CompetitorHeader;
