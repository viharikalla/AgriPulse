import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';


export const ManagementCard: React.FC = () => {
  const steps = [
    {
      num: '01',
      title: 'Remove severely affected plant material',
      desc: 'Prune and clear severely spotted lower foliage to reduce fungal spore load in the canopy reservoir.',
    },
    {
      num: '02',
      title: 'Improve field sanitation',
      desc: 'Collect drop foliage and clear weeds around row bases to maintain airflow and lower surface leaf moisture.',
    },
    {
      num: '03',
      title: 'Follow registered treatment guidance & product label instructions',
      desc: 'Apply locally registered copper or chlorothalonil protectant fungicide strictly according to safety dosage intervals.',
    },
    {
      num: '04',
      title: 'Monitor new growth shoots',
      desc: 'Check newly emerging apical leaves daily for early lesion expansion post treatment.',
    },
  ];

  return (
    <Card glassLevel="medium" className="border-l-4 border-l-[#B9E48C]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#B9E48C]/20 text-[#B9E48C] flex items-center justify-center font-mono font-bold text-xs border border-[#B9E48C]/30">
              5
            </span>
            <CardTitle className="text-base text-[#F5F2E8]">5. MANAGEMENT DETAILS</CardTitle>
          </div>
          <span className="text-[10px] font-mono text-[#B9E48C] uppercase tracking-wider">
            Agronomic Action Steps
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {steps.map((s) => (
            <div key={s.num} className="glass-light p-4 rounded-2xl border-white/10 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[#B9E48C]">{s.num}.</span>
                <h4 className="font-heading font-bold text-sm text-[#F5F2E8]">{s.title}</h4>
              </div>
              <p className="text-xs text-[#F5F2E8]/75 leading-relaxed pl-6">{s.desc}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
