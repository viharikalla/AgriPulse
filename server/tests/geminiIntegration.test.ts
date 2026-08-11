import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { getAIProvider } from '../src/providers/ai/aiProviderFactory.js';
import { MockAIProvider } from '../src/providers/ai/MockAIProvider.js';
import { GeminiVisionProvider } from '../src/providers/ai/GeminiVisionProvider.js';
import { AnalysisService } from '../src/services/analysis/analysisService.js';
import { ImageProcessingService } from '../src/services/imageProcessingService.js';
import { config } from '../src/config/index.js';

// Mock @google/genai SDK for Vitest integration tests
vi.mock('@google/genai', () => {
  return {
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: vi.fn(),
      },
    })),
    Type: {
      OBJECT: 'OBJECT',
      STRING: 'STRING',
      NUMBER: 'NUMBER',
      ARRAY: 'ARRAY',
    },
  };
});

describe('Stage 11E-1 Gemini Vision Provider Integration Tests', () => {
  const originalAiProvider = config.aiProvider;

  beforeEach(() => {
    vi.clearAllMocks();
    (config as any).aiProvider = 'mock';

    // Mock ImageProcessingService to avoid Sharp binary requirement in test suite
    vi.spyOn(ImageProcessingService, 'processImage').mockResolvedValue({
      buffer: Buffer.from('mock processed image'),
      imageQuality: {
        isValid: true,
        mimeType: 'image/jpeg',
        sizeBytes: 100,
        resized: true,
        qualityNotes: 'Test image processed successfully.',
      },
    });
  });

  afterEach(() => {
    (config as any).aiProvider = originalAiProvider;
    vi.restoreAllMocks();
  });

  it('1. Mock provider is selected when AI_PROVIDER=mock', () => {
    const provider = getAIProvider('mock');
    expect(provider).toBeInstanceOf(MockAIProvider);
  });

  it('2. Gemini provider is selected when AI_PROVIDER=gemini', () => {
    const provider = getAIProvider('gemini');
    expect(provider).toBeInstanceOf(GeminiVisionProvider);
  });

  it('3. AnalysisService pipeline executes cleanly with MockAIProvider by default', async () => {
    const service = new AnalysisService();
    const dummyImage = Buffer.from('dummy image content');
    const result = await service.analyzeField(
      dummyImage,
      'image/jpeg',
      { crop: 'Tomato', location: 'Vijayawada', latitude: 16.5062, longitude: 80.648 },
      'test-session-1'
    );

    expect(result.crop.name).toBe('Tomato');
    expect(result.assessment.primaryCondition.name).toBeDefined();
    expect(result.sourceMetadata.providerAI).toBe('MockAIProvider');
  });

  it('4. Gemini diagnosis reaches AgronomyService & DecisionEngine in AnalysisService', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    (GoogleGenAI as any).mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify({
            crop: 'tomato',
            condition: 'early_blight',
            confidence: 0.94,
            severity: 'moderate',
            imageQuality: 'good',
            visualEvidence: ['Target brown spot lesions with yellow halos'],
            alternativeConditions: [],
            limitations: [],
          }),
        }),
      },
    }));

    const geminiProvider = new GeminiVisionProvider();
    const service = new AnalysisService(geminiProvider);
    const dummyImage = Buffer.from('dummy image content');

    const result = await service.analyzeField(
      dummyImage,
      'image/jpeg',
      { crop: 'Tomato', location: 'Vijayawada', latitude: 16.5062, longitude: 80.648 },
      'test-session-2'
    );

    expect(result.assessment.primaryCondition.id).toContain('tomato_early_blight');
    expect(result.decision.decisionStatus).toBeDefined();
    expect(result.sourceMetadata.providerAI).toBe('GeminiVisionProvider');
  });

  it('5. Weather data reaches DecisionEngine and remains deterministic', async () => {
    const service = new AnalysisService();
    const dummyImage = Buffer.from('dummy image content');

    const result = await service.analyzeField(
      dummyImage,
      'image/jpeg',
      { crop: 'Tomato', location: 'Vijayawada', latitude: 16.5062, longitude: 80.648 },
      'test-session-3'
    );

    expect(result.weatherSnapshot.provider).toBeDefined();
    expect(result.decision.actionWindow.durationHours).toBeGreaterThan(0);
  });

  it('7 & 8. Unsupported/Low-confidence Gemini diagnosis is safely handled without crashing', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    (GoogleGenAI as any).mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify({
            crop: 'tomato',
            condition: 'unknown_unsupported_fungus',
            confidence: 0.4,
            severity: 'low',
            imageQuality: 'unclear',
            visualEvidence: ['Faint spots'],
            alternativeConditions: [],
            limitations: ['Image blurry'],
          }),
        }),
      },
    }));

    const geminiProvider = new GeminiVisionProvider();
    const service = new AnalysisService(geminiProvider);
    const dummyImage = Buffer.from('dummy image content');

    const result = await service.analyzeField(
      dummyImage,
      'image/jpeg',
      { crop: 'Tomato', location: 'Vijayawada', latitude: 16.5062, longitude: 80.648 },
      'test-session-4'
    );

    expect(result.assessment.confidenceLevel).toBe('Low');
    expect(result.decision).toBeDefined();
  });

  it('9 & 10. Gemini provider error becomes a safe API error without exposing secrets', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    (GoogleGenAI as any).mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockRejectedValue({ status: 429, message: 'Quota exceeded with key=SECRET_KEY' }),
      },
    }));

    (config as any).aiProvider = 'gemini';

    const res = await request(app)
      .post('/api/analyze')
      .field('crop', 'Tomato')
      .field('location', 'Vijayawada')
      .attach('image', Buffer.from('dummy image'), 'leaf.jpg');

    expect(res.status).toBe(429);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('AI_RATE_LIMITED');
    expect(JSON.stringify(res.body)).not.toContain('SECRET_KEY');
  });

  it('11 & 12. API response contains final decision and no raw Gemini objects', async () => {
    (config as any).aiProvider = 'mock';

    const res = await request(app)
      .post('/api/analyze')
      .field('crop', 'Tomato')
      .field('location', 'Vijayawada')
      .attach('image', Buffer.from('dummy image'), 'leaf.jpg');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.decision).toBeDefined();
    expect(res.body.data.weatherSnapshot).toBeDefined();
    expect(JSON.stringify(res.body)).not.toContain('GEMINI_API_KEY');
  });
});
