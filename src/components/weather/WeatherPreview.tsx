import React from 'react';
import { CloudSun, Droplets, CloudRain, Wind, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { WeatherSnapshot } from '../../types';
import { Button } from '../ui/Button';

export interface WeatherPreviewProps {
  weather?: WeatherSnapshot | null;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  locationName?: string;
}

export const WeatherPreview: React.FC<WeatherPreviewProps> = ({
  weather,
  isLoading,
  error,
  onRetry,
  locationName = 'Vijayawada, AP',
}) => {
  if (isLoading) {
    return (
      <div className="glass-medium p-5 rounded-2xl border-white/12 shadow-glass-sm flex flex-col items-center justify-center min-h-[140px] space-y-3">
        <Loader2 className="w-6 h-6 text-[#B9E48C] animate-spin" />
        <p className="text-xs font-mono text-[#F5F2E8]/80 animate-pulse">
          Loading live weather conditions for {locationName}...
        </p>
      </div>
    );
  }

  if (error || !weather) {
    return (
      <div className="glass-medium p-5 rounded-2xl border-[#F28B78]/30 bg-[#F28B78]/5 shadow-glass-sm flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-[#F28B78] shrink-0" />
          <div>
            <p className="text-xs font-bold text-[#F5F2E8]">Live weather data is temporarily unavailable.</p>
            <p className="text-[11px] text-white/60">{error || 'Please check your connection and try again.'}</p>
          </div>
        </div>
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="w-3.5 h-3.5 text-[#B9E48C]" />}
            className="shrink-0 text-xs border-white/15 hover:border-[#B9E48C]"
          >
            Retry
          </Button>
        )}
      </div>
    );
  }

  const currentHour = weather.hourlyForecast?.[0] || weather.hours?.[0];
  const temp = currentHour ? Math.round(currentHour.temperatureC) : Math.round(weather.currentTempC);
  const humidity = currentHour ? currentHour.relativeHumidityPct : weather.currentHumidity;
  const rainProb = currentHour ? currentHour.precipitationProbabilityPct : 10;
  const windSpeed = currentHour ? Math.round(currentHour.windSpeedKmh) : Math.round(weather.currentWindSpeedKmh);
  const conditionDesc = currentHour ? currentHour.conditionDescription : weather.currentCondition;

  const latStr = weather.latitude ? `${weather.latitude.toFixed(4)}° N` : '';
  const lonStr = weather.longitude ? `${weather.longitude.toFixed(4)}° E` : '';
  const coordText = [latStr, lonStr].filter(Boolean).join(' · ');

  return (
    <div className="glass-medium p-5 rounded-2xl border-white/12 shadow-glass-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A8D8E8]">
            Micro-Weather Preview
          </span>
          <span className="text-[10px] font-mono text-[#B9E48C] bg-[#B9E48C]/10 px-2 py-0.5 rounded-full border border-[#B9E48C]/20">
            {weather.provider === 'open-meteo' ? 'Open-Meteo Live' : 'Cached/Mock'}
          </span>
        </div>
        <div className="text-right">
          <div className="text-[11px] font-mono font-semibold text-[#F5F2E8]">
            📍 {weather.locationName || locationName}
          </div>
          {coordText && (
            <div className="text-[10px] font-mono text-white/50">
              {coordText} · {weather.timezone || 'Asia/Kolkata'}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Temp & Condition */}
        <div className="p-3 rounded-xl glass-light border-white/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#EBCB78]/15 text-[#EBCB78] border border-[#EBCB78]/20 shrink-0">
            <CloudSun className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-base font-bold font-heading text-[#F5F2E8]">{temp}°C</p>
            <p className="text-[11px] text-[#F5F2E8]/70 leading-none truncate" title={conditionDesc}>{conditionDesc}</p>
          </div>
        </div>

        {/* Humidity */}
        <div className="p-3 rounded-xl glass-light border-white/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#A8D8E8]/15 text-[#A8D8E8] border border-[#A8D8E8]/20 shrink-0">
            <Droplets className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-[#F5F2E8]/60">Humidity</p>
            <p className="text-base font-bold font-heading text-[#F5F2E8]">{humidity}%</p>
          </div>
        </div>

        {/* Rain */}
        <div className="p-3 rounded-xl glass-light border-white/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#A8D8E8]/15 text-[#A8D8E8] border border-[#A8D8E8]/20 shrink-0">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-[#F5F2E8]/60">Rain Prob</p>
            <p className="text-base font-bold font-heading text-[#F28B78]">{rainProb}%</p>
          </div>
        </div>

        {/* Wind */}
        <div className="p-3 rounded-xl glass-light border-white/10 flex items-center gap-3">
          <div className="p-2 rounded-lg bg-white/10 text-[#F5F2E8] border border-white/15 shrink-0">
            <Wind className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-[#F5F2E8]/60">Wind</p>
            <p className="text-base font-bold font-heading text-[#F5F2E8]">{windSpeed} km/h</p>
          </div>
        </div>
      </div>

      <div className="text-[10px] font-mono text-white/40 text-right">
        Weather data by Open-Meteo
      </div>
    </div>
  );
};
