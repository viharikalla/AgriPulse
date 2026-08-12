import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SupportedCropName, ResolvedLocation, WeatherSnapshot } from '../types';
import { FieldImageUploader, ImageMeta } from '../components/field/FieldImageUploader';
import { CropSelector } from '../components/field/CropSelector';
import { LocationCard } from '../components/field/LocationCard';
import { WeatherPreview } from '../components/weather/WeatherPreview';
import { StagedAnalysisModal } from '../components/ai/StagedAnalysisModal';
import { SUPPORTED_CROPS } from '../config/crops';
import { Card, Button } from '../components/ui';
import { getAdvisoryDetailPath } from '../config/routes';
import { ApiClient } from '../services/apiClient';
import { Sprout, ArrowRight, CheckCircle2 } from 'lucide-react';

const DEFAULT_LOCATION: ResolvedLocation = {
  name: 'Vijayawada',
  admin1: 'Andhra Pradesh',
  country: 'India',
  latitude: 16.5062,
  longitude: 80.648,
  timezone: 'Asia/Kolkata',
};

export const AnalyzePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const rawCrop = searchParams.get('crop');
  const queryCrop = SUPPORTED_CROPS.find((c) => c.name === rawCrop)?.name || null;
  const [crop, setCrop] = useState<SupportedCropName>(queryCrop || 'Tomato');
  const [locationText, setLocationText] = useState('Vijayawada, Andhra Pradesh');
  const [selectedLocation, setSelectedLocation] = useState<ResolvedLocation | null>(DEFAULT_LOCATION);
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [isWeatherLoading, setIsWeatherLoading] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<ImageMeta | null>(null);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    if (queryCrop) {
      setCrop(queryCrop);
    }
  }, [queryCrop]);

  // Fetch Weather for Current Selected Location Coordinates
  const fetchWeather = useCallback(async (loc: ResolvedLocation) => {
    setIsWeatherLoading(true);
    setWeatherError(null);
    setWeather(null);

    try {
      const locName = `${loc.name}${loc.admin1 ? `, ${loc.admin1}` : ''}`;
      const snapshot = await ApiClient.getWeather(loc.latitude, loc.longitude, locName);

      if (snapshot) {
        setWeather(snapshot);
      } else {
        setWeatherError('Live weather data is temporarily unavailable.');
      }
    } catch {
      setWeatherError('Live weather data is temporarily unavailable.');
    } finally {
      setIsWeatherLoading(false);
    }
  }, []);

  // Refetch weather whenever selectedLocation coordinates change
  useEffect(() => {
    if (selectedLocation) {
      fetchWeather(selectedLocation);
    }
  }, [selectedLocation?.latitude, selectedLocation?.longitude, fetchWeather]);

  // Validation: Button disabled until image exists, crop is selected, location exists, and not analyzing
  const isFormValid = Boolean(photoUrl) && Boolean(crop) && Boolean(locationText.trim()) && !uploadError && !isAnalyzing;

  const executeAnalysis = async () => {
    if (!photoUrl || !crop || !locationText.trim() || isAnalyzing) return;

    setIsAnalyzing(true);
    setAnalysisError(null);
    setIsModalOpen(true);

    try {
      const loc = selectedLocation || DEFAULT_LOCATION;
      const result = await ApiClient.analyzeField({
        crop,
        location: locationText,
        latitude: loc.latitude,
        longitude: loc.longitude,
        photoUrl: photoUrl || undefined,
        imageFile: photoFile || undefined,
      });

      setIsModalOpen(false);
      setIsAnalyzing(false);
      navigate(getAdvisoryDetailPath(result.id));
    } catch (err: unknown) {
      setIsAnalyzing(false);
      setAnalysisError(err instanceof Error ? err.message : 'Field analysis service is temporarily unavailable. Please try again.');
    }
  };

  const handleStartAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    executeAnalysis();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-300 pb-16">
      {/* Page Header */}
      <div>
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B9E48C] flex items-center gap-1.5 mb-1">
          <Sprout className="w-3.5 h-3.5" /> FIELD DECISION PROTOCOL
        </span>
        <h1 className="font-serif italic text-3xl sm:text-5xl text-[#F5F2E8]">
          Let's read <span className="not-italic font-heading font-extrabold text-[#B9E48C]">the field.</span>
        </h1>
        <p className="text-xs sm:text-sm text-[#F5F2E8]/70 mt-1">
          Upload a clear crop photo. We'll combine what the plant shows with what the sky is about to do.
        </p>
      </div>

      {/* 3-Stage Progress Steps Banner */}
      <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl glass-medium border-white/12 shadow-glass-sm text-center font-mono text-xs">
        <div className={`p-2.5 rounded-xl transition-colors ${photoUrl ? 'glass-deep text-[#B9E48C] border-white/20' : 'glass-light text-[#F5F2E8]/50'}`}>
          <span className="text-[10px] uppercase font-bold block">01 FIELD EVIDENCE</span>
          <span className="text-xs font-bold">{photoUrl ? '✓ Photo Ready' : '● Upload Photo'}</span>
        </div>
        <div className={`p-2.5 rounded-xl transition-colors ${locationText ? 'glass-deep text-[#A8D8E8] border-white/20' : 'glass-light text-[#F5F2E8]/50'}`}>
          <span className="text-[10px] uppercase font-bold block">02 CONDITIONS</span>
          <span className="text-xs font-bold">{locationText ? '✓ Geocoded' : '● Detect Location'}</span>
        </div>
        <div className={`p-2.5 rounded-xl transition-colors ${isFormValid ? 'glass-deep text-[#EBCB78] border-white/20' : 'glass-light text-[#F5F2E8]/50'}`}>
          <span className="text-[10px] uppercase font-bold block">03 ADVISORY</span>
          <span className="text-xs font-bold">{isFormValid ? '● Ready to Analyze' : '○ Pending Inputs'}</span>
        </div>
      </div>

      {/* Main Guided Form */}
      <form onSubmit={handleStartAnalysis} className="space-y-8">
        {/* STAGE 01: FIELD EVIDENCE */}
        <Card glassLevel="deep" className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#B9E48C]">
                STAGE 01
              </span>
              <h2 className="font-heading text-lg font-bold text-[#F5F2E8]">FIELD EVIDENCE</h2>
            </div>
            {photoUrl && (
              <span className="text-xs font-mono text-[#B9E48C] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Ready
              </span>
            )}
          </div>

          <FieldImageUploader
            photoUrl={photoUrl}
            imageMeta={imageMeta}
            onPhotoSelected={(url, meta, file) => {
              setPhotoUrl(url);
              setImageMeta(meta);
              if (file) setPhotoFile(file);
              setUploadError(null);
            }}
            onPhotoCleared={() => {
              setPhotoUrl(null);
              setPhotoFile(null);
              setImageMeta(null);
            }}
            error={uploadError}
            setError={setUploadError}
          />

          <CropSelector
            selectedCrop={crop}
            onCropChange={(selected) => setCrop(selected)}
          />
        </Card>

        {/* STAGE 02: CONDITIONS */}
        <Card glassLevel="deep" className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A8D8E8]">
                STAGE 02
              </span>
              <h2 className="font-heading text-lg font-bold text-[#F5F2E8]">CONDITIONS</h2>
            </div>
            {locationText && (
              <span className="text-xs font-mono text-[#A8D8E8] flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Location Set
              </span>
            )}
          </div>

          <LocationCard
            value={locationText}
            selectedLocation={selectedLocation}
            onChange={(val) => setLocationText(val)}
            onSelectLocation={(loc) => setSelectedLocation(loc)}
          />

          <WeatherPreview
            weather={weather}
            isLoading={isWeatherLoading}
            error={weatherError}
            locationName={locationText}
            onRetry={() => selectedLocation && fetchWeather(selectedLocation)}
          />
        </Card>

        {/* STAGE 03: ADVISORY & ANALYZE BUTTON */}
        <Card glassLevel="deep" className="p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#EBCB78]">
                STAGE 03
              </span>
              <h2 className="font-heading text-lg font-bold text-[#F5F2E8]">ADVISORY SYNTHESIS</h2>
            </div>
            <span className={`text-xs font-mono ${isFormValid ? 'text-[#B9E48C]' : 'text-[#F5F2E8]/40'}`}>
              {isFormValid ? 'Ready' : 'Incomplete Inputs'}
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <p className="text-xs text-[#F5F2E8]/70 max-w-md leading-relaxed">
              Clicking analyze runs progressive visual disease diagnosis and scans micro-weather forecast windows.
            </p>

            <Button
              type="submit"
              size="lg"
              disabled={!isFormValid}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full sm:w-auto bg-[#B9E48C] text-[#07130F] hover:bg-[#a6d877] font-semibold text-sm shadow-glow-living border-0 disabled:opacity-40 disabled:shadow-none"
            >
              {isAnalyzing ? 'Analyzing field...' : 'Analyze my field →'}
            </Button>
          </div>
        </Card>
      </form>

      {/* Real HTTP Analysis Loading Modal & Retry Interface */}
      <StagedAnalysisModal
        isOpen={isModalOpen}
        isAnalyzing={isAnalyzing}
        error={analysisError}
        onRetry={executeAnalysis}
        onClose={() => {
          setIsModalOpen(false);
          setAnalysisError(null);
        }}
      />
    </div>
  );
};
