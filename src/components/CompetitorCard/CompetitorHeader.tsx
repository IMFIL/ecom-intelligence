
import React from 'react';
import { Award, Activity, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LayoutGrid, Home, ShoppingCart, CreditCard } from 'lucide-react';

interface CompetitorHeaderProps {
  name: string;
  description: string;
  website?: string;
}

const CompetitorHeader = ({ name, description, website }: CompetitorHeaderProps) => {
  const startAnalysis = (type: string) => {
    console.log(`Analysis type selected: ${type} for ${name}`);
  };

  return (
    <div className="space-y-2 flex-1">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center">
          <Award className="w-5 h-5 mr-2 text-[#9b87f5]" />
          {name}
        </h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="whitespace-nowrap border-[#9b87f5] text-[#9b87f5] hover:bg-[#9b87f5] hover:text-white"
            >
              <Activity className="w-4 h-4 mr-2" />
              Analyze
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-white">
            <DropdownMenuItem onClick={() => startAnalysis("PDP")}>
              <LayoutGrid className="w-4 h-4 mr-2" /> PDP
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => startAnalysis("PLP")}>
              <LayoutGrid className="w-4 h-4 mr-2" /> PLP
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => startAnalysis("Homepage")}>
              <Home className="w-4 h-4 mr-2" /> Homepage
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => startAnalysis("Cart")}>
              <ShoppingCart className="w-4 h-4 mr-2" /> Cart
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => startAnalysis("Checkout")}>
              <CreditCard className="w-4 h-4 mr-2" /> Checkout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="text-gray-600 leading-relaxed text-sm">{description}</p>
      
      {website && (
        <a 
          href={website} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-[#9b87f5] hover:underline flex items-center mt-2 text-sm"
        >
          <Globe className="w-3.5 h-3.5 mr-1" />
          {website}
        </a>
      )}
    </div>
  );
};

export default CompetitorHeader;
