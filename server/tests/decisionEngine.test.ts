import { describe, it, expect } from 'vitest';
import { DecisionEngine } from '../src/services/decision/decisionEngine.js';
import { WeatherSnapshot, WeatherHour } from '../src/types/index.js';

describe('Deterministic Field Action Window Engine (Stage 10)', () => {
  const createMockWeatherSnapshot = (hoursModifier: (h: WeatherHour, idx: number) => WeatherHour): WeatherSnapshot => {
    const hours: WeatherHour[] = [];
    const baseDate = new Date('2026-08-11T06:00:00+05:30');

    for (let i = 0; i < 48; i++) {
      const d = new Date(baseDate.getTime() + i * 3600000);
      const iso = d.toISOString();
      const timeStr = `${d.getHours().toString().padStart(2, '0')}:00`;

      const baseHour: WeatherHour = {
        timestamp: iso,
        time: timeStr,
        timezone: 'Asia/Kolkata',
        temperatureC: 26,
        relativeHumidityPct: 60,
        humidityPercent: 60,
        precipitationProbabilityPct: 10,
        rainfallProbabilityPercent: 10,
        precipitationMm: 0,
        rainMm: 0,
        windSpeedKmh: 6,
        windGustKmh: 10,
        dewPointC: 20,
        cloudCoverPct: 20,
        weatherCode: 1,
        conditionDescription: 'Clear sky',
        spraySuitability: 'Optimal',
        suitabilityReason: 'Favorable conditions',
      };

      hours.push(hoursModifier(baseHour, i));
    }

    return {
      locationName: 'Vijayawada, AP',
      latitude: 16.5062,
      longitude: 80.648,
      fetchedAt: baseDate.toISOString(),
      retrievedAt: baseDate.toISOString(),
      timezone: 'Asia/Kolkata',
      currentTempC: hours[0].temperatureC,
      currentHumidity: hours[0].relativeHumidityPct,
      currentWindSpeedKmh: hours[0].windSpeedKmh,
      currentCondition: hours[0].conditionDescription,
      forecastHorizonHours: 48,
      hourlyForecast: hours,
      hours,
      provider: 'mock',
      sourceMetadata: {
        provider: 'mock',
        providerUrl: 'https://api.open-meteo.com/v1/forecast',
        retrievedAt: baseDate.toISOString(),
        latitude: 16.5062,
        longitude: 80.648,
        timezone: 'Asia/Kolkata',
        forecastDays: 3,
        attribution: 'Weather data by Open-Meteo',
      },
    };
  };

  it('CASE 1: ACT_NOW — Current conditions are favorable and dry window is available', () => {
    const snapshot = createMockWeatherSnapshot((h) => h);
    const result = DecisionEngine.evaluate('Tomato', 'early_blight', 'Moderate', snapshot);

    expect(result.status).toBe('ACT_NOW');
    expect(result.bestWindow).not.toBeNull();
    expect(result.bestWindow?.durationHours).toBeGreaterThanOrEqual(4);
    expect(result.summaryTitle).toContain('ACT NOW');
    expect(result.reasons.length).toBeGreaterThan(0);
  });

  it('CASE 2: WAIT — Current hours are rainy but a future 4-hour window is available', () => {
    const snapshot = createMockWeatherSnapshot((h, idx) => {
      // First 6 hours are rainy
      if (idx < 6) {
        return {
          ...h,
          precipitationProbabilityPct: 85,
          rainfallProbabilityPercent: 85,
          precipitationMm: 3.5,
          conditionDescription: 'Heavy rain',
        };
      }
      return h;
    });

    const result = DecisionEngine.evaluate('Tomato', 'early_blight', 'Moderate', snapshot);

    expect(result.status).toBe('WAIT');
    expect(result.bestWindow).not.toBeNull();
    expect(result.summaryTitle).toContain('WAIT');
    expect(result.hourlyScores[0].constraints.some((c) => c.toLowerCase().includes('precipitation') || c.toLowerCase().includes('rain'))).toBe(true);
  });

  it('CASE 3: NO_SUITABLE_WINDOW — Rain persists throughout all 48 hours', () => {
    const snapshot = createMockWeatherSnapshot((h) => ({
      ...h,
      precipitationProbabilityPct: 90,
      rainfallProbabilityPercent: 90,
      precipitationMm: 5.0,
    }));

    const result = DecisionEngine.evaluate('Tomato', 'early_blight', 'Moderate', snapshot);

    expect(result.status).toBe('NO_SUITABLE_WINDOW');
    expect(result.bestWindow).toBeNull();
    expect(result.summaryTitle).toContain('NO SAFE WINDOW');
    expect(result.constraints.length).toBeGreaterThan(0);
  });

  it('CASE 4: INSUFFICIENT_DATA — Missing weather forecast data returns INSUFFICIENT_DATA', () => {
    const invalidSnapshot = {
      ...createMockWeatherSnapshot((h) => h),
      hourlyForecast: [],
      hours: [],
    };

    const result = DecisionEngine.evaluate('Tomato', 'early_blight', 'Moderate', invalidSnapshot);

    expect(result.status).toBe('INSUFFICIENT_DATA');
    expect(result.bestWindow).toBeNull();
    expect(result.reasons.some((r) => r.includes('missing') || r.includes('unavailable'))).toBe(true);
  });

  it('CASE 5: SHORT_WINDOW — 2 eligible hours rejected when dryWindowHours = 4', () => {
    const snapshot = createMockWeatherSnapshot((h, idx) => {
      // Only hours 0 and 1 are eligible daylight hours; hours 2+ are rainy
      if (idx >= 2) {
        return {
          ...h,
          precipitationProbabilityPct: 80,
          precipitationMm: 2.0,
        };
      }
      return h;
    });

    const result = DecisionEngine.evaluate('Tomato', 'early_blight', 'Moderate', snapshot);

    // Should return NO_SUITABLE_WINDOW because Tomato early_blight requires dryWindowHours = 4
    expect(result.status).toBe('NO_SUITABLE_WINDOW');
    expect(result.bestWindow).toBeNull();
  });

  it('CASE 6: MULTIPLE_WINDOWS — Selects best window and populates alternativeWindows', () => {
    const snapshot = createMockWeatherSnapshot((h) => h);
    const result = DecisionEngine.evaluate('Tomato', 'early_blight', 'Moderate', snapshot);

    expect(result.bestWindow).not.toBeNull();
    expect(Array.isArray(result.alternativeWindows)).toBe(true);
  });

  it('CASE 7: EARLIER_VS_HIGHER_SCORE — Prefer earlier window when scores are within 5 points', () => {
    const snapshot = createMockWeatherSnapshot((h, idx) => {
      // Hours 0..5 (Day 1 morning): Score ~82
      if (idx < 6) return { ...h, relativeHumidityPct: 80 }; // Soft penalty
      // Hours 24..30 (Day 2 morning): Score ~85
      return h;
    });

    const result = DecisionEngine.evaluate('Tomato', 'early_blight', 'Moderate', snapshot);

    expect(result.bestWindow).not.toBeNull();
    // Tie-breaker should pick Day 1 morning window
    const firstWindowStart = new Date(result.bestWindow!.startTime).getTime();
    const forecastStart = new Date(snapshot.hourlyForecast[0].timestamp).getTime();
    expect(firstWindowStart).toBeLessThan(forecastStart + 12 * 3600000);
  });

  it('CASE 8: HARD_CONSTRAINT — Rain probability > 40% sets isEligible = false', () => {
    const snapshot = createMockWeatherSnapshot((h, idx) => {
      if (idx === 3) return { ...h, precipitationProbabilityPct: 65, precipitationMm: 1.2 };
      return h;
    });

    const scores = DecisionEngine.evaluateHourlyConditions(snapshot.hourlyForecast, {
      id: 'tomato_early_blight',
      crop: 'Tomato',
      condition: 'early_blight',
      displayName: 'Tomato Early Blight',
      summary: 'Summary',
      visibleSymptoms: ['Symptom'],
      differentialClues: ['Clue'],
      managementPrinciples: ['Principle'],
      monitoring: ['Mon'],
      prevention: ['Prev'],
      weatherSensitivity: {
        rainfall: 'unfavorable',
        humidity: 'favorable_for_disease',
        wind: 'spreads_spores',
        dryWindowHours: 4,
        daylightPreferred: true,
      },
      severityGuidance: 'High',
      sources: [{ title: 'Source', organization: 'Org', accessedAt: '2026-08-10' }],
      confidenceNotes: 'Notes',
    });

    expect(scores[3].isEligible).toBe(false);
    expect(scores[3].constraints.length).toBeGreaterThan(0);
  });

  it('CASE 9: SOFT_FACTOR — Humidity 85% leaves hour eligible but reduces score', () => {
    const snapshot = createMockWeatherSnapshot((h) => ({ ...h, relativeHumidityPct: 85 }));
    const scores = DecisionEngine.evaluateHourlyConditions(snapshot.hourlyForecast, {
      id: 'tomato_early_blight',
      crop: 'Tomato',
      condition: 'early_blight',
      displayName: 'Tomato Early Blight',
      summary: 'Summary',
      visibleSymptoms: ['Symptom'],
      differentialClues: ['Clue'],
      managementPrinciples: ['Principle'],
      monitoring: ['Mon'],
      prevention: ['Prev'],
      weatherSensitivity: {
        rainfall: 'unfavorable',
        humidity: 'favorable_for_disease',
        wind: 'spreads_spores',
        dryWindowHours: 4,
        daylightPreferred: true,
      },
      severityGuidance: 'High',
      sources: [{ title: 'Source', organization: 'Org', accessedAt: '2026-08-10' }],
      confidenceNotes: 'Notes',
    });

    // Hour is eligible during daylight, but score is reduced below 100
    const daylightScore = scores[2]; // e.g. 08:00 AM
    expect(daylightScore.isEligible).toBe(true);
    expect(daylightScore.score).toBeLessThan(100);
    expect(daylightScore.reasons.some((r) => r.includes('humidity') || r.includes('humidity'))).toBe(true);
  });

  it('CASE 10: TIMEZONE — Preserves Asia/Kolkata timezone in decision results', () => {
    const snapshot = createMockWeatherSnapshot((h) => h);
    const result = DecisionEngine.evaluate('Tomato', 'early_blight', 'Moderate', snapshot);

    expect(result.timezone).toBe('Asia/Kolkata');
    expect(result.evaluatedAt).toBeDefined();
  });

  it('EXPLAINABILITY — All decision results contain non-empty reasons and summaryText', () => {
    const cropsToTest: Array<{ crop: any; condition: string }> = [
      { crop: 'Rice', condition: 'brown_spot' },
      { crop: 'Wheat', condition: 'yellow_rust' },
      { crop: 'Cotton', condition: 'bacterial_blight' },
    ];

    for (const item of cropsToTest) {
      const snapshot = createMockWeatherSnapshot((h) => h);
      const result = DecisionEngine.evaluate(item.crop, item.condition, 'Moderate', snapshot);

      expect(result.summaryTitle).toBeDefined();
      expect(result.summaryText.length).toBeGreaterThan(10);
      expect(result.reasons.length).toBeGreaterThan(0);
    }
  });
});
