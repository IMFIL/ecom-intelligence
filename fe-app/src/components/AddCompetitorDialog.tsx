
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

interface AddCompetitorDialogProps {
  newCompetitorName: string;
  setNewCompetitorName: (name: string) => void;
  addCompetitor: () => void;
  addingCompetitor: boolean;
}

const AddCompetitorDialog = ({
  newCompetitorName,
  setNewCompetitorName,
  addCompetitor,
  addingCompetitor,
}: AddCompetitorDialogProps) => {
  const handleAddCompetitorKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      addCompetitor();
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#9b87f5] hover:bg-[#7E69AB]">
          <Plus className="w-4 h-4 mr-2" />
          Add Competitor
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a Competitor</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder="Enter competitor name..."
            value={newCompetitorName}
            onChange={(e) => setNewCompetitorName(e.target.value)}
            onKeyDown={handleAddCompetitorKeyDown}
            className="mb-4"
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button 
            onClick={addCompetitor} 
            disabled={addingCompetitor || !newCompetitorName}
            className="bg-[#9b87f5] hover:bg-[#7E69AB]"
          >
            {addingCompetitor ? 'Adding...' : 'Add Competitor'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddCompetitorDialog;
