import React from 'react';
import { CropAssessment, Crop } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { formatConfidence } from '../../utils/formatters';
import { Cpu } from 'lucide-react';

export interface AssessmentCardProps {
  assessment: CropAssessment;
  crop: Crop;
  className?: string;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({
  assessment,
  crop,
  className,
}) => {
  const confidencePercent = Math.round(assessment.confidenceScore * 100);

  return (
    <Card glassLevel="medium" className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#B9E48C]" />
            <CardTitle className="text-base text-[#F5F2E8]">Visual Diagnosis Assessment</CardTitle>
          </div>
          <Badge variant="success" size="md">
            {formatConfidence(assessment.confidenceScore)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Confidence Meter Bar */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1.5">
            <span className="text-[#F5F2E8]/60">Diagnostic Model Certainty</span>
            <span className="text-[#B9E48C] font-bold">{confidencePercent}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5 border border-white/10">
            <div
              className="h-full bg-gradient-to-r from-[#A8D8E8] via-[#B9E48C] to-[#B9E48C] rounded-full transition-all duration-500 shadow-glow-living"
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
        </div>

        <div className="p-4 rounded-xl glass-light border-white/10 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#F5F2E8]/60 font-mono">Target Crop</span>
            <span className="text-xs font-bold text-[#F5F2E8] flex items-center gap-1.5">
              <span>{crop.icon}</span> {crop.name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#F5F2E8]/60 font-mono">Detected Condition</span>
            <span className="text-xs font-bold text-[#F28B78]">
              {assessment.primaryCondition.name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#F5F2E8]/60 font-mono">Severity Level</span>
            <span className="text-xs font-semibold text-[#EBCB78]">
              {assessment.primaryCondition.severity} Severity
            </span>
          </div>
        </div>

        <div>
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B9E48C]/80 mb-1">
            Diagnosis Rationale
          </p>
          <p className="text-xs text-[#F5F2E8]/80 leading-relaxed p-3.5 rounded-xl glass-light border-white/10">
            {assessment.diagnosisSummary}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
