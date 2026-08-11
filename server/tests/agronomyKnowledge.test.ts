import { describe, it, expect } from 'vitest';
import { AgronomyService } from '../src/services/agronomy/agronomyService.js';
import { AGRONOMY_KNOWLEDGE_BASE } from '../src/data/agronomy/index.js';
import { SupportedCrop } from '../src/types/index.js';

describe('10-Crop Grounded Agronomy Knowledge Base', () => {
  const EXPECTED_CROPS: SupportedCrop[] = [
    'Rice',
    'Wheat',
    'Maize',
    'Tomato',
    'Potato',
    'Chilli',
    'Soybean',
    'Groundnut',
    'Chickpea',
    'Cotton',
  ];

  it('supports exactly 10 primary Indian-relevant crops', () => {
    const crops = Object.keys(AGRONOMY_KNOWLEDGE_BASE);
    expect(crops).toEqual(EXPECTED_CROPS);
  });

  it('ensures every crop has at least 3 disease/condition entries including healthy and unknown', () => {
    for (const crop of EXPECTED_CROPS) {
      const conditions = AgronomyService.getConditions(crop);
      expect(conditions.length).toBeGreaterThanOrEqual(3);
      expect(conditions.some((c) => c.condition === 'healthy')).toBe(true);
      expect(conditions.some((c) => c.condition === 'unknown')).toBe(true);
    }
  });

  it('ensures every single condition entry has verified source metadata', () => {
    for (const crop of EXPECTED_CROPS) {
      const conditions = AgronomyService.getConditions(crop);
      for (const entry of conditions) {
        expect(entry.sources.length).toBeGreaterThan(0);
        expect(entry.sources[0].title).toBeDefined();
        expect(entry.sources[0].organization).toBeDefined();
        expect(entry.sources[0].accessedAt).toBeDefined();
      }
    }
  });

  it('validates crop-condition compatibility correctly', () => {
    expect(AgronomyService.isConditionSupported('Tomato', 'early_blight')).toBe(true);
    expect(AgronomyService.isConditionSupported('Rice', 'brown_spot')).toBe(true);
    expect(AgronomyService.isConditionSupported('Chickpea', 'fusarium_wilt')).toBe(true);

    // Cross-crop invalid condition tests
    expect(AgronomyService.isConditionSupported('Tomato', 'rust')).toBe(false);
    expect(AgronomyService.isConditionSupported('Rice', 'early_blight')).toBe(false);
    expect(AgronomyService.isConditionSupported('Maize', 'anthracnose')).toBe(false);
  });

  it('handles unknown condition fallback cleanly', () => {
    const fallback = AgronomyService.getCondition('Tomato', 'non_existent_disease');
    expect(fallback.condition).toBe('unknown');
    expect(fallback.crop).toBe('Tomato');
  });

  it('returns valid weather sensitivity profiles for diseases', () => {
    const weather = AgronomyService.getWeatherProfile('Tomato', 'early_blight');
    expect(weather).toHaveProperty('rainfall');
    expect(weather).toHaveProperty('humidity');
    expect(weather).toHaveProperty('dryWindowHours');
    expect(weather.dryWindowHours).toBeGreaterThan(0);
  });

  it('returns grounded management principles and prevention steps', () => {
    const mgmt = AgronomyService.getManagement('Cotton', 'bacterial_blight');
    expect(mgmt.managementPrinciples.length).toBeGreaterThan(0);
    expect(mgmt.prevention.length).toBeGreaterThan(0);
  });
});
