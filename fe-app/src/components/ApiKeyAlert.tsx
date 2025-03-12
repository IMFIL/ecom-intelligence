
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface ApiKeyAlertProps {
  serviceName: string;
}

const ApiKeyAlert: React.FC<ApiKeyAlertProps> = ({ serviceName }) => {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Missing API Key</AlertTitle>
      <AlertDescription>
        Please add your {serviceName} API key in the services/{serviceName.toLowerCase()}-service.ts file to use this feature.
      </AlertDescription>
    </Alert>
  );
};

export default ApiKeyAlert;
