import { z } from 'zod';

export const OpenMeteoHourlyUnitsSchema = z.object({
  time: z.string().optional(),
  temperature_2m: z.string().optional(),
  relative_humidity_2m: z.string().optional(),
  precipitation_probability: z.string().optional(),
  precipitation: z.string().optional(),
  rain: z.string().optional(),
  weather_code: z.string().optional(),
  wind_speed_10m: z.string().optional(),
  wind_gusts_10m: z.string().optional(),
  dew_point_2m: z.string().optional(),
  cloud_cover: z.string().optional(),
  et0_fao_evapotranspiration: z.string().optional(),
});

export const OpenMeteoHourlyDataSchema = z.object({
  time: z.array(z.string()),
  temperature_2m: z.array(z.number()),
  relative_humidity_2m: z.array(z.number()),
  precipitation_probability: z.array(z.number()),
  precipitation: z.array(z.number()),
  rain: z.array(z.number()),
  weather_code: z.array(z.number()),
  wind_speed_10m: z.array(z.number()),
  wind_gusts_10m: z.array(z.number()),
  dew_point_2m: z.array(z.number()),
  cloud_cover: z.array(z.number()),
  et0_fao_evapotranspiration: z.array(z.number()).optional(),
});

export const OpenMeteoForecastResponseSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  generationtime_ms: z.number().optional(),
  utc_offset_seconds: z.number().optional(),
  timezone: z.string(),
  timezone_abbreviation: z.string().optional(),
  elevation: z.number().optional(),
  hourly_units: OpenMeteoHourlyUnitsSchema.optional(),
  hourly: OpenMeteoHourlyDataSchema,
});

export const OpenMeteoGeocodingResultSchema = z.object({
  id: z.number().optional(),
  name: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  elevation: z.number().optional(),
  feature_code: z.string().optional(),
  country_code: z.string().optional(),
  country: z.string().optional(),
  admin1: z.string().optional(),
  admin2: z.string().optional(),
  timezone: z.string().optional(),
  population: z.number().optional(),
});

export const OpenMeteoGeocodingResponseSchema = z.object({
  results: z.array(OpenMeteoGeocodingResultSchema).optional(),
  generationtime_ms: z.number().optional(),
});

export const WeatherQuerySchema = z.object({
  latitude: z.coerce.number().min(-90, 'Latitude must be between -90 and 90').max(90),
  longitude: z.coerce.number().min(-180, 'Longitude must be between -180 and 180').max(180),
  hours: z.coerce.number().min(1).max(72).optional().default(48),
  locationName: z.string().optional(),
});

export const LocationQuerySchema = z.object({
  q: z.string().min(2, 'Search query must be at least 2 characters').max(100, 'Search query too long'),
});
