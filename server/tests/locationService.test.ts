import { describe, it, expect, vi, beforeEach } from 'vitest';
import { LocationService } from '../src/services/locationService.js';
import { CacheService } from '../src/utils/cache.js';
import geocodingFixture from './fixtures/open-meteo-geocoding.json';

describe('LocationService Geocoding Integration', () => {
  beforeEach(() => {
    CacheService.clear();
    vi.restoreAllMocks();
  });

  it('searches and normalizes location query successfully', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(JSON.stringify(geocodingFixture), { status: 200 });
    });

    const results = await LocationService.searchLocations('Vijayawada');
    expect(results.length).toBe(1);

    const first = results[0];
    expect(first.name).toBe('Vijayawada');
    expect(first.country).toBe('India');
    expect(first.admin1).toBe('Andhra Pradesh');
    expect(first.latitude).toBe(16.50617);
    expect(first.longitude).toBe(80.64801);
    expect(first.timezone).toBe('Asia/Kolkata');
  });

  it('caches location search results for 24 hours', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async () => {
      return new Response(JSON.stringify(geocodingFixture), { status: 200 });
    });

    await LocationService.searchLocations('Vijayawada');
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    await LocationService.searchLocations('Vijayawada');
    expect(fetchSpy).toHaveBeenCalledTimes(1); // Served from 24h cache!
  });

  it('rejects query shorter than 2 characters', async () => {
    await expect(LocationService.searchLocations('A')).rejects.toThrow();
  });
});
