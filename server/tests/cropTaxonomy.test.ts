import { describe, it, expect } from 'vitest';
import { isValidCropCondition, getConditionById, CROP_TAXONOMY } from '../src/data/cropTaxonomy.js';

describe('Crop Taxonomy & Condition Compatibility', () => {
  it('supports exactly 10 primary Indian-relevant crops', () => {
    const crops = Object.keys(CROP_TAXONOMY);
    expect(crops).toEqual([
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

  it('validates correct crop-condition relationships', () => {
    expect(isValidCropCondition('Tomato', 'early_blight')).toBe(true);
    expect(isValidCropCondition('Tomato', 'tomato_early_blight')).toBe(true);
    expect(isValidCropCondition('Chilli', 'anthracnose')).toBe(true);
    expect(isValidCropCondition('Rice', 'leaf_blast')).toBe(true);
  });

  it('rejects cross-crop invalid conditions', () => {
    expect(isValidCropCondition('Rice', 'early_blight')).toBe(false);
    expect(isValidCropCondition('Potato', 'fall_armyworm_damage')).toBe(false);
  });

  it('returns appropriate taxonomy object by id', () => {
    const cond = getConditionById('Tomato', 'early_blight');
    expect(cond.name).toContain('Early Blight');
    expect(cond.severity).toBe('High');
  });
});
