import React from 'react';
import { WeatherHour } from '../../types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { Tooltip } from '../ui/Tooltip';
import { CloudRain, Wind, Thermometer, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export interface HourlyForecastTimelineProps {
  hourlyData: WeatherHour[];
  bestStartTime?: string;
  className?: string;
}

export const HourlyForecastTimeline: React.FC<HourlyForecastTimelineProps> = ({
  hourlyData,
  bestStartTime,
  className,
}) => {
  const getSuitabilityBadge = (suitability: WeatherHour['spraySuitability']) => {
    switch (suitability) {
      case 'Optimal':
        return <Badge variant="success" size="sm" icon={<CheckCircle2 className="w-3 h-3" />}>Optimal Window</Badge>;
      case 'Marginal':
        return <Badge variant="warning" size="sm" icon={<AlertTriangle className="w-3 h-3" />}>Marginal</Badge>;
      case 'Unfavorable':
        return <Badge variant="danger" size="sm" icon={<XCircle className="w-3 h-3" />}>Unfavorable</Badge>;
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Hourly Weather & Action Window Timeline</span>
        </CardTitle>
        <CardDescription>
          Hourly breakdown evaluating precipitation risk, wind velocity drift, and optimal chemical application windows.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin">
          {hourlyData.map((hour, idx) => {
            const isBest = bestStartTime && hour.time.includes(bestStartTime);
            return (
              <Tooltip
                key={idx}
                content={hour.suitabilityReason || `${hour.conditionDescription} - ${hour.spraySuitability}`}
              >
                <div
                  className={`min-w-[140px] flex-1 p-3.5 rounded-xl border transition-all snap-start flex flex-col justify-between ${
                    isBest
                      ? 'border-agri-600 bg-agri-50/80 ring-2 ring-agri-500/30 shadow-sm'
                      : hour.spraySuitability === 'Optimal'
                      ? 'border-emerald-200 bg-emerald-50/40'
                      : hour.spraySuitability === 'Marginal'
                      ? 'border-amber-200 bg-amber-50/30'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-900">{hour.time}</span>
                    {isBest && (
                      <span className="text-[10px] bg-agri-600 text-white px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        BEST
                      </span>
                    )}
                  </div>

                  <div className="space-y-1.5 my-2">
                    <div className="flex items-center justify-between text-xs text-slate-700">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Thermometer className="w-3 h-3 text-amber-500" />
                        Temp
                      </span>
                      <span className="font-semibold">{hour.temperatureC}°C</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-700">
                      <span className="flex items-center gap-1 text-slate-400">
                        <CloudRain className="w-3 h-3 text-sky-500" />
                        Rain
                      </span>
                      <span className="font-semibold">{hour.rainfallProbabilityPercent}%</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-700">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Wind className="w-3 h-3 text-slate-500" />
                        Wind
                      </span>
                      <span className="font-semibold">{hour.windSpeedKmh} km/h</span>
                    </div>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex justify-center">
                    {getSuitabilityBadge(hour.spraySuitability)}
                  </div>
                </div>
              </Tooltip>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
