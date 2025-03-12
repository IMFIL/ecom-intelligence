
import React from "react";
import AddCompetitorDialog from "@/components/AddCompetitorDialog";

interface CompetitorListHeaderProps {
  newCompetitorName: string;
  setNewCompetitorName: (name: string) => void;
  addCompetitor: () => void;
  addingCompetitor: boolean;
}

const CompetitorListHeader = ({
  newCompetitorName,
  setNewCompetitorName,
  addCompetitor,
  addingCompetitor,
}: CompetitorListHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-semibold">Competitors</h2>
      <AddCompetitorDialog
        newCompetitorName={newCompetitorName}
        setNewCompetitorName={setNewCompetitorName}
        addCompetitor={addCompetitor}
        addingCompetitor={addingCompetitor}
      />
    </div>
  );
};

export default CompetitorListHeader;
