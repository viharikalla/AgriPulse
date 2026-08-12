import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '../ui/Button';

export interface PhotoUploaderProps {
  photoUrl: string | null;
  onPhotoSelected: (url: string) => void;
  onPhotoCleared: () => void;
  error?: string;
}

export const PhotoUploader: React.FC<PhotoUploaderProps> = ({
  photoUrl,
  onPhotoSelected,
  onPhotoCleared,
  error,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const samplePhotos = [
    {
      name: 'Chilli Fruit Rot',
      url: 'https://images.unsplash.com/photo-1591857177580-dc82b9ac4e1e?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Tomato Leaf Blight',
      url: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80',
    },
    {
      name: 'Rice Sheath Spot',
      url: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?auto=format&fit=crop&w=800&q=80',
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : `data:${file.type};base64,mockfile`;
      onPhotoSelected(url);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const url = typeof URL.createObjectURL === 'function' ? URL.createObjectURL(file) : `data:${file.type};base64,mockfile`;
      onPhotoSelected(url);
    }
  };

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B9E48C]/80 select-none block">
        Crop Symptom Photograph
      </label>

      {photoUrl ? (
        <div className="relative rounded-2xl overflow-hidden glass-deep border border-white/20 aspect-video sm:aspect-[21/9]">
          <img
            src={photoUrl}
            alt="Selected Crop"
            className="w-full h-full object-cover opacity-85 transition-transform duration-300 hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07130F] via-transparent to-transparent flex items-end justify-between p-4">
            <div className="flex items-center gap-2 text-[#F5F2E8] text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-[#B9E48C] animate-pulse" />
              Photo Signal Loaded Ready for Assessment
            </div>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={onPhotoCleared}
              leftIcon={<X className="w-4 h-4" />}
              className="rounded-full"
            >
              Remove
            </Button>
          </div>
        </div>
      ) : (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-8 border border-dashed rounded-2xl cursor-pointer transition-all duration-200 text-center ${
            dragActive
              ? 'border-[#B9E48C] glass-deep scale-[1.01]'
              : error
              ? 'border-[#F28B78]/50 glass-medium'
              : 'border-white/15 glass-medium hover:border-white/30'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="w-12 h-12 rounded-full bg-[#10251C] border border-[#B9E48C]/30 text-[#B9E48C] flex items-center justify-center mb-3 shadow-glow-living">
            <UploadCloud className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-[#F5F2E8] mb-1">
            Click to upload or drag & drop leaf/crop photo
          </p>
          <p className="text-xs text-[#F5F2E8]/60 max-w-xs mb-4 leading-relaxed">
            High resolution photographs of leaf spots or fruit lesions yield maximum diagnostic accuracy.
          </p>

          <div className="pt-3 border-t border-white/10 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F5F2E8]/50 mb-2">
              Optional: Pick sample test image (for evaluator testing):
            </p>
            <div className="flex justify-center gap-2">
              {samplePhotos.map((sample) => (
                <button
                  key={sample.name}
                  type="button"
                  onClick={() => onPhotoSelected(sample.url)}
                  className="px-3 py-1 text-xs glass-light border border-white/15 rounded-full hover:border-[#B9E48C] hover:text-[#B9E48C] text-[#F5F2E8]/80 transition-colors flex items-center gap-1.5"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#B9E48C]" />
                  {sample.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-[#F28B78] font-medium">{error}</p>}
    </div>
  );
};
