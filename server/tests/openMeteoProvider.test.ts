import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OpenMeteoWeatherProvider } from '../src/providers/weather/OpenMeteoWeatherProvider.js';
import { CacheService } from '../src/utils/cache.js';
import forecastFixture from './fixtures/open-meteo-forecast.json';

describe('OpenMeteoWeatherProvider Real Weather Integration', () => {
  beforeEach(() => {
    CacheService.clear();
    vi.restoreAllMocks();
  });

  it('normalizes Open-Meteo API response correctly', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(JSON.stringify(forecastFixture), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    });

    const provider = new OpenMeteoWeatherProvider();
    const result = await provider.getWeatherByCoords({
      locationName: 'Vijayawada, AP',
      latitude: 16.5062,
      longitude: 80.648,
    });

    expect(result.provider).toBe('open-meteo');
    expect(result.timezone).toBe('Asia/Kolkata');
    expect(result.latitude).toBe(16.5);
    expect(result.longitude).toBe(80.625);
    expect(result.sourceMetadata.attribution).toBe('Weather data by Open-Meteo');
    expect(result.hourlyForecast.length).toBeGreaterThan(0);

    const firstHour = result.hourlyForecast[0];
    expect(firstHour.temperatureC).toBe(29.2);
    expect(firstHour.relativeHumidityPct).toBe(78);
    expect(firstHour.precipitationProbabilityPct).toBe(82);
    expect(firstHour.precipitationMm).toBe(2.5);
    expect(firstHour.conditionDescription).toBe('Moderate rain');
  });

  it('serves cached weather snapshot on second request within 15 mins', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(JSON.stringify(forecastFixture), { status: 200 });
    });

    const provider = new OpenMeteoWeatherProvider();

    // First call -> triggers network fetch
    await provider.getWeatherByCoords({ latitude: 16.51, longitude: 80.65 });
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    // Second call -> serves from cache
    await provider.getWeatherByCoords({ latitude: 16.51, longitude: 80.65 });
    expect(fetchSpy).toHaveBeenCalledTimes(1); // Call count unchanged!
  });

  it('throws WEATHER_INVALID_RESPONSE on malformed JSON payload', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(JSON.stringify({ malformed: true }), { status: 200 });
    });

    const provider = new OpenMeteoWeatherProvider();

    await expect(
      provider.getWeatherByCoords({ latitude: 16.51, longitude: 80.65 })
    ).rejects.toThrow('WEATHER_INVALID_RESPONSE');
  });

  it('retries at most 1 time for transient 500 server errors', async () => {
    let callCount = 0;
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      callCount++;
      if (callCount === 1) {
        return new Response('Internal Server Error', { status: 500 });
      }
      return new Response(JSON.stringify(forecastFixture), { status: 200 });
    });

    const provider = new OpenMeteoWeatherProvider();
    const result = await provider.getWeatherByCoords({ latitude: 16.51, longitude: 80.65 });

    expect(callCount).toBe(2); // Exactly 1 retry
    expect(result.provider).toBe('open-meteo');
  });

  it('handles timeout gracefully when request exceeds timeoutMs', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async (_url, options: any) => {
      return new Promise((_, reject) => {
        const signal = options?.signal;
        if (signal) {
          signal.addEventListener('abort', () => {
            const err = new Error('The operation was aborted');
            err.name = 'AbortError';
            reject(err);
          });
        }
      });
    });

    const provider = new OpenMeteoWeatherProvider(100); // 100ms timeout

    await expect(
      provider.getWeatherByCoords({ latitude: 16.51, longitude: 80.65 })
    ).rejects.toThrow('WEATHER_PROVIDER_TIMEOUT');
  });
});
