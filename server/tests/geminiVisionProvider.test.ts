import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GeminiVisionProvider } from '../src/providers/ai/GeminiVisionProvider.js';

// Mock @google/genai SDK
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

describe('GeminiVisionProvider Production Unit Tests', () => {
  let provider: GeminiVisionProvider;
  const dummyBuffer = Buffer.from('dummy image content');
  const validMime = 'image/jpeg';

  beforeEach(() => {
    vi.clearAllMocks();
    provider = new GeminiVisionProvider(15000, 0.7);
    process.env.GEMINI_API_KEY = 'mock_api_key_for_unit_testing';
  });

  it('1. Valid structured response returns high-confidence CropAssessment', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    const mockGenerateContent = vi.fn().mockResolvedValue({
      text: JSON.stringify({
        crop: 'tomato',
        condition: 'early_blight',
        confidence: 0.92,
        severity: 'moderate',
        imageQuality: 'good',
        visualEvidence: ['Concentric necrotic ring lesions', 'Target spots with yellow halos'],
        alternativeConditions: [{ condition: 'late_blight', confidence: 0.15 }],
        limitations: ['Lower foliage leaves not visible'],
      }),
    });
    (GoogleGenAI as any).mockImplementation(() => ({
      models: { generateContent: mockGenerateContent },
    }));

    const result = await provider.analyzeCrop(dummyBuffer, validMime, 'Tomato', 'Vijayawada');

    expect(result.cropName).toBe('Tomato');
    expect(result.confidenceScore).toBe(0.92);
    expect(result.confidenceLevel).toBe('High');
    expect(result.primaryCondition.id).toContain('tomato_early_blight');
    expect(result.visualObservations.length).toBeGreaterThan(0);
  });

  it('2. Malformed structured response throws AI_PROVIDER_ERROR', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    (GoogleGenAI as any).mockImplementation(() => ({
      models: { generateContent: vi.fn().mockResolvedValue({ text: 'INVALID_NOT_JSON' }) },
    }));

    await expect(provider.analyzeCrop(dummyBuffer, validMime, 'Tomato', 'Vijayawada')).rejects.toThrow(
      'AI_PROVIDER_ERROR'
    );
  });

  it('3. Invalid crop falls back safely to requested crop', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    (GoogleGenAI as any).mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify({
            crop: 'unknown_alien_crop',
            condition: 'early_blight',
            confidence: 0.88,
            severity: 'moderate',
            imageQuality: 'good',
            visualEvidence: ['Spot lesion'],
            alternativeConditions: [],
            limitations: [],
          }),
        }),
      },
    }));

    const result = await provider.analyzeCrop(dummyBuffer, validMime, 'Tomato', 'Vijayawada');
    expect(result.cropName).toBe('Tomato');
  });

  it('4. Unsupported condition returns low-confidence/needs-review result', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    (GoogleGenAI as any).mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify({
            crop: 'tomato',
            condition: 'fictional_unsupported_disease',
            confidence: 0.85,
            severity: 'low',
            imageQuality: 'good',
            visualEvidence: ['Unusual spots'],
            alternativeConditions: [],
            limitations: [],
          }),
        }),
      },
    }));

    const result = await provider.analyzeCrop(dummyBuffer, validMime, 'Tomato', 'Vijayawada');
    expect(result.confidenceLevel).toBe('Low');
    expect(result.primaryCondition.id).toBe('tomato_unknown');
  });

  it('5. Confidence below threshold (< 0.7) marks confidenceLevel as Low', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    (GoogleGenAI as any).mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify({
            crop: 'tomato',
            condition: 'early_blight',
            confidence: 0.55,
            severity: 'moderate',
            imageQuality: 'fair',
            visualEvidence: ['Faint spot'],
            alternativeConditions: [],
            limitations: ['Image blurry'],
          }),
        }),
      },
    }));

    const result = await provider.analyzeCrop(dummyBuffer, validMime, 'Tomato', 'Vijayawada');
    expect(result.confidenceLevel).toBe('Low');
    expect(result.diagnosisSummary).toContain('Uncertain diagnosis');
  });

  it('6. Unknown diagnosis returns uncertain result without crashing', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    (GoogleGenAI as any).mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify({
            crop: 'tomato',
            condition: 'unknown',
            confidence: 0.3,
            severity: 'low',
            imageQuality: 'unclear',
            visualEvidence: ['Foliage spot'],
            alternativeConditions: [],
            limitations: ['Unclear focal point'],
          }),
        }),
      },
    }));

    const result = await provider.analyzeCrop(dummyBuffer, validMime, 'Tomato', 'Vijayawada');
    expect(result.confidenceLevel).toBe('Low');
    expect(result.primaryCondition.name).toContain('Unspecified Tomato Condition');
  });

  it('7. 400 error maps to AI_INVALID_REQUEST', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    (GoogleGenAI as any).mockImplementation(() => ({
      models: { generateContent: vi.fn().mockRejectedValue({ status: 400, message: 'Invalid payload' }) },
    }));

    await expect(provider.analyzeCrop(dummyBuffer, validMime, 'Tomato', 'Vijayawada')).rejects.toThrow(
      'AI_INVALID_REQUEST'
    );
  });

  it('8. 403 error maps to AI_PERMISSION_DENIED', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    (GoogleGenAI as any).mockImplementation(() => ({
      models: { generateContent: vi.fn().mockRejectedValue({ status: 403, message: 'Permission denied' }) },
    }));

    await expect(provider.analyzeCrop(dummyBuffer, validMime, 'Tomato', 'Vijayawada')).rejects.toThrow(
      'AI_PERMISSION_DENIED'
    );
  });

  it('9. 404 error maps to AI_MODEL_UNAVAILABLE', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    (GoogleGenAI as any).mockImplementation(() => ({
      models: { generateContent: vi.fn().mockRejectedValue({ status: 404, message: 'Model not found' }) },
    }));

    await expect(provider.analyzeCrop(dummyBuffer, validMime, 'Tomato', 'Vijayawada')).rejects.toThrow(
      'AI_MODEL_UNAVAILABLE'
    );
  });

  it('10. 429 error maps to AI_RATE_LIMITED', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    (GoogleGenAI as any).mockImplementation(() => ({
      models: { generateContent: vi.fn().mockRejectedValue({ status: 429, message: 'Quota exceeded' }) },
    }));

    await expect(provider.analyzeCrop(dummyBuffer, validMime, 'Tomato', 'Vijayawada')).rejects.toThrow(
      'AI_RATE_LIMITED'
    );
  });

  it('11. 500 error maps to AI_PROVIDER_ERROR', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    (GoogleGenAI as any).mockImplementation(() => ({
      models: { generateContent: vi.fn().mockRejectedValue({ status: 500, message: 'Internal server error' }) },
    }));

    await expect(provider.analyzeCrop(dummyBuffer, validMime, 'Tomato', 'Vijayawada')).rejects.toThrow(
      'AI_PROVIDER_ERROR'
    );
  });

  it('12. Timeout throws AI_TIMEOUT', async () => {
    const { GoogleGenAI } = await import('@google/genai');
    (GoogleGenAI as any).mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 500))),
      },
    }));

    const fastTimeoutProvider = new GeminiVisionProvider(50, 0.7);
    await expect(fastTimeoutProvider.analyzeCrop(dummyBuffer, validMime, 'Tomato', 'Vijayawada')).rejects.toThrow(
      'AI_TIMEOUT'
    );
  });

  it('13. Unsupported MIME type throws AI_INVALID_REQUEST', async () => {
    await expect(provider.analyzeCrop(dummyBuffer, 'image/gif', 'Tomato', 'Vijayawada')).rejects.toThrow(
      'AI_INVALID_REQUEST'
    );
  });

  it('14. Oversized image (>10MB) throws AI_INVALID_REQUEST', async () => {
    const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
    await expect(provider.analyzeCrop(largeBuffer, validMime, 'Tomato', 'Vijayawada')).rejects.toThrow(
      'AI_INVALID_REQUEST'
    );
  });
});
