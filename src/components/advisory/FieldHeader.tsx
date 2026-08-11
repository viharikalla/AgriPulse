import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui';
import { MapPin, Printer, Sprout, ArrowLeft, Clock } from 'lucide-react';
import { ROUTES } from '../../config/routes';

export interface FieldHeaderProps {
  cropName: string;
  location: string;
  date: string;
  advisoryId: string;
}

export const FieldHeader: React.FC<FieldHeaderProps> = ({
  cropName,
  location,
  date,
  advisoryId,
}) => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
      <div className="flex items-start sm:items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
          className="rounded-full shrink-0"
        >
          Back
        </Button>
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-[#B9E48C] mb-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {location}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-[#F5F2E8]/60">
              <Clock className="w-3.5 h-3.5 text-[#A8D8E8]" />
              {date}
            </span>
          </div>
          <h1 className="font-serif italic text-2xl sm:text-4xl text-[#F5F2E8]">
            {cropName} Field Advisory <span className="not-italic font-mono text-xs text-[#F5F2E8]/40 ml-2">#{advisoryId}</span>
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.print()}
          leftIcon={<Printer className="w-4 h-4" />}
          className="rounded-full border-white/15 text-xs text-[#F5F2E8]"
        >
          Print Report
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={() => navigate(ROUTES.ANALYZE)}
          leftIcon={<Sprout className="w-4 h-4" />}
          className="rounded-full bg-[#B9E48C] text-[#07130F] font-semibold text-xs border-0 shadow-glow-living"
        >
          New Assessment
        </Button>
      </div>
    </div>
  );
};
