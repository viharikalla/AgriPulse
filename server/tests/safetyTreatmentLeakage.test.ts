import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AnalysisService } from '../src/services/analysis/analysisService.js';
import { AgronomyService } from '../src/services/agronomy/agronomyService.js';
import { MockAIProvider } from '../src/providers/ai/mockAIProvider.js';
import { ImageProcessingService } from '../src/services/imageProcessingService.js';
import { CropAssessment } from '../src/types/index.js';

describe('Stage 11F & Production Safety — Image Preservation & Assistant Reliability Context', () => {
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

  it('1. Uploaded crop image photoUrl is preserved as base64 data URL and not stock Unsplash image', async () => {
    const service = new AnalysisService();
    const result = await service.analyzeField(
      Buffer.from('real-uploaded-crop-foliage-image-bytes'),
      'image/jpeg',
      { crop: 'Tomato', location: 'Vijayawada' },
      'session-photo-1'
    );

    expect(result.photoUrl).toBeDefined();
    expect(result.photoUrl.startsWith('data:image/jpeg;base64,')).toBe(true);
    expect(result.photoUrl).not.toContain('unsplash.com');
  });

  it('2. NEEDS_REVIEW response contains no chemical treatment recommendations or product names', async () => {
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

    const allActionText = JSON.stringify(result.managementActions).toLowerCase();
    for (const kw of CHEMICAL_KEYWORDS) {
      expect(allActionText).not.toContain(kw);
    }

    expect(primaryAction.precautions.some((p) => p.toLowerCase().includes('consult') || p.toLowerCase().includes('inspect'))).toBe(true);
  });

  it('3. UNSUPPORTED response contains no chemical treatment recommendations or product names', async () => {
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

  it('4. NEEDS_REVIEW Ask AgriPulse assistant does not substitute "Tomato Early Blight" or chemical dosage advice', async () => {
    const lowConfidenceProvider = new MockAIProvider({
      cropName: 'Tomato',
      primaryCondition: {
        id: 'tomato_unknown',
        name: 'Unspecified Tomato Leaf Spot',
        severity: 'Moderate',
        symptoms: ['Chlorotic leaf spots'],
      },
      confidenceScore: 0.4,
      confidenceLevel: 'Low',
      diagnosisSummary: 'Uncertain diagnosis.',
    });

    const service = new AnalysisService(lowConfidenceProvider);
    const analysis = await service.analyzeField(
      Buffer.from('fake-image-bytes'),
      'image/jpeg',
      { crop: 'Tomato', location: 'Vijayawada' },
      'session-assistant-review-1'
    );

    const answer = await service.askAssistant(
      'What chemical dose should I spray for this spot?',
      'Tomato',
      analysis.id
    );

    expect(answer).not.toContain('Tomato Early Blight');
    expect(answer).not.toContain('2.0 grams per liter');
    expect(answer.toLowerCase()).toContain('unconfirmed');
    expect(answer.toLowerCase()).toContain('verification');
  });

  it('5. RELIABLE Ask AgriPulse assistant retains normal disease-specific assistant behavior', async () => {
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
    const analysis = await service.analyzeField(
      Buffer.from('fake-image-bytes'),
      'image/jpeg',
      { crop: 'Tomato', location: 'Vijayawada' },
      'session-assistant-reliable-1'
    );

    const answer = await service.askAssistant(
      'What is the recommended dose for this disease?',
      'Tomato',
      analysis.id
    );

    expect(answer).toContain('Tomato Early Blight');
    expect(answer).toContain('2.0 grams per liter');
  });

  it('6. AgronomyService.getManagementActions returns non-chemical inspect action for unknown condition', () => {
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
});
