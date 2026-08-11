import React from 'react';
import { SUPPORTED_CROPS } from '../../config/crops';
import { SupportedCropName } from '../../types';
import { Select } from '../ui/Select';

export interface CropSelectorProps {
  selectedCrop: SupportedCropName;
  onCropChange: (crop: SupportedCropName) => void;
  error?: string;
}

export const CropSelector: React.FC<CropSelectorProps> = ({
  selectedCrop,
  onCropChange,
  error,
}) => {
  return (
    <div className="space-y-3">
      <Select
        label="Target Field Crop"
        value={selectedCrop}
        onChange={(e) => onCropChange(e.target.value as SupportedCropName)}
        error={error}
        helperText="Select the crop type shown in your field photograph"
        options={SUPPORTED_CROPS.map((c) => ({
          value: c.name,
          label: `${c.name} (${c.scientificName})`,
          icon: c.icon,
        }))}
      />

      {/* Grid selector buttons for fast touch interaction */}
      <div className="grid grid-cols-5 gap-2 pt-1">
        {SUPPORTED_CROPS.map((crop) => {
          const isSelected = selectedCrop === crop.name;
          return (
            <button
              key={crop.id}
              type="button"
              onClick={() => onCropChange(crop.name)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border text-center transition-all duration-200 ${
                isSelected
                  ? 'border-[#B9E48C] glass-deep text-[#B9E48C] shadow-glow-living font-semibold ring-1 ring-[#B9E48C]/40'
                  : 'border-white/10 glass-light text-[#F5F2E8]/70 hover:border-white/20 hover:text-[#F5F2E8]'
              }`}
            >
              <span className="text-2xl mb-1">{crop.icon}</span>
              <span className="text-xs truncate w-full">{crop.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
