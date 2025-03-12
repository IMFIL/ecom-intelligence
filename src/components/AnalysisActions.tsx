
import React from "react";
import { Button } from "@/components/ui/button";
import { AnalysisType } from "@/types/competitor";
import { LayoutGrid, ShoppingCart, Home, CheckCircle } from "lucide-react";

interface AnalysisActionsProps {
  companyName: string;
}

const AnalysisActions: React.FC<AnalysisActionsProps> = ({ companyName }) => {
  const startAnalysis = (type: AnalysisType) => {
    console.log(`Analysis type selected: ${type} for ${companyName}`);
    // Additional analysis logic would go here
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-sm">
      <h3 className="text-lg font-medium mb-4">Analysis Actions</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center p-4 h-auto"
          onClick={() => startAnalysis("Homepage")}
        >
          <Home className="h-5 w-5 mb-2" />
          <span>Homepage</span>
        </Button>
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center p-4 h-auto"
          onClick={() => startAnalysis("PLP")}
        >
          <LayoutGrid className="h-5 w-5 mb-2" />
          <span>Product List</span>
        </Button>
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center p-4 h-auto"
          onClick={() => startAnalysis("PDP")}
        >
          <CheckCircle className="h-5 w-5 mb-2" />
          <span>Product Detail</span>
        </Button>
        <Button 
          variant="outline" 
          className="flex flex-col items-center justify-center p-4 h-auto"
          onClick={() => startAnalysis("Cart")}
        >
          <ShoppingCart className="h-5 w-5 mb-2" />
          <span>Cart & Checkout</span>
        </Button>
      </div>
    </div>
  );
};

export default AnalysisActions;
