
import React from "react";
import { Check, X, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Competitor } from "@/types/competitor";
import { cn } from "@/lib/utils";

interface StrengthWeaknessProps {
  strengths: string[];
  weaknesses: string[];
  mainCompany?: Competitor | null;
}

const StrengthWeakness = ({ strengths, weaknesses, mainCompany }: StrengthWeaknessProps) => {
  const findCommonItems = (list1: string[], list2: string[]): string[] => {
    return list1.filter(item => 
      list2.some(otherItem => 
        otherItem.toLowerCase().includes(item.toLowerCase()) || 
        item.toLowerCase().includes(otherItem.toLowerCase())
      )
    );
  };

  const commonStrengths = mainCompany ? findCommonItems(strengths, mainCompany.strengths) : [];
  const commonWeaknesses = mainCompany ? findCommonItems(weaknesses, mainCompany.weaknesses) : [];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <div>
        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
          <Check className="w-4 h-4 mr-2 text-green-500" />
          Strengths
        </h4>
        <ul className="space-y-2">
          {strengths.map((strength, index) => (
            <li
              key={index}
              className={cn(
                "text-gray-700 text-sm flex items-start bg-gray-50 p-2 rounded group",
                commonStrengths.includes(strength) ? "border-l-2 border-green-500" : ""
              )}
            >
              <span className="text-green-500 mr-2 font-bold">+</span>
              <div className="flex-1">
                {strength}
                {commonStrengths.includes(strength) && (
                  <Badge variant="outline" className="ml-2 text-xs bg-green-50 border-green-200">
                    <Info className="h-3 w-3 mr-1" />
                    Common with {mainCompany?.name}
                  </Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-2 flex items-center">
          <X className="w-4 h-4 mr-2 text-red-500" />
          Weaknesses
        </h4>
        <ul className="space-y-2">
          {weaknesses.map((weakness, index) => (
            <li
              key={index}
              className={cn(
                "text-gray-700 text-sm flex items-start bg-gray-50 p-2 rounded group",
                commonWeaknesses.includes(weakness) ? "border-l-2 border-red-500" : ""
              )}
            >
              <span className="text-red-500 mr-2 font-bold">-</span>
              <div className="flex-1">
                {weakness}
                {commonWeaknesses.includes(weakness) && (
                  <Badge variant="outline" className="ml-2 text-xs bg-red-50 border-red-200">
                    <Info className="h-3 w-3 mr-1" />
                    Common with {mainCompany?.name}
                  </Badge>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StrengthWeakness;
