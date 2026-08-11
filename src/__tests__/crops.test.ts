import { describe, it, expect } from 'vitest';
import { SUPPORTED_CROPS } from '../config/crops';

describe('Supported Crops Configuration', () => {
  it('contains exactly 10 supported crops', () => {
    expect(SUPPORTED_CROPS).toHaveLength(10);
  });

  it('includes Rice, Wheat, Maize, Tomato, Potato, Chilli, Soybean, Groundnut, Chickpea, Cotton', () => {
    const cropNames = SUPPORTED_CROPS.map((c) => c.name);
    expect(cropNames).toEqual([
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
    ]);
  });

  it('ensures every crop has required metadata', () => {
    SUPPORTED_CROPS.forEach((crop) => {
      expect(crop).toHaveProperty('id');
      expect(crop).toHaveProperty('name');
      expect(crop).toHaveProperty('scientificName');
      expect(crop).toHaveProperty('icon');
      expect(crop).toHaveProperty('category');
      expect(crop).toHaveProperty('commonDiseases');
      expect(crop.commonDiseases.length).toBeGreaterThan(0);
    });
  });
});
