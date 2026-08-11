import { WeatherProvider, WeatherProviderOptions } from './WeatherProvider.js';
import { WeatherSnapshot, WeatherHour, SuitabilityRating } from '../../types/index.js';
import { OpenMeteoForecastResponseSchema } from '../../schemas/openMeteoSchema.js';
import { mapWmoCodeToCondition } from '../../utils/wmoWeatherCode.js';
import { CacheService } from '../../utils/cache.js';
import { config } from '../../config/index.js';

export class OpenMeteoWeatherProvider implements WeatherProvider {
  private timeoutMs: number;

  constructor(timeoutMs?: number) {
    this.timeoutMs = timeoutMs || config.weatherCacheDurationMs || 8000;
  }

  async getWeather(location: string, latitude?: number, longitude?: number): Promise<WeatherSnapshot> {
    return this.getWeatherByCoords({
      locationName: location,
      latitude: latitude || 16.5062,
      longitude: longitude || 80.648,
      hours: 48,
    });
  }

  async getWeatherByCoords(options: WeatherProviderOptions): Promise<WeatherSnapshot> {
    const lat = options.latitude;
    const lon = options.longitude;
    const cacheKey = `weather:${lat.toFixed(2)}:${lon.toFixed(2)}`;

    // 1. Check in-memory 15-min cache
    const cached = CacheService.get<WeatherSnapshot>(cacheKey);
    if (cached) {
      return cached;
    }

    // 2. Build Open-Meteo URL
    const baseUrl = config.openMeteoForecastUrl;
    const params = new URLSearchParams({
      latitude: lat.toString(),
      longitude: lon.toString(),
      forecast_days: '3',
      timezone: 'auto',
      hourly: [
        'temperature_2m',
        'relative_humidity_2m',
        'precipitation_probability',
        'precipitation',
        'rain',
        'weather_code',
        'wind_speed_10m',
        'wind_gusts_10m',
        'dew_point_2m',
        'cloud_cover',
        'et0_fao_evapotranspiration',
      ].join(','),
    });

    const url = `${baseUrl}?${params.toString()}`;

    // 3. Fetch with timeout & 1 retry policy
    const rawData = await this.fetchWithRetry(url);

    // 4. Validate response with Zod
    const parseResult = OpenMeteoForecastResponseSchema.safeParse(rawData);
    if (!parseResult.success) {
      const err = new Error('WEATHER_INVALID_RESPONSE: Malformed forecast payload from Open-Meteo API.');
      (err as any).code = 'WEATHER_INVALID_RESPONSE';
      throw err;
    }

    const data = parseResult.data;

    // 5. Normalize response
    const snapshot = this.normalizeForecast(data, options);

    // 6. Cache for 15 minutes (15 * 60 * 1000 ms)
    CacheService.set(cacheKey, snapshot, 15 * 60 * 1000);

    return snapshot;
  }

