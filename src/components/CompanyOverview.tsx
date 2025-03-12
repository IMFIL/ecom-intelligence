
import React from 'react';
import { Card } from '@/components/ui/card';

interface CompanyOverviewProps {
  data: {
    description: string;
  };
}

const CompanyOverview = ({ data }: CompanyOverviewProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Company Overview</h2>
      <p className="text-gray-600">{data.description}</p>
    </Card>
  );
};

export default CompanyOverview;
