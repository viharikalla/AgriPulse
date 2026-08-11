import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const ServerEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5001),
  MONGODB_URI: z.string().optional(),
  SESSION_SECRET: z.string().default('agripulse_development_secret_key_32bytes'),
  CLIENT_ORIGIN: z.string().default('http://localhost:3000'),
  OPEN_METEO_FORECAST_URL: z.string().url().default('https://api.open-meteo.com/v1/forecast'),
  OPEN_METEO_GEOCODING_URL: z.string().url().default('https://geocoding-api.open-meteo.com/v1/search'),
  WEATHER_PROVIDER_TIMEOUT_MS: z.coerce.number().default(8000),
  MAX_IMAGE_SIZE_BYTES: z.coerce.number().default(10 * 1024 * 1024),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),
  AI_PROVIDER: z.enum(['mock', 'gemini']).default('mock'),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default('gemini-3.5-flash-lite'),
  GEMINI_TIMEOUT_MS: z.coerce.number().default(15000),
  GEMINI_MIN_CONFIDENCE: z.coerce.number().default(0.7),
});

const parsedEnv = ServerEnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  const errorMsg = parsedEnv.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
  console.error(`[AgriPulse Server Config Error] Invalid environment configuration: ${errorMsg}`);
  process.exit(1);
}

const envConfig = parsedEnv.data;

// Startup Validation: GEMINI_API_KEY is strictly required only when AI_PROVIDER === 'gemini'
if (envConfig.AI_PROVIDER === 'gemini' && (!envConfig.GEMINI_API_KEY || envConfig.GEMINI_API_KEY.trim() === '')) {
  console.error(`[AgriPulse Server Config Error] GEMINI_API_KEY is required when AI_PROVIDER is set to 'gemini'.`);
  if (envConfig.NODE_ENV !== 'test') {
    process.exit(1);
  }
}

export const config = {
  env: envConfig.NODE_ENV,
  port: envConfig.PORT,
  mongoUri: envConfig.MONGODB_URI || '',
  sessionSecret: envConfig.SESSION_SECRET,
  clientOrigin: envConfig.CLIENT_ORIGIN,
  openMeteoForecastUrl: envConfig.OPEN_METEO_FORECAST_URL,
  openMeteoGeocodingUrl: envConfig.OPEN_METEO_GEOCODING_URL,
  maxImageSizeBytes: envConfig.MAX_IMAGE_SIZE_BYTES,
  allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  rateLimitWindowMs: envConfig.RATE_LIMIT_WINDOW_MS,
  rateLimitMaxRequests: envConfig.RATE_LIMIT_MAX_REQUESTS,
  weatherCacheDurationMs: envConfig.WEATHER_PROVIDER_TIMEOUT_MS,
  analysisTimeoutMs: 15000,
  assistantTimeoutMs: 10000,
  aiProvider: envConfig.AI_PROVIDER,
  geminiApiKey: envConfig.GEMINI_API_KEY || '',
  geminiModel: envConfig.GEMINI_MODEL,
  geminiTimeoutMs: envConfig.GEMINI_TIMEOUT_MS,
  geminiMinConfidence: envConfig.GEMINI_MIN_CONFIDENCE,
};
