import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Card } from "@/components/ui/card";
import CompetitorCard from "@/components/CompetitorCard";
import { Competitor } from "@/types/competitor";
import CompetitorSearchBar from "./CompetitorSearchBar";
import { fetchCompanyWithEnhancements } from "@/services/competitor-service";
import { Skeleton } from "@/components/ui/skeleton";
import CompanyOverviewSkeleton from "./CompanyOverviewSkeleton";

interface CompetitorSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  competitor: Competitor | null;
  setCompetitor: (competitor: Competitor | null) => void;
  apiKeyErrors: string[];
}

const CompetitorSearch = ({
  searchTerm,
  setSearchTerm,
  loading,
  setLoading,
  competitor,
  setCompetitor,
  apiKeyErrors,
}: CompetitorSearchProps) => {
  const { toast } = useToast();
  const [searchInitiated, setSearchInitiated] = useState(false);

  const handleSearch = async () => {
    if (!searchTerm) {
      toast({
        title: "Please enter a company name",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    setSearchInitiated(true);

    try {
      // First, fetch the basic competitor data
      const { fetchSingleCompanyInsight } = await import("@/services/competitor-service");
      const competitorData = await fetchSingleCompanyInsight(searchTerm);

      // Show basic competitor data before enhancement
      setCompetitor(competitorData);

      // Then enhance it with website technologies and traffic
      const enhancedCompetitor = await fetchCompanyWithEnhancements(competitorData);
      setCompetitor(enhancedCompetitor);
    } catch (error) {
      console.error("Error searching for company:", error);

      const errorMessage = (error as Error).message;
      toast({
        title: "Error searching for company",
        description: errorMessage || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <CompetitorSearchBar
        companyName={searchTerm}
        setCompanyName={setSearchTerm}
        loading={loading}
        analyzeCompany={handleSearch}
        apiKeyErrors={apiKeyErrors}
      />

      {loading && !competitor && (
        <div className="space-y-6 mt-6">
          {/* Company Overview skeleton */}
          <CompanyOverviewSkeleton />

          {/* Skeleton for company details */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Company Details</h2>
            <Card className="p-6">
              <Skeleton className="h-[400px] w-full" />
            </Card>
          </div>
        </div>
      )}

      {(competitor || (searchInitiated && !loading && competitor)) && (
        <div className="space-y-6 mt-6">
          {/* Display a simplified company overview */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Overview</h2>
            <p className="text-gray-600">{competitor?.description}</p>
          </Card>

          {/* Display the full competitor card with all sections */}
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-4">Company Details</h2>
            <CompetitorCard competitor={competitor!} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CompetitorSearch;
