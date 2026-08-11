import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../config/routes';
import { EmptyState } from '../components/ui';
import { Compass } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-md mx-auto my-16 animate-in fade-in duration-300">
      <EmptyState
        icon={<Compass className="w-6 h-6 text-[#B9E48C]" />}
        title="404 — Route Not Found"
        description="The field decision route or agricultural parameters you requested do not exist."
        actionLabel="Return to Dashboard"
        onAction={() => navigate(ROUTES.HOME)}
      />
    </div>
  );
};
