
import React from 'react';
import { Card } from '@/components/ui/card';
import { Check } from 'lucide-react';

interface RecommendationListProps {
  recommendations: string[];
}

const RecommendationList: React.FC<RecommendationListProps> = ({ recommendations }) => {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Strategic Recommendations</h3>
      
      {recommendations.length > 0 ? (
        <ul className="space-y-3">
          {recommendations.map((recommendation, index) => (
            <li key={index} className="flex">
              <Check className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
              <span className="text-gray-700">{recommendation}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-500">No recommendations available</p>
      )}
    </Card>
  );
};

export default RecommendationList;
