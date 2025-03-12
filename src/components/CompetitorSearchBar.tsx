
import React from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import ApiKeyAlert from "@/components/ApiKeyAlert";

interface CompetitorSearchBarProps {
  companyName: string;
  setCompanyName: (name: string) => void;
  loading: boolean;
  analyzeCompany: () => void;
  apiKeyErrors: string[];
}

const CompetitorSearchBar = ({
  companyName,
  setCompanyName,
  loading,
  analyzeCompany,
  apiKeyErrors,
}: CompetitorSearchBarProps) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      analyzeCompany();
    }
  };

  return (
    <Card className="p-6 bg-white shadow-sm border border-gray-100 rounded-lg hover:shadow-md transition-all duration-300">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow group">
            <Input
              placeholder="Enter company name..."
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-gray-50 hover:bg-white focus:bg-white pl-4 h-12 transition-all duration-200"
            />
          </div>
          <Button
            onClick={analyzeCompany}
            disabled={loading}
            className="bg-[#9b87f5] hover:bg-[#7E69AB] whitespace-nowrap h-12 px-6 transition-all duration-200"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
        </div>

        {apiKeyErrors.length > 0 && (
          <div className="space-y-2">
            {apiKeyErrors.includes("openai") && <ApiKeyAlert serviceName="OpenAI" />}
          </div>
        )}
      </div>
    </Card>
  );
};

export default CompetitorSearchBar;
