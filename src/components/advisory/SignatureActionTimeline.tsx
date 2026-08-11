import React from 'react';
import { motion } from 'framer-motion';
import { CloudRain, Sun, Clock, AlertCircle } from 'lucide-react';
import { ActionWindow } from '../../types';

export interface SignatureActionTimelineProps {
  actionWindow: ActionWindow;
  className?: string;
}

export const SignatureActionTimeline: React.FC<SignatureActionTimelineProps> = ({
  actionWindow,
  className,
}) => {
  const steps = [
    {
      period: 'NOW',
      status: 'WAIT',
      subtitle: 'Rain is moving through the field',
      icon: <CloudRain className="w-5 h-5 text-[#A8D8E8]" />,
      badge: 'Unfavorable',
      color: 'border-[#F28B78]/40 bg-[#F28B78]/10 text-[#F28B78]',
    },
    {
      period: 'TONIGHT',
      status: 'RAIN EXPECTED',
      subtitle: 'Precipitation 65% + spray drift high wind',
      icon: <AlertCircle className="w-5 h-5 text-[#EBCB78]" />,
      badge: 'High Risk',
      color: 'border-[#EBCB78]/40 bg-[#EBCB78]/10 text-[#EBCB78]',
    },
    {
      period: 'TOMORROW',
      status: `${actionWindow.bestStartTime || '07:00'} – ${actionWindow.bestEndTime || '10:30'}`,
      subtitle: 'Optimal window: calm wind (<8 km/h), rain 10%',
      icon: <Sun className="w-5 h-5 text-[#B9E48C]" />,
      badge: `Optimal (${actionWindow.suitabilityScore || 92}/100)`,
      color: 'border-[#B9E48C]/50 bg-[#B9E48C]/15 text-[#B9E48C]',
      isOptimal: true,
    },
  ];

  return (
    <div className={`glass-deep rounded-3xl p-6 sm:p-8 border-white/20 shadow-glass-deep relative overflow-hidden ${className || ''}`}>
      {/* Background ambient light orb */}
      <div className="absolute right-0 top-0 w-80 h-80 bg-gradient-to-br from-[#B9E48C]/10 to-transparent rounded-full blur-3xl pointer-events-none" />

      {/* Header editorial language */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6 mb-8">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B9E48C]">
            Field Action Intelligence
          </span>
          <h2 className="font-serif italic text-3xl sm:text-4xl text-[#F5F2E8] mt-1">
            The field says: <span className="not-italic font-sans font-extrabold text-[#EBCB78]">WAIT</span>
          </h2>
          <p className="text-xs sm:text-sm text-[#F5F2E8]/70 mt-1">
            Rain is moving through the field. Better conditions are forecast tomorrow morning.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-white/[0.04] p-3 rounded-2xl border border-white/10 shrink-0">
          <Clock className="w-5 h-5 text-[#B9E48C]" />
          <div>
            <span className="text-[9px] font-mono uppercase text-[#F5F2E8]/60 block">Best Action Window</span>
            <span className="text-sm font-extrabold text-[#B9E48C]">
              {actionWindow.bestStartTime || '07:00'} – {actionWindow.bestEndTime || '10:30'}
            </span>
          </div>
        </div>
      </div>

      {/* Continuous 3-Step Timeline */}
      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Continuous connector line on desktop */}
        <div className="hidden md:block absolute top-12 left-10 right-10 h-0.5 bg-gradient-to-r from-[#F28B78]/40 via-[#EBCB78]/40 to-[#B9E48C] -z-0" />

        {steps.map((step, idx) => (
          <motion.div
            key={step.period}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: idx * 0.15 }}
            viewport={{ once: true }}
            className={`relative z-10 p-5 rounded-2xl border backdrop-blur-md transition-all duration-300 ${
              step.isOptimal
                ? 'glass-deep border-[#B9E48C]/40 ring-1 ring-[#B9E48C]/30 shadow-glow-living'
                : 'glass-medium border-white/10 hover:border-white/20'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-mono font-bold tracking-widest text-[#F5F2E8]/60">
                {step.period}
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${step.color}`}>
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

            <p className="text-xs text-[#F5F2E8]/70 leading-relaxed pl-1">
              {step.subtitle}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
