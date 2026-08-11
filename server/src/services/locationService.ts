import { ResolvedLocation } from '../types/index.js';
import { OpenMeteoGeocodingResponseSchema, LocationQuerySchema } from '../schemas/openMeteoSchema.js';
import { CacheService } from '../utils/cache.js';
import { config } from '../config/index.js';

export class LocationService {
  private static timeoutMs = 8000;

  public static async searchLocations(query: string, countryCode = 'IN'): Promise<ResolvedLocation[]> {
    // 1. Validate Query
    const parsed = LocationQuerySchema.parse({ q: query.trim() });
    const cleanQuery = parsed.q;
    const cacheKey = `geo:${countryCode}:${cleanQuery.toLowerCase()}`;

    // 2. Check 24-hr in-memory cache
    const cached = CacheService.get<ResolvedLocation[]>(cacheKey);
    if (cached) {
      return cached;
    }

    // 3. Construct Open-Meteo Geocoding URL
    const baseUrl = config.openMeteoGeocodingUrl;
    const params = new URLSearchParams({
      name: cleanQuery,
      count: '5',
    });
    if (countryCode) {
      params.append('countryCode', countryCode);
    }

    const url = `${baseUrl}?${params.toString()}`;

    // 4. Fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Location geocoding API returned HTTP status ${response.status}.`);
      }

      const rawJson = await response.json();
      const parseResult = OpenMeteoGeocodingResponseSchema.safeParse(rawJson);

      if (!parseResult.success) {
        throw new Error('Malformed geocoding response from Open-Meteo API.');
      }

      const results = parseResult.data.results || [];

      // 5. Normalize response
      const locations: ResolvedLocation[] = results.map((item) => ({
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        country: item.country || 'India',
        admin1: item.admin1,
        admin2: item.admin2,
        timezone: item.timezone || 'Asia/Kolkata',
        elevation: item.elevation,
      }));

      // 6. Cache for 24 hours (24 * 60 * 60 * 1000 ms)
      CacheService.set(cacheKey, locations, 24 * 60 * 60 * 1000);

      return locations;
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') {
        throw new Error(`Location search timed out after ${this.timeoutMs}ms.`);
      }
      throw err;
    }
  }
}
