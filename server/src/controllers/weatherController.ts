import { Request, Response, NextFunction } from 'express';
import { OpenMeteoWeatherProvider } from '../providers/weather/OpenMeteoWeatherProvider.js';
import { WeatherQuerySchema } from '../schemas/openMeteoSchema.js';

const weatherProvider = new OpenMeteoWeatherProvider();

export async function getWeather(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const parsed = WeatherQuerySchema.parse({
      latitude: req.query.latitude,
      longitude: req.query.longitude,
      hours: req.query.hours,
      locationName: req.query.locationName,
    });

    const snapshot = await weatherProvider.getWeatherByCoords({
      latitude: parsed.latitude,
      longitude: parsed.longitude,
      hours: parsed.hours,
      locationName: parsed.locationName,
    });

    res.status(200).json({
      success: true,
      data: snapshot,
    });
  } catch (err: unknown) {
    const errCode = (err as { code?: string })?.code;
    if (errCode === 'WEATHER_PROVIDER_UNAVAILABLE' || errCode === 'WEATHER_PROVIDER_TIMEOUT' || errCode === 'WEATHER_INVALID_RESPONSE') {
      res.status(503).json({
        success: false,
        error: {
          code: 'WEATHER_PROVIDER_UNAVAILABLE',
          message: 'Live weather data is temporarily unavailable.',
        },
      });
      return;
    }
    next(err);
  }
}
