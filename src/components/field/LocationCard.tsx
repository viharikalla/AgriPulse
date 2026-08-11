import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, CheckCircle2, Search, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { ResolvedLocation } from '../../types';
import { ApiClient } from '../../services/apiClient';

export interface LocationCardProps {
  value: string;
  selectedLocation?: ResolvedLocation | null;
  onChange: (locationText: string) => void;
  onSelectLocation?: (location: ResolvedLocation) => void;
  error?: string | null;
}

export const LocationCard: React.FC<LocationCardProps> = ({
  value,
  selectedLocation,
  onChange,
  onSelectLocation,
  error,
}) => {
  const [isLocating, setIsLocating] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<ResolvedLocation[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);

    if (val.trim().length >= 2) {
      setIsSearching(true);
      try {
        const results = await ApiClient.searchLocation(val.trim());
        setSearchResults(results);
        setShowDropdown(results.length > 0);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (value.trim().length < 2) return;

      setIsSearching(true);
      try {
        const results = await ApiClient.searchLocation(value.trim());
        setSearchResults(results);

        if (results.length === 1 && onSelectLocation) {
          // Exactly 1 strong result -> auto-select
          handleSelectLocation(results[0]);
        } else if (results.length > 1) {
          setShowDropdown(true);
        }
      } catch {
        // Fallback
      } finally {
        setIsSearching(false);
      }
    }
  };

  const handleSelectLocation = (loc: ResolvedLocation) => {
    const displayName = `${loc.name}${loc.admin1 ? `, ${loc.admin1}` : ''}`;
    onChange(displayName);
    setShowDropdown(false);
    if (onSelectLocation) {
      onSelectLocation(loc);
    }
  };

  const handleUseCurrentLocation = () => {
    setIsLocating(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          const resolved: ResolvedLocation = {
            name: 'Current Field Location',
            latitude: lat,
            longitude: lon,
            country: 'India',
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata',
          };

          const displayName = `Current Location (${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E)`;
          onChange(displayName);
          setIsLocating(false);

          if (onSelectLocation) {
            onSelectLocation(resolved);
          }
        },
        () => {
          // Fallback if browser permission denied
          const fallback: ResolvedLocation = {
            name: 'Vijayawada',
            admin1: 'Andhra Pradesh',
            latitude: 16.5062,
            longitude: 80.648,
            country: 'India',
            timezone: 'Asia/Kolkata',
          };
          onChange('Vijayawada, Andhra Pradesh');
          setIsLocating(false);
          if (onSelectLocation) {
            onSelectLocation(fallback);
          }
        },
        { timeout: 5000 }
      );
    } else {
      const fallback: ResolvedLocation = {
        name: 'Vijayawada',
        admin1: 'Andhra Pradesh',
        latitude: 16.5062,
        longitude: 80.648,
        country: 'India',
        timezone: 'Asia/Kolkata',
      };
      onChange('Vijayawada, Andhra Pradesh');
      setIsLocating(false);
      if (onSelectLocation) {
        onSelectLocation(fallback);
      }
    }
  };

  return (
    <div className="space-y-3 relative" ref={dropdownRef}>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
        <div className="flex-1 relative">
          <Input
            label="Field Location / Coordinates"
            placeholder="e.g. Vijayawada, Bengaluru, Hyderabad"
            value={value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            leftIcon={<MapPin className="w-4 h-4 text-[#B9E48C]" />}
            rightIcon={isSearching ? <Loader2 className="w-4 h-4 text-[#B9E48C] animate-spin" /> : <Search className="w-4 h-4 text-[#F5F2E8]/60" />}
            error={error || undefined}
            helperText="Type city and press Enter or select from search suggestions"
          />

          {/* Premium High-Contrast Location Dropdown */}
          {showDropdown && searchResults.length > 0 && (
            <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-50 rounded-2xl bg-[#0D241C] border border-[#B9E48C]/35 overflow-hidden shadow-2xl shadow-black/90 backdrop-blur-2xl">
              <div className="bg-[#102A20] px-4 py-2 border-b border-white/10 flex items-center justify-between text-[11px] font-mono font-bold uppercase tracking-wider text-[#B9E48C]">
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#B9E48C]" /> Matching Locations
                </span>
                <span className="bg-[#B9E48C]/20 text-[#B9E48C] px-2 py-0.5 rounded-full text-[10px]">
                  {searchResults.length} {searchResults.length === 1 ? 'result' : 'results'}
                </span>
              </div>
              <ul className="max-h-60 overflow-y-auto divide-y divide-white/10">
                {searchResults.map((loc, idx) => (
                  <li key={`${loc.name}-${loc.latitude}-${idx}`}>
                    <button
                      type="button"
                      onClick={() => handleSelectLocation(loc)}
                      className="w-full text-left px-4 py-3 hover:bg-[#B9E48C]/20 focus:bg-[#B9E48C]/20 transition-all flex items-center justify-between gap-3 group cursor-pointer"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm text-[#F5F2E8] group-hover:text-[#B9E48C] transition-colors flex items-center gap-2">
                          <span>{loc.name}</span>
                        </div>
                        <div className="text-xs text-[#F5F2E8]/80 font-medium truncate mt-0.5">
                          {[loc.admin2, loc.admin1, loc.country].filter(Boolean).join(', ')}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-[11px] font-mono font-semibold text-[#A8D8E8] bg-[#A8D8E8]/10 px-2.5 py-1 rounded-lg border border-[#A8D8E8]/25 group-hover:border-[#B9E48C]/40 group-hover:text-[#B9E48C] transition-all">
                          {loc.latitude.toFixed(2)}°N, {loc.longitude.toFixed(2)}°E
                        </div>
                        <div className="text-[10px] font-mono text-[#F5F2E8]/60 mt-1">
                          {loc.timezone}
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="outline"
          size="md"
          isLoading={isLocating}
          onClick={handleUseCurrentLocation}
          leftIcon={<Navigation className="w-4 h-4 text-[#B9E48C]" />}
          className="shrink-0 mb-[1px] rounded-xl border-white/15 text-xs text-[#F5F2E8] hover:border-[#B9E48C]"
        >
          Use my current location
        </Button>
      </div>

      {selectedLocation && (
        <div className="p-3.5 rounded-xl glass-medium border-[#B9E48C]/30 bg-[#B9E48C]/5 text-xs flex flex-wrap items-center justify-between gap-2 text-[#B9E48C]">
          <span className="flex items-center gap-2 font-mono font-medium">
            <CheckCircle2 className="w-4 h-4 text-[#B9E48C] shrink-0" />
            <span>
              📍 {selectedLocation.name}
              {selectedLocation.admin1 ? `, ${selectedLocation.admin1}` : ''}
              {selectedLocation.country ? `, ${selectedLocation.country}` : ''}
            </span>
          </span>
          <span className="text-[10px] font-mono font-semibold text-[#A8D8E8] bg-[#A8D8E8]/10 px-2 py-0.5 rounded border border-[#A8D8E8]/20">
            {selectedLocation.latitude.toFixed(4)}° N · {selectedLocation.longitude.toFixed(4)}° E · {selectedLocation.timezone}
          </span>
        </div>
      )}
    </div>
  );
};
