import { describe, it, expect } from 'vitest';
import { AIReliabilityService } from '../src/services/ai/aiReliabilityService.js';
import { CropAssessment } from '../src/types/index.js';

function createDummyAssessment(overrides?: Partial<CropAssessment>): CropAssessment {
  return {
    id: 'ass-test-1',
    cropName: 'Tomato',
    primaryCondition: {
      id: 'tomato_early_blight',
      name: 'Tomato Early Blight',
      category: 'Fungal Disease',
      severity: 'Moderate',
      description: 'Test description',
      symptoms: ['Spot lesions'],
    },
    confidenceScore: 0.92,
    confidenceLevel: 'High',
    visualObservations: ['Concentric dark spots'],
    diagnosisSummary: 'High-confidence match for Tomato Early Blight (92%).',
    imageQuality: {
      isValid: true,
      mimeType: 'image/jpeg',
      sizeBytes: 1024,
      resized: true,
      qualityNotes: 'Image quality evaluated as good.',
    },
    ...overrides,
  };
}

describe('AIReliabilityService Unit Tests', () => {
  it('1. High-confidence supported diagnosis returns RELIABLE', () => {
    const assessment = createDummyAssessment();
    const result = AIReliabilityService.evaluate(assessment, 'Tomato');

    expect(result.status).toBe('RELIABLE');
    expect(result.isReliable).toBe(true);
    expect(result.reasonCode).toBe('HIGH_CONFIDENCE_MATCH');
  });

  it('2. Confidence below 0.7 returns NEEDS_REVIEW', () => {
    const assessment = createDummyAssessment({ confidenceScore: 0.55 });
    const result = AIReliabilityService.evaluate(assessment, 'Tomato');

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.isReliable).toBe(false);
    expect(result.reasonCode).toBe('LOW_CONFIDENCE');
  });

  it('3. Unknown condition returns NEEDS_REVIEW', () => {
    const assessment = createDummyAssessment({
      primaryCondition: {
        id: 'tomato_unknown',
        name: 'Unidentified Foliage Anomaly',
        category: 'Unknown',
        severity: 'Low',
        description: 'Unknown',
        symptoms: [],
      },
    });
    const result = AIReliabilityService.evaluate(assessment, 'Tomato');

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.isReliable).toBe(false);
    expect(result.reasonCode).toBe('UNKNOWN_CONDITION');
  });

  it('4. Unknown crop returns NEEDS_REVIEW', () => {
    const assessment = createDummyAssessment({ cropName: 'unknown' as any });
    const result = AIReliabilityService.evaluate(assessment);

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.isReliable).toBe(false);
    expect(result.reasonCode).toBe('UNKNOWN_CROP');
  });

  it('5. Unsupported disease returns UNSUPPORTED', () => {
    const assessment = createDummyAssessment({
      primaryCondition: {
        id: 'tomato_fictional_unsupported_disease',
        name: 'Fictional Disease',
        category: 'Fungal Disease',
        severity: 'Moderate',
        description: 'Unsupported',
        symptoms: [],
      },
    });
    const result = AIReliabilityService.evaluate(assessment, 'Tomato');

    expect(result.status).toBe('UNSUPPORTED');
    expect(result.isReliable).toBe(false);
    expect(result.reasonCode).toBe('UNSUPPORTED_CONDITION');
  });

  it('6. Poor image quality returns NEEDS_REVIEW', () => {
    const assessment = createDummyAssessment({
      imageQuality: {
        isValid: false,
        mimeType: 'image/jpeg',
        sizeBytes: 1024,
        resized: true,
        qualityNotes: 'Image is too blurry and dark for diagnostic evaluation.',
      },
    });
    const result = AIReliabilityService.evaluate(assessment, 'Tomato');

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.isReliable).toBe(false);
    expect(result.reasonCode).toBe('POOR_IMAGE_QUALITY');
  });

  it('7. Fair image with high confidence returns RELIABLE', () => {
    const assessment = createDummyAssessment({
      imageQuality: {
        isValid: true,
        mimeType: 'image/jpeg',
        sizeBytes: 1024,
        resized: true,
        qualityNotes: 'Image quality evaluated as fair.',
      },
    });
    const result = AIReliabilityService.evaluate(assessment, 'Tomato');

    expect(result.status).toBe('RELIABLE');
    expect(result.isReliable).toBe(true);
  });

  it('8. User crop matches detected crop returns RELIABLE', () => {
    const assessment = createDummyAssessment({ cropName: 'Tomato' });
    const result = AIReliabilityService.evaluate(assessment, 'Tomato');

    expect(result.status).toBe('RELIABLE');
    expect(result.isReliable).toBe(true);
  });

  it('9. User crop != detected crop returns NEEDS_REVIEW (mismatch)', () => {
    const assessment = createDummyAssessment({ cropName: 'Tomato' });
    const result = AIReliabilityService.evaluate(assessment, 'Potato');

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.isReliable).toBe(false);
    expect(result.reasonCode).toBe('CROP_MISMATCH');
  });

  it('10. Strong competing alternative diagnosis (alt >= primary - 0.10) returns NEEDS_REVIEW', () => {
    const assessment = createDummyAssessment({
      confidenceScore: 0.85,
      diagnosisSummary: 'High-confidence match for Tomato Early Blight (85%). Alternative: Late Blight (80%).',
    });
    const result = AIReliabilityService.evaluate(assessment, 'Tomato');

    expect(result.status).toBe('NEEDS_REVIEW');
    expect(result.isReliable).toBe(false);
    expect(result.reasonCode).toBe('COMPETING_DIAGNOSIS');
  });

  it('11. Weak alternative diagnosis (alt < primary - 0.10) returns RELIABLE', () => {
    const assessment = createDummyAssessment({
      confidenceScore: 0.90,
      diagnosisSummary: 'High-confidence match for Tomato Early Blight (90%). Alternative: Late Blight (15%).',
    });
    const result = AIReliabilityService.evaluate(assessment, 'Tomato');

    expect(result.status).toBe('RELIABLE');
    expect(result.isReliable).toBe(true);
  });
});
