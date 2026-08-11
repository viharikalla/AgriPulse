import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Clock, AlertTriangle, CloudRain } from 'lucide-react';

export interface ActionCardProps {
  decision?: string;
  bestWindow?: string;
  windowScore?: number;
  actionText?: string;
  className?: string;
}

export const ActionCard: React.FC<ActionCardProps> = ({
  bestWindow = 'Tomorrow · 07:00–10:30 AM',
  windowScore = 88,
  actionText = 'Wait for the more favorable weather window before treatment.',
  className,
}) => {
  return (
    <Card glassLevel="deep" className={`border-l-4 border-l-[#EBCB78] shadow-glass-deep relative overflow-hidden ${className || ''}`}>
      <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-[#EBCB78]/15 via-[#B9E48C]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#EBCB78]/20 text-[#EBCB78] flex items-center justify-center font-mono font-bold text-xs border border-[#EBCB78]/30">
              2
            </span>
            <CardTitle className="text-base text-[#F5F2E8]">2. WHAT SHOULD I DO & WHEN SHOULD I ACT?</CardTitle>
          </div>
          <Badge variant="warning" size="sm" icon={<AlertTriangle className="w-3 h-3 text-[#EBCB78]" />}>
            FIELD DECISION: WAIT
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Editorial Field Decision Statement */}
        <div className="space-y-2 pt-1">
          <span className="text-xs font-mono font-bold uppercase tracking-widest text-[#EBCB78] block">
            THE FIELD SAYS
          </span>
          <h2 className="font-serif italic text-5xl sm:text-7xl font-normal text-[#EBCB78] tracking-tight leading-none">
            WAIT.
          </h2>
          <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-[#F5F2E8] pt-1">
            <CloudRain className="w-4 h-4 text-[#F28B78]" />
            <span>Rain is moving through the field.</span>
          </div>
          <p className="text-xs sm:text-sm text-[#F5F2E8]/80 leading-relaxed max-w-xl">
            {actionText}
          </p>
        </div>

        {/* Best Available Window Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div className="p-4 rounded-2xl glass-medium border-[#B9E48C]/30 bg-[#B9E48C]/5 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B9E48C] block mb-0.5">
                Best Available Window
              </span>
              <p className="text-sm font-bold text-[#F5F2E8]">{bestWindow}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-[#B9E48C]/15 text-[#B9E48C] border border-[#B9E48C]/30">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-2xl glass-medium border-white/12 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A8D8E8] block mb-0.5">
                Window Score
              </span>
              <p className="text-xl font-bold font-mono text-[#B9E48C]">{windowScore}/100</p>
            </div>
            <Badge variant="success" size="sm">Favorable</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
