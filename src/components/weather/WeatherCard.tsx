import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/Card';
import { CloudSun, Droplets, CloudRain, Wind, MapPin } from 'lucide-react';

export interface WeatherCardProps {
  temperatureC?: number;
  humidityPercent?: number;
  rainProbabilityPercent?: number;
  windSpeedKmh?: number;
  conditionDescription?: string;
  location?: string;
  className?: string;
}

export const WeatherCard: React.FC<WeatherCardProps> = ({
  temperatureC = 29,
  humidityPercent = 78,
  rainProbabilityPercent = 82,
  windSpeedKmh = 8,
  location = 'Vijayawada, Andhra Pradesh',
  className,
}) => {
  return (
    <Card glassLevel="medium" className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#B9E48C]" />
            <CardTitle className="text-base text-[#F5F2E8]">FIELD WEATHER SNAPSHOT</CardTitle>
          </div>
          <span className="text-[10px] font-mono text-[#F5F2E8]/60">{location}</span>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3.5 rounded-xl glass-light border-white/10">
            <div className="p-2.5 rounded-lg bg-[#EBCB78]/15 text-[#EBCB78] border border-[#EBCB78]/20">
              <CloudSun className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#F5F2E8]/60">Temp</p>
              <p className="text-base font-bold text-[#F5F2E8]">{temperatureC}°C</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl glass-light border-white/10">
            <div className="p-2.5 rounded-lg bg-[#A8D8E8]/15 text-[#A8D8E8] border border-[#A8D8E8]/20">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#F5F2E8]/60">Humidity</p>
              <p className="text-base font-bold text-[#F5F2E8]">{humidityPercent}%</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl glass-light border-white/10">
            <div className="p-2.5 rounded-lg bg-[#F28B78]/15 text-[#F28B78] border border-[#F28B78]/20">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#F5F2E8]/60">Rain Chance</p>
              <p className="text-base font-bold text-[#F28B78]">{rainProbabilityPercent}%</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 rounded-xl glass-light border-white/10">
            <div className="p-2.5 rounded-lg bg-white/10 text-[#F5F2E8] border border-white/15">
              <Wind className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-[#F5F2E8]/60">Wind</p>
              <p className="text-base font-bold text-[#F5F2E8]">{windSpeedKmh} km/h</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