  private async fetchWithRetry(url: string, attemptsLeft = 2): Promise<unknown> {
    while (attemptsLeft > 0) {
      attemptsLeft--;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);

        if (!response.ok) {
          if (attemptsLeft > 0 && response.status >= 500) {
            continue; // Transient retry
          }
          const err = new Error(`WEATHER_PROVIDER_UNAVAILABLE: Open-Meteo API returned HTTP status ${response.status}.`);
          (err as any).code = 'WEATHER_PROVIDER_UNAVAILABLE';
          throw err;
        }

        return await response.json();
      } catch (error: any) {
        clearTimeout(timeoutId);
        if (error.code === 'WEATHER_PROVIDER_UNAVAILABLE') {
          throw error;
        }
        if (attemptsLeft === 0) {
          const err = new Error(
            error.name === 'AbortError'
              ? `WEATHER_PROVIDER_TIMEOUT: Open-Meteo request timed out after ${this.timeoutMs}ms.`
              : `WEATHER_PROVIDER_UNAVAILABLE: ${error.message || 'Network fetch failed'}`
          );
          (err as any).code = error.name === 'AbortError' ? 'WEATHER_PROVIDER_TIMEOUT' : 'WEATHER_PROVIDER_UNAVAILABLE';
          throw err;
        }
      }
    }

    const err = new Error('WEATHER_PROVIDER_UNAVAILABLE: Open-Meteo request failed.');
    (err as any).code = 'WEATHER_PROVIDER_UNAVAILABLE';
    throw err;
  }

  private normalizeForecast(data: any, options: WeatherProviderOptions): WeatherSnapshot {
    const hourly = data.hourly;
    const totalCount = hourly.time.length;
    const hoursToTake = Math.min(options.hours || 48, totalCount);

    const hours: WeatherHour[] = [];

    for (let i = 0; i < hoursToTake; i++) {
      const rawIso = hourly.time[i];
      const temp = hourly.temperature_2m[i] ?? 0;
      const humidity = Math.min(100, Math.max(0, hourly.relative_humidity_2m[i] ?? 0));
      const rainProb = Math.min(100, Math.max(0, hourly.precipitation_probability[i] ?? 0));
      const precipMm = Math.max(0, hourly.precipitation[i] ?? 0);
      const rainMm = Math.max(0, hourly.rain[i] ?? 0);
      const wSpeed = Math.max(0, hourly.wind_speed_10m[i] ?? 0);
      const wGust = Math.max(0, hourly.wind_gusts_10m[i] ?? 0);
      const dewPoint = hourly.dew_point_2m[i] ?? 0;
      const cloudCover = Math.min(100, Math.max(0, hourly.cloud_cover[i] ?? 0));
      const wCode = hourly.weather_code[i] ?? 0;
      const et0 = hourly.et0_fao_evapotranspiration ? Math.max(0, hourly.et0_fao_evapotranspiration[i] ?? 0) : undefined;

      const mapped = mapWmoCodeToCondition(wCode);

      let suitability: SuitabilityRating = 'Optimal';
      let suitabilityReason = 'Favorable condition for agricultural treatment.';

      if (rainProb > 40 || precipMm > 0.5) {
        suitability = 'Unfavorable';
        suitabilityReason = `Rain probability ${rainProb}% will wash off foliage treatment.`;
      } else if (wSpeed > 15 || humidity > 85) {
        suitability = 'Marginal';
        suitabilityReason = `Wind speed ${wSpeed} km/h or humidity ${humidity}% increases drift risk.`;
      }

      hours.push({
        timestamp: rawIso,
        time: rawIso.includes('T') ? rawIso.split('T')[1].substring(0, 5) : rawIso,
        timezone: data.timezone,
        temperatureC: temp,
        relativeHumidityPct: humidity,
        humidityPercent: humidity,
        precipitationProbabilityPct: rainProb,
        rainfallProbabilityPercent: rainProb,
        precipitationMm: precipMm,
        rainMm,
        windSpeedKmh: wSpeed,
        windGustKmh: wGust,
        dewPointC: dewPoint,
        cloudCoverPct: cloudCover,
        weatherCode: wCode,
        conditionDescription: mapped.description,
        spraySuitability: suitability,
        suitabilityReason,
        et0Mm: et0,
      });
    }

    const fetchedAt = new Date().toISOString();
    const locName = options.locationName || `${data.latitude.toFixed(2)}°N, ${data.longitude.toFixed(2)}°E`;
    const firstHour = hours[0];

    return {
      locationName: locName,
      location: locName,
      latitude: data.latitude,
      longitude: data.longitude,
      elevation: data.elevation,
      fetchedAt,
      retrievedAt: fetchedAt,
      timezone: data.timezone,
      currentTempC: firstHour ? firstHour.temperatureC : 25,
      currentHumidity: firstHour ? firstHour.relativeHumidityPct : 65,
      currentWindSpeedKmh: firstHour ? firstHour.windSpeedKmh : 8,
      currentCondition: firstHour ? firstHour.conditionDescription : 'Clear sky',
      forecastHorizonHours: hours.length,
      hourlyForecast: hours,
      hours,
      provider: 'open-meteo',
      sourceMetadata: {
        provider: 'open-meteo',
        providerUrl: 'https://api.open-meteo.com/v1/forecast',
        retrievedAt: fetchedAt,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
        forecastDays: 3,
        attribution: 'Weather data by Open-Meteo',
      },
    };
  }
}
