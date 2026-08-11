import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { CloudRain, Sun, ShieldAlert, AlertCircle } from 'lucide-react';

export interface RecommendationReasonProps {
  isNeedsReview?: boolean;
}

export const RecommendationReason: React.FC<RecommendationReasonProps> = ({ isNeedsReview = false }) => {
  return (
    <Card glassLevel="medium" className="border-l-4 border-l-[#A8D8E8]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#A8D8E8]/20 text-[#A8D8E8] flex items-center justify-center font-mono font-bold text-xs border border-[#A8D8E8]/30">
              4
            </span>
            <CardTitle className="text-base text-[#F5F2E8]">4. WHY THIS RECOMMENDATION?</CardTitle>
          </div>
          <span className="text-[10px] font-mono text-[#A8D8E8] uppercase tracking-wider">
            Agronomic Analysis
          </span>
        </div>
      </CardHeader>

      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {isNeedsReview ? (
          <>
            {/* Reason 1 */}
            <div className="glass-light p-4 rounded-2xl border-[#EBCB78]/30 space-y-2">
              <div className="flex items-center gap-2 text-[#EBCB78] font-bold text-sm font-heading">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Visual Evidence Verification Required</span>
              </div>
              <p className="text-xs text-[#F5F2E8]/80 leading-relaxed">
                AgriPulse requires a higher confidence visual diagnosis before chemical spray calculation to prevent misapplication.
              </p>
            </div>

            {/* Reason 2 */}
            <div className="glass-light p-4 rounded-2xl border-[#A8D8E8]/30 bg-[#A8D8E8]/5 space-y-2">
              <div className="flex items-center gap-2 text-[#A8D8E8] font-bold text-sm font-heading">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Avoid Unconfirmed Chemical Use</span>
              </div>
              <p className="text-xs text-[#F5F2E8]/80 leading-relaxed">
                Spraying unconfirmed target diseases causes ineffective pathogen control, unnecessary costs, and resistance.
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Reason 1 */}
            <div className="glass-light p-4 rounded-2xl border-[#F28B78]/30 space-y-2">
              <div className="flex items-center gap-2 text-[#F28B78] font-bold text-sm font-heading">
                <CloudRain className="w-4 h-4 shrink-0" />
                <span>Rain expected soon</span>
              </div>
              <p className="text-xs text-[#F5F2E8]/80 leading-relaxed">
                Current conditions are less favorable. High precipitation probability (82%) within the next few hours will wash off foliar treatments before absorption.
              </p>
            </div>

            {/* Reason 2 */}
            <div className="glass-light p-4 rounded-2xl border-[#B9E48C]/30 bg-[#B9E48C]/5 space-y-2">
              <div className="flex items-center gap-2 text-[#B9E48C] font-bold text-sm font-heading">
                <Sun className="w-4 h-4 shrink-0" />
                <span>Better dry period tomorrow</span>
              </div>
              <p className="text-xs text-[#F5F2E8]/80 leading-relaxed">
                Forecast indicates a more favorable window tomorrow (07:00 AM – 10:30 AM) with rain risk dropping to 10% and calm winds under 8 km/h.
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
