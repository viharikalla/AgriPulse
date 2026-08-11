export type NormalizedCondition =
  | 'clear'
  | 'partly_cloudy'
  | 'cloudy'
  | 'fog'
  | 'drizzle'
  | 'rain'
  | 'heavy_rain'
  | 'snow'
  | 'thunderstorm'
  | 'unknown';

export function mapWmoCodeToCondition(code: number): { condition: NormalizedCondition; description: string } {
  switch (code) {
    case 0:
      return { condition: 'clear', description: 'Clear sky' };
    case 1:
      return { condition: 'clear', description: 'Mainly clear' };
    case 2:
      return { condition: 'partly_cloudy', description: 'Partly cloudy' };
    case 3:
      return { condition: 'cloudy', description: 'Overcast' };
    case 45:
    case 48:
      return { condition: 'fog', description: 'Depositing rime fog' };
    case 51:
    case 53:
    case 55:
      return { condition: 'drizzle', description: 'Light to dense drizzle' };
    case 56:
    case 57:
      return { condition: 'drizzle', description: 'Freezing drizzle' };
    case 61:
      return { condition: 'rain', description: 'Slight rain' };
    case 63:
      return { condition: 'rain', description: 'Moderate rain' };
    case 65:
      return { condition: 'heavy_rain', description: 'Heavy intensity rain' };
    case 66:
    case 67:
      return { condition: 'heavy_rain', description: 'Freezing heavy rain' };
    case 71:
    case 73:
    case 75:
    case 77:
      return { condition: 'snow', description: 'Snow fall' };
    case 80:
    case 81:
      return { condition: 'rain', description: 'Rain showers' };
    case 82:
      return { condition: 'heavy_rain', description: 'Violent rain showers' };
    case 85:
    case 86:
      return { condition: 'snow', description: 'Snow showers' };
    case 95:
      return { condition: 'thunderstorm', description: 'Thunderstorm' };
    case 96:
    case 99:
      return { condition: 'thunderstorm', description: 'Thunderstorm with heavy hail' };
    default:
      return { condition: 'unknown', description: `Unspecified weather code (${code})` };
  }
}
