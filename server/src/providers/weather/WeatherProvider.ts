import { WeatherSnapshot } from '../../types/index.js';

export interface WeatherProviderOptions {
  locationName?: string;
  latitude: number;
  longitude: number;
  hours?: number;
}

export interface WeatherProvider {
  getWeather(location: string, latitude?: number, longitude?: number): Promise<WeatherSnapshot>;
  getWeatherByCoords(options: WeatherProviderOptions): Promise<WeatherSnapshot>;
}
