import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import CompetitorDiscovery from "@/components/CompetitorDiscovery";
import CompetitorSearch from "@/components/CompetitorSearch";
import { useCompetitorAnalysis } from "@/hooks/useCompetitorAnalysis";
import { Competitor } from "@/types/competitor";

const CompetitorAnalysis = () => {
  const {
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
  } = useCompetitorAnalysis();

  // Add state for the search tab to preserve data between tab switches
  const [searchedCompetitor, setSearchedCompetitor] = useState<Competitor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);

  return (
    <div className="p-4 md:p-6 max-w-[1200px] mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">Competitor Analysis</h1>

        <Tabs defaultValue="discovery" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="discovery">Competitor Discovery</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
          </TabsList>

          <TabsContent value="discovery" className="w-full">
            <CompetitorDiscovery
              companyName={companyName}
              setCompanyName={setCompanyName}
              loading={loading}
              loadingMainCompany={loadingMainCompany}
              loadingCompetitors={loadingCompetitors}
              addingCompetitor={addingCompetitor}
              newCompetitorName={newCompetitorName}
              setNewCompetitorName={setNewCompetitorName}
              companyData={companyData}
              apiKeyErrors={apiKeyErrors}
              analyzeCompany={analyzeCompany}
              addCompetitor={addCompetitor}
            />
          </TabsContent>

          <TabsContent value="search">
            <CompetitorSearch
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              loading={searchLoading}
              setLoading={setSearchLoading}
              competitor={searchedCompetitor}
              setCompetitor={setSearchedCompetitor}
              apiKeyErrors={apiKeyErrors}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CompetitorAnalysis;
