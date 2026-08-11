import React from 'react';
import { motion } from 'framer-motion';
import { WeatherHour } from '../../types';
import { Sun, CloudRain } from 'lucide-react';
import { Tooltip } from '../ui/Tooltip';

export interface AtmosphericForecastRibbonProps {
  hourlyData: WeatherHour[];
  bestStartTime?: string;
  className?: string;
}

export const AtmosphericForecastRibbon: React.FC<AtmosphericForecastRibbonProps> = ({
  hourlyData,
  bestStartTime,
  className,
}) => {
  return (
    <div className={`glass-medium rounded-3xl p-6 border-white/12 shadow-glass-md ${className || ''}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
        <div>
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A8D8E8]">
            Atmospheric Forecast Ribbon
          </span>
          <h3 className="font-serif italic text-2xl text-[#F5F2E8]">
            Hourly Micro-Weather & Spray Suitability
          </h3>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono text-[#F5F2E8]/60">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#B9E48C]" /> Optimal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EBCB78]" /> Marginal
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F28B78]" /> Unfavorable
          </span>
        </div>
      </div>

      {/* Horizontal Ribbon */}
      <div className="flex gap-3 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
        {hourlyData.map((hour, idx) => {
          const isOptimal = hour.spraySuitability === 'Optimal';
          const isMarginal = hour.spraySuitability === 'Marginal';
          const isBest = bestStartTime && hour.time.includes(bestStartTime);

          return (
            <Tooltip
              key={idx}
              content={hour.suitabilityReason || `${hour.conditionDescription} (${hour.spraySuitability})`}
            >
              <motion.div
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className={`min-w-[120px] flex-1 p-4 rounded-2xl border transition-all snap-start flex flex-col justify-between ${
                  isBest
                    ? 'glass-deep border-[#B9E48C]/60 ring-2 ring-[#B9E48C]/40 shadow-glow-living'
                    : isOptimal
                    ? 'glass-medium border-[#B9E48C]/30 bg-[#B9E48C]/5'
                    : isMarginal
                    ? 'glass-light border-[#EBCB78]/30 bg-[#EBCB78]/5'
                    : 'glass-light border-white/10 opacity-70'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-[#F5F2E8]">{hour.time}</span>
                  {isBest && (
                    <span className="text-[9px] font-mono bg-[#B9E48C] text-[#07130F] px-1.5 py-0.5 rounded-full font-extrabold uppercase">
                      BEST
                    </span>
                  )}
                </div>

                <div className="my-2 text-center">
                  <div className="inline-flex p-2 rounded-xl bg-white/[0.04] border border-white/10 mb-2">
                    {hour.rainfallProbabilityPercent > 40 ? (
                      <CloudRain className="w-5 h-5 text-[#A8D8E8]" />
                    ) : (
                      <Sun className="w-5 h-5 text-[#EBCB78]" />
                    )}
                  </div>
                  <p className="text-lg font-bold font-heading text-[#F5F2E8]">{hour.temperatureC}°C</p>
                </div>

                <div className="space-y-1 pt-2 border-t border-white/10 text-[11px] font-mono text-[#F5F2E8]/70">
                  <div className="flex justify-between">
                    <span>Rain</span>
                    <span className={hour.rainfallProbabilityPercent > 40 ? 'text-[#F28B78] font-bold' : 'text-[#A8D8E8]'}>
                      {hour.rainfallProbabilityPercent}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wind</span>
                    <span>{hour.windSpeedKmh} km/h</span>
                  </div>
                </div>
              </motion.div>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
};
