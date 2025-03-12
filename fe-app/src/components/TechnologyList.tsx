
import React from 'react';
import { Card } from '@/components/ui/card';

interface Technology {
  name: string;
  category: string;
}

interface TechnologyListProps {
  technologies: Technology[];
}

const TechnologyList: React.FC<TechnologyListProps> = ({ technologies }) => {
  // Group technologies by category
  const groupedTechnologies = technologies.reduce((acc, tech) => {
    if (!acc[tech.category]) {
      acc[tech.category] = [];
    }
    acc[tech.category].push(tech);
    return acc;
  }, {} as Record<string, Technology[]>);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Technologies Used</h3>
      
      {Object.entries(groupedTechnologies).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedTechnologies).map(([category, techs]) => (
            <div key={category}>
              <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
              <div className="flex flex-wrap gap-2">
                {techs.map((tech, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F1F0FB] text-[#9b87f5]"
                  >
                    {tech.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No technology data available</p>
      )}
    </Card>
  );
};

export default TechnologyList;
