import { WeatherProvider, WeatherProviderOptions } from './WeatherProvider.js';
import { WeatherSnapshot, WeatherHour } from '../../types/index.js';

export class MockWeatherProvider implements WeatherProvider {
  async getWeather(location: string, latitude?: number, longitude?: number): Promise<WeatherSnapshot> {
    return this.getWeatherByCoords({
      locationName: location,
      latitude: latitude || 16.5062,
      longitude: longitude || 80.648,
      hours: 48,
    });
  }

  async getWeatherByCoords(options: WeatherProviderOptions): Promise<WeatherSnapshot> {
    const fetchedAt = new Date().toISOString();
    const locName = options.locationName || 'Vijayawada, Andhra Pradesh';

    const hourlyForecast: WeatherHour[] = [
      {
        timestamp: '2026-08-10T14:00:00Z',
        time: '14:00',
        timezone: 'Asia/Kolkata',
        temperatureC: 29,
        relativeHumidityPct: 78,
        humidityPercent: 78,
        precipitationProbabilityPct: 82,
        rainfallProbabilityPercent: 82,
        precipitationMm: 2.5,
        rainMm: 2.5,
        windSpeedKmh: 8,
        windGustKmh: 14,
        dewPointC: 24,
        cloudCoverPct: 90,
        weatherCode: 63,
        conditionDescription: 'Scattered Showers',
        spraySuitability: 'Unfavorable',
        suitabilityReason: 'Rain probability 82% will wash off spray treatment.',
        et0Mm: 0.45,
      },
      {
        timestamp: '2026-08-10T17:00:00Z',
        time: '17:00',
        timezone: 'Asia/Kolkata',
        temperatureC: 28,
        relativeHumidityPct: 70,
        humidityPercent: 70,
        precipitationProbabilityPct: 40,
        rainfallProbabilityPercent: 40,
        precipitationMm: 0.5,
        rainMm: 0.5,
        windSpeedKmh: 9,
        windGustKmh: 15,
        dewPointC: 23,
        cloudCoverPct: 75,
        weatherCode: 61,
        conditionDescription: 'Overcast',
        spraySuitability: 'Marginal',
        suitabilityReason: 'Moderate soil moisture, potential rain risk.',
        et0Mm: 0.35,
      },
      {
        timestamp: '2026-08-11T07:00:00Z',
        time: 'Tomorrow 07:00',
        timezone: 'Asia/Kolkata',
        temperatureC: 25,
        relativeHumidityPct: 65,
        humidityPercent: 65,
        precipitationProbabilityPct: 10,
        rainfallProbabilityPercent: 10,
        precipitationMm: 0.0,
        rainMm: 0.0,
        windSpeedKmh: 7,
        windGustKmh: 10,
        dewPointC: 21,
        cloudCoverPct: 20,
        weatherCode: 1,
        conditionDescription: 'Clear Sky',
        spraySuitability: 'Optimal',
        suitabilityReason: 'Optimal spray window: wind < 8 km/h and rain probability 10%.',
        et0Mm: 0.15,
      },
    ];

    return {
      locationName: locName,
      location: locName,
      latitude: options.latitude,
      longitude: options.longitude,
      elevation: 23.0,
      fetchedAt,
      retrievedAt: fetchedAt,
      timezone: 'Asia/Kolkata',
      currentTempC: 29,
      currentHumidity: 78,
      currentWindSpeedKmh: 8,
      currentCondition: 'Partly cloudy with scattered showers',
      forecastHorizonHours: options.hours || 48,
      hourlyForecast,
      hours: hourlyForecast,
      provider: 'mock',
      sourceMetadata: {
        provider: 'mock',
        providerUrl: 'https://api.open-meteo.com/v1/forecast',
        retrievedAt: fetchedAt,
        latitude: options.latitude,
        longitude: options.longitude,
        timezone: 'Asia/Kolkata',
        forecastDays: 3,
        attribution: 'Weather data by Open-Meteo',
      },
    };
  }
}
