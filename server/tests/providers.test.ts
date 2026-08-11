import { describe, it, expect } from 'vitest';
import { MockAIProvider } from '../src/providers/ai/MockAIProvider.js';
import { MockWeatherProvider } from '../src/providers/weather/MockWeatherProvider.js';

describe('Provider Abstractions', () => {
  it('MockAIProvider returns structured crop assessment', async () => {
    const ai = new MockAIProvider();
    const mockBuffer = Buffer.from('fake-image-data');
    const result = await ai.analyzeCrop(mockBuffer, 'image/jpeg', 'Tomato', 'Vijayawada, AP');

    expect(result.cropName).toBe('Tomato');
    expect(result.primaryCondition.name).toContain('Early Blight');
    expect(result.confidenceLevel).toBe('High');
    expect(result.confidenceScore).toBeGreaterThan(0.9);
  });

  it('MockAIProvider answers agronomic field questions', async () => {
    const ai = new MockAIProvider();
    const answer = await ai.answerFieldQuestion('What if it rains early?', 'Tomato');
    expect(answer).toContain('postpone application');
  });

  it('MockWeatherProvider returns hourly forecast snapshot', async () => {
    const weather = new MockWeatherProvider();
    const snapshot = await weather.getWeather('Vijayawada, AP', 16.5062, 80.648);

    expect(snapshot.locationName).toBe('Vijayawada, AP');
    expect(snapshot.currentTempC).toBeGreaterThan(0);
    expect(snapshot.hourlyForecast.length).toBeGreaterThan(0);
    expect(snapshot.hourlyForecast[0]).toHaveProperty('spraySuitability');
  });
});
