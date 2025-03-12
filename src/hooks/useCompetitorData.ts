import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { CompanyData, Competitor } from "@/types/competitor";
import {
  analyzeCompanyAndCompetitors,
  fetchSingleCompanyInsight,
  fetchCompanyWithEnhancements,
} from "@/services/competitor-service";

export function useCompetitorData() {
  const [loading, setLoading] = useState(false);
  const [loadingMainCompany, setLoadingMainCompany] = useState(false);
  const [loadingCompetitors, setLoadingCompetitors] = useState(false);
  const [addingCompetitor, setAddingCompetitor] = useState(false);
  const [apiKeyErrors, setApiKeyErrors] = useState<string[]>([]);
  const { toast } = useToast();

  const fetchCompanyAnalysis = async (companyName: string): Promise<CompanyData | null> => {
    if (!companyName) {
      toast({
        title: "Please enter a company name",
        variant: "destructive",
      });
      return null;
    }

    setLoading(true);
    setLoadingMainCompany(true);
    setLoadingCompetitors(true);
    setApiKeyErrors([]);

    try {
      // Start both queries in parallel using Promise.all
      const [mainCompanyPromise, competitorsPromise] = [
        // First fetch just the main company data
        fetchSingleCompanyInsight(companyName).then(fetchCompanyWithEnhancements),

        // Start competitors analysis in parallel
        analyzeCompanyAndCompetitors(companyName),
      ];

      // Wait for the main company data to be ready
      const enhancedCompanyData = await mainCompanyPromise;

      // Set loading for main company to false when its data is ready
      setLoadingMainCompany(false);

      // Create initial company data with just the main company
      const initialCompanyData: CompanyData = {
        description: enhancedCompanyData.description || `Analysis of ${companyName}`,
        mainCompany: enhancedCompanyData,
        competitors: [],
      };

      // Wait for the competitors data to be ready
      const competitorsData = await competitorsPromise;

      // Combine main company with competitors
      const fullData: CompanyData = {
        description: competitorsData.description || initialCompanyData.description,
        mainCompany: initialCompanyData.mainCompany,
        competitors: competitorsData.competitors || [],
      };

      return fullData;
    } catch (error) {
      console.error("Error in competitor analysis:", error);

      const errorMessage = (error as Error).message;
      if (errorMessage.includes("API key not configured")) {
        setApiKeyErrors((prev) => [...prev, "openai"]);

        // Mock data with OpenAI-style structure
        return {
          description: `Analysis of ${companyName}`,
          mainCompany: {
            name: companyName,
            description: `Analysis of ${companyName}`,
            strengths: ["Strong market position", "Innovative products"],
            weaknesses: ["Limited international presence", "Higher prices than some competitors"],
            website: `https://www.${companyName.toLowerCase().replace(/\s+/g, "")}.com`,
            revenue: "$50M - $100M",
            threats: ["Emerging competitors", "Changing regulations"],
          },
          competitors: [],
        };
      } else {
        toast({
          title: "Error analyzing company",
          description: errorMessage || "Please try again later",
          variant: "destructive",
        });
      }
      return null;
    } finally {
      setLoading(false);
      setLoadingMainCompany(false);
      setLoadingCompetitors(false);
    }
  };

  const fetchSingleCompetitorData = async (
    companyName: string,
    competitorName: string
  ): Promise<Competitor | null> => {
    if (!competitorName) {
      toast({
        title: "Please enter a competitor name",
        variant: "destructive",
      });
      return null;
    }

    setAddingCompetitor(true);

    try {
      const competitorData = await fetchSingleCompanyInsight(competitorName);
      const enhancedCompetitor = await fetchCompanyWithEnhancements(competitorData);
      return enhancedCompetitor;
    } catch (error) {
      console.error("Error adding competitor:", error);

      const errorMessage = (error as Error).message;
      toast({
        title: "Error adding competitor",
        description: errorMessage || "Please try again later",
        variant: "destructive",
      });
      return null;
    } finally {
      setAddingCompetitor(false);
    }
  };

  return {
    loading,
    loadingMainCompany,
    loadingCompetitors,
    addingCompetitor,
    apiKeyErrors,
    fetchCompanyAnalysis,
    fetchSingleCompetitorData,
  };
}
