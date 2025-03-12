
import React, { useState, useEffect } from "react";
import { CompanyData, Competitor } from "@/types/competitor";
import CompetitorSearchBar from "@/components/CompetitorSearchBar";
import CompanyOverview from "@/components/CompanyOverview";
import LoadingIndicator from "@/components/LoadingIndicator";
import CompetitorListHeader from "@/components/CompetitorListHeader";
import CompetitorList from "@/components/CompetitorList";
import CompetitorComparison from "./CompetitorComparison";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import CompanyOverviewSkeleton from "./CompanyOverviewSkeleton";

interface CompetitorDiscoveryProps {
  companyName: string;
  setCompanyName: (name: string) => void;
  loading: boolean;
  loadingMainCompany: boolean;
  loadingCompetitors: boolean;
  addingCompetitor: boolean;
  newCompetitorName: string;
  setNewCompetitorName: (name: string) => void;
  companyData: CompanyData | null;
  apiKeyErrors: string[];
  analyzeCompany: () => void;
  addCompetitor: () => void;
}

const CompetitorDiscovery = ({
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
}: CompetitorDiscoveryProps) => {
  const [mainCompany, setMainCompany] = useState<Competitor | null>(null);
  const [contentReady, setContentReady] = useState(false);

  useEffect(() => {
    if (!companyData) return;

    // Set the main company from companyData
    if (companyData.mainCompany) {
      setMainCompany(companyData.mainCompany);
    }
  }, [companyData]);

  // Only mark content as ready when both main company AND competitors are loaded
  useEffect(() => {
    if (companyData?.mainCompany && !loadingMainCompany && !loadingCompetitors) {
      // Give a small delay to ensure all components have loaded their data
      const timer = setTimeout(() => {
        setContentReady(true);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [companyData?.mainCompany, loadingMainCompany, loadingCompetitors]);

  // Reset content ready state when loading a new company
  useEffect(() => {
    if (loadingMainCompany || loadingCompetitors) {
      setContentReady(false);
    }
  }, [loadingMainCompany, loadingCompetitors]);

  return (
    <div>
      <CompetitorSearchBar
        companyName={companyName}
        setCompanyName={setCompanyName}
        loading={loading}
        analyzeCompany={analyzeCompany}
        apiKeyErrors={apiKeyErrors}
      />

      {/* Show skeleton loaders when loading main company or competitors, or when content is not fully ready */}
      {(loadingMainCompany ||
        loadingCompetitors ||
        (companyData?.mainCompany && !contentReady)) && (
        <div className="space-y-6 mt-6">
          {/* Company Overview skeleton */}
          <CompanyOverviewSkeleton />

          {/* Market Analysis skeleton */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Market Analysis</h2>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-[250px] w-full mt-4" />
          </Card>

          {/* Competitors skeleton */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Competitors</h2>
              <Skeleton className="h-10 w-64" />
            </div>
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="p-6">
                  <div className="flex items-center space-x-4">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Show data once content is ready */}
      {contentReady && companyData?.mainCompany && (
        <div className="space-y-6 mt-6">
          {/* Company Overview section */}
          <CompanyOverview data={companyData} />

          {/* Always show Market Analysis when main company is available */}
          <CompetitorComparison
            company={{
              ...companyData.mainCompany,
            }}
          />

          {/* Competitor section */}
          <CompetitorListHeader
            newCompetitorName={newCompetitorName}
            setNewCompetitorName={setNewCompetitorName}
            addCompetitor={addCompetitor}
            addingCompetitor={addingCompetitor}
          />

          {/* Show competitors as they load */}
          {companyData.competitors.length > 0 && (
            <CompetitorList competitors={companyData.competitors} mainCompany={mainCompany} />
          )}
        </div>
      )}
    </div>
  );
};

export default CompetitorDiscovery;
