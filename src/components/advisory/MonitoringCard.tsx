import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Eye } from 'lucide-react';

export const MonitoringCard: React.FC = () => {
  const checklist = [
    'Check whether lesions appear on new leaves.',
    'Monitor spread of symptoms across adjacent rows.',
    'Recheck local weather forecast window before chemical application.',
  ];

  return (
    <Card glassLevel="medium" className="border-l-4 border-l-[#EBCB78]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#EBCB78]/20 text-[#EBCB78] flex items-center justify-center font-mono font-bold text-xs border border-[#EBCB78]/30">
              6
            </span>
            <CardTitle className="text-base text-[#F5F2E8]">6. WHAT SHOULD I MONITOR?</CardTitle>
          </div>
          <span className="text-[10px] font-mono text-[#EBCB78] uppercase tracking-wider">
            Verification Protocol
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="space-y-3">
          {checklist.map((item, idx) => (
            <div key={idx} className="glass-light p-4 rounded-xl border-white/10 flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-[#EBCB78]/15 text-[#EBCB78] border border-[#EBCB78]/30 mt-0.5 shrink-0">
                <Eye className="w-4 h-4" />
              </div>
              <p className="text-xs text-[#F5F2E8]/90 font-medium leading-relaxed pt-0.5">{item}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
