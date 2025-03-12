import { useState, useEffect } from "react";
import { CompanyData } from "@/types/competitor";
import { useCompetitorData } from "./useCompetitorData";

export function useCompetitorAnalysis() {
  const [companyName, setCompanyName] = useState("");
  const [newCompetitorName, setNewCompetitorName] = useState("");
  const [companyData, setCompanyData] = useState<CompanyData | null>(null);

  const {
    loading,
    loadingMainCompany,
    loadingCompetitors,
    addingCompetitor,
    apiKeyErrors,
    fetchCompanyAnalysis,
    fetchSingleCompetitorData,
  } = useCompetitorData();

  // Update global competitors list whenever companyData changes
  useEffect(() => {
    if (companyData?.competitors) {
      // Make competitors globally available for the CompetitorComparison component
      (window as any).competitors = companyData.competitors.map((competitor) => ({
        ...competitor,
      }));
    }
  }, [companyData]);

  const analyzeCompany = async () => {
    const data = await fetchCompanyAnalysis(companyName);
    if (data) {
      setCompanyData(data);
    }
  };

  const addCompetitor = async () => {
    if (!companyData) return;

    const competitorData = await fetchSingleCompetitorData(companyName, newCompetitorName);

    if (competitorData && companyData) {
      // Add speedIndex fallback if it's not available
      const enhancedCompetitor = {
        ...competitorData,
      };

      // Update company data with the new competitor
      const updatedCompanyData = {
        ...companyData,
        competitors: [...companyData.competitors, enhancedCompetitor],
      };

      // Update state with the new data
      setCompanyData(updatedCompanyData);

      // Update the global window.competitors directly to ensure immediate UI update
      if ((window as any).competitors) {
        (window as any).competitors = [...(window as any).competitors, enhancedCompetitor];
      }

      setNewCompetitorName("");
    }
  };

  // Method to update a competitor's speed index when it becomes available
  const updateCompetitorSpeedIndex = (competitorName: string, speedIndex: number) => {
    if (!companyData) return;

    // Update competitors in company data
    const updatedCompetitors = companyData.competitors.map((competitor) =>
      competitor.name === competitorName ? { ...competitor, speedIndex } : competitor
    );

    // Update state
    setCompanyData({
      ...companyData,
      competitors: updatedCompetitors,
    });

    // Also update window.competitors directly for immediate UI update
    if ((window as any).competitors) {
      (window as any).competitors = (window as any).competitors.map((competitor: any) =>
        competitor.name === competitorName ? { ...competitor, speedIndex } : competitor
      );
    }
  };

  return {
    companyName,
    setCompanyName,
    loading,
    loadingMainCompany,
    loadingCompetitors,
    addingCompetitor,
    newCompetitorName,
    setNewCompetitorName,
    companyData,
    apiKeyErrors,
    analyzeCompany,
    addCompetitor,
    updateCompetitorSpeedIndex,
  };
}
