
import React from "react";
import CompetitorCard from "@/components/CompetitorCard";
import { Competitor } from "@/types/competitor";

interface CompetitorListProps {
  competitors: Competitor[];
  mainCompany?: Competitor | null;
}

const CompetitorList = ({
  competitors,
  mainCompany,
}: CompetitorListProps) => {
  return (
    <div className="grid gap-6">
      {competitors?.map((competitor: Competitor, index: number) => (
        <CompetitorCard 
          key={`${competitor.name}-${index}`} 
          competitor={competitor} 
          mainCompany={mainCompany}
        />
      ))}
    </div>
  );
};

export default CompetitorList;
