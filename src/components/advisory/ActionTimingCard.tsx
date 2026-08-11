import React from 'react';
import { FieldDecision, CropAssessment } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { SignatureActionTimeline } from './SignatureActionTimeline';
import { Eye } from 'lucide-react';

export interface ActionTimingCardProps {
  decision: FieldDecision;
  assessment: CropAssessment;
  className?: string;
}

export const ActionTimingCard: React.FC<ActionTimingCardProps> = ({
  decision,
  assessment,
  className,
}) => {
  const { actionWindow, primaryAction, monitoringChecklist, rationale } = decision;

  return (
    <div className={`space-y-8 ${className || ''}`}>
      {/* Signature Action Timeline (NOW -> TONIGHT -> TOMORROW) */}
      <SignatureActionTimeline actionWindow={actionWindow} />

      {/* The 5 Core Product Answer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Q1: What appears to be wrong? */}
        <Card glassLevel="medium" className="border-l-4 border-l-[#F28B78]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-[#F5F2E8]">
              <span className="w-6 h-6 rounded-full bg-[#F28B78]/20 text-[#F28B78] flex items-center justify-center font-mono font-bold text-xs border border-[#F28B78]/30">
                1
              </span>
              What appears to be wrong?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-[#F28B78] text-sm">{assessment.primaryCondition.name}</h4>
              <Badge variant="danger" size="sm">{assessment.primaryCondition.severity} Severity</Badge>
            </div>
            <p className="text-xs text-[#F5F2E8]/80 leading-relaxed">{assessment.diagnosisSummary}</p>
            <div className="glass-light p-3.5 rounded-xl border-white/10">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F5F2E8]/60 mb-1.5">
                Visual Symptoms
              </p>
              <ul className="text-xs text-[#F5F2E8]/80 space-y-1 list-disc pl-4">
                {assessment.visualObservations.map((obs, idx) => (
                  <li key={idx}>{obs}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Q2: What should the farmer do? */}
        <Card glassLevel="medium" className="border-l-4 border-l-[#B9E48C]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-[#F5F2E8]">
              <span className="w-6 h-6 rounded-full bg-[#B9E48C]/20 text-[#B9E48C] flex items-center justify-center font-mono font-bold text-xs border border-[#B9E48C]/30">
                2
              </span>
              What should the farmer do?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <h4 className="font-bold text-[#B9E48C] text-sm">{primaryAction.title}</h4>
            <p className="text-xs text-[#F5F2E8]/80 leading-relaxed">{primaryAction.description}</p>
            {primaryAction.recommendedDosage && (
              <div className="glass-light p-3.5 rounded-xl border-[#B9E48C]/20 bg-[#B9E48C]/5">
                <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#B9E48C]">
                  Recommended Application & Dosage
                </p>
                <p className="text-xs font-bold text-[#F5F2E8] mt-0.5">{primaryAction.recommendedDosage}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Q3 & Q4: When & Why is this the best weather window? */}
        <Card glassLevel="medium" className="border-l-4 border-l-[#A8D8E8]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-[#F5F2E8]">
              <span className="w-6 h-6 rounded-full bg-[#A8D8E8]/20 text-[#A8D8E8] flex items-center justify-center font-mono font-bold text-xs border border-[#A8D8E8]/30">
                3 & 4
              </span>
              When & Why is this the best window?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="glass-light p-3.5 rounded-xl border-[#A8D8E8]/30 bg-[#A8D8E8]/5 flex items-center justify-between">
              <div>
                <p className="text-xs text-[#F5F2E8] font-bold">
                  Window: {actionWindow.bestStartTime} – {actionWindow.bestEndTime}
                </p>
                <p className="text-[11px] text-[#A8D8E8] font-mono">Suitability Score: {actionWindow.suitabilityScore}/100</p>
              </div>
              <Badge variant="info" size="sm">Optimal</Badge>
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#F5F2E8]/60">
                Agronomic Weather Rationale
              </p>
              <p className="text-xs text-[#F5F2E8]/80 leading-relaxed">{rationale}</p>
            </div>
          </CardContent>
        </Card>

        {/* Q5: What should they monitor? */}
        <Card glassLevel="medium" className="border-l-4 border-l-[#EBCB78]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2 text-[#F5F2E8]">
              <span className="w-6 h-6 rounded-full bg-[#EBCB78]/20 text-[#EBCB78] flex items-center justify-center font-mono font-bold text-xs border border-[#EBCB78]/30">
                5
              </span>
              What should they monitor?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-[#F5F2E8]/70">Post-application verification checklist for crop recovery:</p>
            <ul className="space-y-2">
              {monitoringChecklist.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2.5 text-xs text-[#F5F2E8]/90 glass-light p-3 rounded-xl border-white/10">
                  <Eye className="w-4 h-4 text-[#EBCB78] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
