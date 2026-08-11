import React from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Sun, XCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';

export const ActionTimeline: React.FC = () => {
  const steps = [
    {
      period: 'NOW',
      status: '❌ Wait',
      subtitle: 'Rain expected within the next few hours',
      icon: <XCircle className="w-5 h-5 text-[#F28B78]" />,
      badge: 'Unfavorable',
      badgeClass: 'border-[#F28B78]/40 bg-[#F28B78]/15 text-[#F28B78]',
      cardClass: 'glass-light border-[#F28B78]/30',
    },
    {
      period: 'TONIGHT',
      status: '🌧 Rain expected',
      subtitle: 'Precipitation 82% & high spray wash-off risk',
      icon: <CloudRain className="w-5 h-5 text-[#EBCB78]" />,
      badge: 'High Risk',
      badgeClass: 'border-[#EBCB78]/40 bg-[#EBCB78]/15 text-[#EBCB78]',
      cardClass: 'glass-light border-[#EBCB78]/30',
    },
    {
      period: 'TOMORROW',
      status: '🟢 Best available window',
      subtitle: '07:00 AM – 10:30 AM (Score 88/100, wind 7 km/h, 10% rain)',
      icon: <Sun className="w-5 h-5 text-[#B9E48C]" />,
      badge: 'Optimal (88/100)',
      badgeClass: 'border-[#B9E48C]/50 bg-[#B9E48C]/20 text-[#B9E48C]',
      cardClass: 'glass-deep border-[#B9E48C]/50 ring-1 ring-[#B9E48C]/40 shadow-glow-living',
      isOptimal: true,
    },
  ];

  return (
    <Card glassLevel="deep" className="border-l-4 border-l-[#B9E48C]">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-[#B9E48C]/20 text-[#B9E48C] flex items-center justify-center font-mono font-bold text-xs border border-[#B9E48C]/30">
              3
            </span>
            <CardTitle className="text-base text-[#F5F2E8]">3. ACTION TIMELINE</CardTitle>
          </div>
          <span className="text-[10px] font-mono text-[#B9E48C] uppercase tracking-wider">
            Continuous Weather Flow
          </span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          {/* Connector line for desktop */}
          <div className="hidden md:block absolute top-12 left-10 right-10 h-0.5 bg-gradient-to-r from-[#F28B78]/40 via-[#EBCB78]/40 to-[#B9E48C] -z-0" />

          {steps.map((step, idx) => (
            <motion.div
              key={step.period}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.12 }}
              viewport={{ once: true }}
              className={`relative z-10 p-5 rounded-2xl border transition-all duration-300 ${step.cardClass}`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-mono font-bold tracking-widest text-[#F5F2E8]/60">
                  {step.period}
                </span>
                <span className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full border ${step.badgeClass}`}>
                  {step.badge}
                </span>
              </div>

              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 rounded-xl bg-white/[0.06] border border-white/10 shrink-0">
                  {step.icon}
                </div>
                <h4 className="font-heading font-bold text-base text-[#F5F2E8]">
                  {step.status}
                </h4>
              </div>

              <p className="text-xs text-[#F5F2E8]/75 leading-relaxed">
                {step.subtitle}
              </p>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
