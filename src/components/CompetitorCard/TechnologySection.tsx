
import React, { useState } from "react";
import { Code2, Zap } from "lucide-react";
import { Technology } from "@/types/competitor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface TechnologySectionProps {
  technologies?: Technology[];
  mainCompanyTechnologies?: Technology[];
}

const TechnologySection = ({ technologies, mainCompanyTechnologies }: TechnologySectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!technologies || technologies.length === 0) {
    return null;
  }

  const findMatchingTech = (tech: Technology): boolean => {
    if (!mainCompanyTechnologies) return false;
    return mainCompanyTechnologies.some(
      (mainTech) => mainTech.name.toLowerCase() === tech.name.toLowerCase()
    );
  };

  const uniqueCategories = Array.from(
    new Set(technologies.map((tech) => tech.category))
  ).sort();

  // Limit displayed categories when collapsed
  const displayedCategories = isExpanded ? uniqueCategories : uniqueCategories.slice(0, 2);

  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
        <Code2 className="w-4 h-4 mr-2 text-[#9b87f5]" />
        Technology Stack
      </h4>

      <div className="space-y-3">
        {displayedCategories.map((category) => (
          <div key={category} className="bg-gray-50 p-3 rounded">
            <div className="text-xs text-gray-500 mb-2">{category}</div>
            <div className="flex flex-wrap gap-2">
              {technologies
                .filter((tech) => tech.category === category)
                .map((tech, index) => {
                  const isMatch = findMatchingTech(tech);
                  return (
                    <Badge
                      key={index}
                      variant={isMatch ? "default" : "outline"}
                      className={`flex items-center gap-1 ${
                        isMatch ? "bg-purple-100 text-purple-800 hover:bg-purple-200" : ""
                      }`}
                    >
                      {isMatch && <Zap className="h-3 w-3" />}
                      {tech.name}
                    </Badge>
                  );
                })}
            </div>
          </div>
        ))}
        
        {!isExpanded && uniqueCategories.length > 2 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 w-full text-gray-500"
            onClick={() => setIsExpanded(true)}
          >
            Show {uniqueCategories.length - 2} more categories
          </Button>
        )}
        
        {isExpanded && uniqueCategories.length > 2 && (
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2 w-full text-gray-500"
            onClick={() => setIsExpanded(false)}
          >
            Show less
          </Button>
        )}
      </div>
    </div>
  );
};

export default TechnologySection;
