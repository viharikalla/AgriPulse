import React from 'react';
import { WeatherSnapshot } from '../../types';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { CloudSun, Droplets, Wind, MapPin, Clock } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export interface WeatherSummaryProps {
  weather: WeatherSnapshot;
  className?: string;
}

export const WeatherSummary: React.FC<WeatherSummaryProps> = ({ weather, className }) => {
  return (
    <Card glassLevel="medium" className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#B9E48C]" />
            <CardTitle className="text-base text-[#F5F2E8]">{weather.locationName}</CardTitle>
          </div>
          <Badge variant="glass" size="sm" icon={<Clock className="w-3 h-3 text-[#A8D8E8]" />}>
            {formatDate(weather.fetchedAt || new Date().toISOString())}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1">
          <div className="flex items-center gap-3 p-3.5 rounded-xl glass-light border-white/10">
            <div className="p-2.5 rounded-lg bg-[#EBCB78]/15 text-[#EBCB78] border border-[#EBCB78]/20">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#F5F2E8]/60">Temp</p>
              <p className="text-base font-bold text-[#F5F2E8]">{weather.currentTempC}°C</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl glass-light border-white/10">
            <div className="p-2.5 rounded-lg bg-[#A8D8E8]/15 text-[#A8D8E8] border border-[#A8D8E8]/20">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#F5F2E8]/60">Humidity</p>
              <p className="text-base font-bold text-[#F5F2E8]">{weather.currentHumidity}%</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl glass-light border-white/10">
            <div className="p-2.5 rounded-lg bg-white/10 text-[#F5F2E8] border border-white/15">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#F5F2E8]/60">Wind</p>
              <p className="text-base font-bold text-[#F5F2E8]">{weather.currentWindSpeedKmh} km/h</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl glass-light border-white/10">
            <div className="p-2.5 rounded-lg bg-[#B9E48C]/15 text-[#B9E48C] border border-[#B9E48C]/20">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#F5F2E8]/60">Condition</p>
              <p className="text-xs font-semibold text-[#F5F2E8] line-clamp-1">
                {weather.currentCondition}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
