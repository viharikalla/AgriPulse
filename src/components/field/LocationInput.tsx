import React from 'react';
import { Input } from '../ui/Input';
import { MapPin, Navigation } from 'lucide-react';
import { Button } from '../ui/Button';

export interface LocationInputProps {
  value: string;
  onChange: (location: string) => void;
  error?: string;
}

export const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  error,
}) => {
  const handleDetectLocation = () => {
    onChange('Guntur District, Andhra Pradesh');
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-2 items-end">
        <div className="flex-1">
          <Input
            label="Field Location / District Coordinates"
            placeholder="e.g. Guntur District, AP or Lat/Lng"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4 text-[#B9E48C]" />}
            error={error}
            helperText="Used to retrieve hourly micro-weather window forecasts"
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="md"
          onClick={handleDetectLocation}
          title="Detect GPS Coordinates"
          leftIcon={<Navigation className="w-4 h-4 text-[#B9E48C]" />}
          className="shrink-0 mb-[1px] rounded-xl border-white/15"
        >
          Detect GPS
        </Button>
      </div>
    </div>
  );
};
