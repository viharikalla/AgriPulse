import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Cpu, Camera } from 'lucide-react';

export interface DiagnosisCardProps {
  conditionName?: string;
  scientificName?: string;
  confidence?: string;
  confidenceScore?: number;
  severity?: string;
  symptoms?: string[];
  photoUrl?: string;
  className?: string;
}

export const DiagnosisCard: React.FC<DiagnosisCardProps> = ({
  conditionName = 'Early Blight',
  scientificName = 'Alternaria solani',
  confidence = 'High',
  confidenceScore = 0.93,
  severity = 'Moderate',
  symptoms = [
    'Brown circular lesions',
    'Yellowing around affected areas',
    'Older leaves showing more visible damage',
  ],
  photoUrl = 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80',
  className,
}) => {
  return (
    <Card glassLevel="medium" className={`border-l-4 border-l-[#F28B78] ${className || ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#F28B78]/20 text-[#F28B78] flex items-center justify-center font-mono font-bold text-xs border border-[#F28B78]/30">
              1
            </span>
            <CardTitle className="text-base text-[#F5F2E8]">1. WHAT'S WRONG?</CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="danger" size="sm">
              {severity} Severity
            </Badge>
            <Badge variant="success" size="sm" icon={<Cpu className="w-3 h-3 text-[#B9E48C]" />}>
              {confidence} confidence ({Math.round(confidenceScore * 100)}%)
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Visual Evidence Photo Connection */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Annotated Photo Thumbnail */}
          <div className="md:col-span-5 relative aspect-video sm:aspect-square rounded-2xl overflow-hidden glass-deep border border-white/20 shadow-lg group">
            <img
              src={photoUrl}
              alt="Crop Leaf Evidence"
              className="w-full h-full object-cover opacity-90 transition-transform duration-500 group-hover:scale-105"
            />
            {/* Lesion Detection Annotation Box */}
            <div className="absolute top-1/3 left-1/3 w-20 h-20 border-2 border-dashed border-[#F28B78] bg-[#F28B78]/15 rounded-lg flex items-start justify-end p-1 shadow-[0_0_12px_#F28B78]">
              <span className="text-[9px] font-mono font-bold bg-[#F28B78] text-black px-1 rounded">
                LESION #01
              </span>
            </div>

            <div className="absolute bottom-2 left-2 right-2 p-2 rounded-xl glass-deep text-[10px] font-mono text-[#F5F2E8]/80 flex items-center justify-between border border-white/10">
              <span className="flex items-center gap-1 text-[#B9E48C]">
                <Camera className="w-3 h-3" /> EVIDENCE PHOTO
              </span>
              <span>1080 &times; 1080</span>
            </div>
          </div>

          {/* Diagnostic Evidence Details */}
          <div className="md:col-span-7 space-y-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#F28B78] block mb-0.5">
                PRIMARY DETECTED CONDITION
              </span>
              <h3 className="font-heading font-extrabold text-2xl text-[#F28B78]">
                {conditionName}
              </h3>
              <p className="text-xs font-mono text-[#F5F2E8]/60 italic mt-0.5">
                {scientificName}
              </p>
            </div>

            <div className="glass-light p-4 rounded-xl border-white/10 space-y-2">
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B9E48C]">
                Visual Symptoms Identified
              </p>
              <ul className="space-y-2">
                {symptoms.map((symptom, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-xs text-[#F5F2E8]/90">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F28B78] mt-1.5 shrink-0" />
                    <span>{symptom}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
