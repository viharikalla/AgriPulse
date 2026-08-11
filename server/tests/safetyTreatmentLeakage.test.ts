import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AnalysisService } from '../src/services/analysis/analysisService.js';
import { AgronomyService } from '../src/services/agronomy/agronomyService.js';
import { MockAIProvider } from '../src/providers/ai/mockAIProvider.js';
import { ImageProcessingService } from '../src/services/imageProcessingService.js';
import { CropAssessment } from '../src/types/index.js';

describe('Stage 11F Safety Contract — Reliability to Management Pipeline', () => {
  beforeEach(() => {
    vi.spyOn(ImageProcessingService, 'processImage').mockResolvedValue({
      buffer: Buffer.from('mock image bytes'),
      imageQuality: {
        isValid: true,
        mimeType: 'image/jpeg',
        sizeBytes: 100,
        resized: true,
        qualityNotes: 'Valid test image.',
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const CHEMICAL_KEYWORDS = [
    'copper',
    'chlorothalonil',
    'mancozeb',
    'metalaxyl',
    'cymoxanil',
    'sulfur',
    'bactericide',
    'insecticide',
  ];

  it('1. NEEDS_REVIEW response contains no chemical treatment recommendations or product names', async () => {
    const lowConfidenceProvider = new MockAIProvider({
      cropName: 'Tomato',
      primaryCondition: {
        id: 'tomato_unknown',
        name: 'Tomato Leaf Mold',
        severity: 'Moderate',
        symptoms: ['Yellow spots on upper leaf surface'],
      },
      confidenceScore: 0.45, // Low confidence -> NEEDS_REVIEW
      confidenceLevel: 'Low',
      diagnosisSummary: 'Ambiguous visual symptoms.',
    });

    const service = new AnalysisService(lowConfidenceProvider);
    const result = await service.analyzeField(
      Buffer.from('fake-image-bytes'),
      'image/jpeg',
      { crop: 'Tomato', location: 'Vijayawada' },
      'session-review-1'
    );

    expect(result.decision.decisionStatus).toBe('INSUFFICIENT_DATA');
    expect(result.assessment.confidenceLevel).toBe('Low');

    const primaryAction = result.decision.primaryAction;
    expect(primaryAction.actionType).toBe('Inspect');
    expect(primaryAction.recommendedDosage).toContain('N/A');

    // Check all management actions text for chemical product names
    const allActionText = JSON.stringify(result.managementActions).toLowerCase();
    for (const kw of CHEMICAL_KEYWORDS) {
      expect(allActionText).not.toContain(kw);
    }

    // Verify non-chemical inspection/field verification guidance is present
    expect(primaryAction.precautions.some((p) => p.toLowerCase().includes('consult') || p.toLowerCase().includes('inspect'))).toBe(true);
  });

  it('2. UNSUPPORTED response contains no chemical treatment recommendations or product names', async () => {
    const unsupportedProvider = new MockAIProvider({
      cropName: 'Tomato',
      primaryCondition: {
        id: 'tomato_exotic_rust',
        name: 'Exotic Tomato Rust',
        severity: 'High',
        symptoms: ['Orange rust pustules'],
      },
      confidenceScore: 0.9,
      confidenceLevel: 'High',
      diagnosisSummary: 'Unsupported exotic condition.',
    });

    const service = new AnalysisService(unsupportedProvider);
    const result = await service.analyzeField(
      Buffer.from('fake-image-bytes'),
      'image/jpeg',
      { crop: 'Tomato', location: 'Vijayawada' },
      'session-unsupported-1'
    );

    expect(result.decision.decisionStatus).toBe('INSUFFICIENT_DATA');
    expect(result.decision.summaryTitle).toBe('Unsupported Disease Profile');

    const primaryAction = result.decision.primaryAction;
    expect(primaryAction.actionType).toBe('Inspect');
    expect(primaryAction.recommendedDosage).toContain('N/A');

    const allActionText = JSON.stringify(result.managementActions).toLowerCase();
    for (const kw of CHEMICAL_KEYWORDS) {
      expect(allActionText).not.toContain(kw);
    }
  });

  it('3. AgronomyService.getManagementActions returns non-chemical inspect action for unknown condition', () => {
    const unknownAssessment: CropAssessment = {
      cropName: 'Tomato',
      primaryCondition: {
        id: 'tomato_unknown',
        name: 'Unspecified Tomato Condition',
        severity: 'Moderate',
        symptoms: ['Irregular chlorosis'],
      },
      confidenceScore: 0.5,
      confidenceLevel: 'Low',
      diagnosisSummary: 'Uncertain diagnosis.',
      imageQuality: { isValid: true },
      visualObservations: ['Chlorosis on lower leaves'],
      differentialDiagnosis: [],
    };

    const actions = AgronomyService.getManagementActions(unknownAssessment);
    expect(actions).toHaveLength(1);
    expect(actions[0].actionType).toBe('Inspect');
    expect(actions[0].recommendedDosage).toContain('N/A');
    expect(actions[0].description).not.toContain('copper');
    expect(actions[0].description).not.toContain('chlorothalonil');
  });

  it('4. RELIABLE response preserves standard agronomic treatment principles and spray window calculation', async () => {
    const reliableProvider = new MockAIProvider({
      cropName: 'Tomato',
      primaryCondition: {
        id: 'tomato_early_blight',
        name: 'Tomato Early Blight',
        severity: 'Moderate',
        symptoms: ['Concentric target rings on lower leaves'],
      },
      confidenceScore: 0.92,
      confidenceLevel: 'High',
      diagnosisSummary: 'Grounded early blight detection.',
    });

    const service = new AnalysisService(reliableProvider);
    const result = await service.analyzeField(
      Buffer.from('fake-image-bytes'),
      'image/jpeg',
      { crop: 'Tomato', location: 'Vijayawada' },
      'session-reliable-1'
    );

    expect(result.decision.decisionStatus).not.toBe('INSUFFICIENT_DATA');
    expect(result.decision.primaryAction.actionType).toBe('Spray');
    expect(result.decision.primaryAction.recommendedDosage).not.toContain('N/A');
  });
});
