import { describe, it, expect } from 'vitest';
import { AnalyzeRequestSchema, ImageValidationSchema, AssistantRequestSchema } from '../src/schemas/index.js';

describe('Zod Validation Schemas', () => {
  it('validates a valid AnalyzeRequest', () => {
    const valid = AnalyzeRequestSchema.safeParse({
      crop: 'Tomato',
      location: 'Vijayawada, Andhra Pradesh',
      latitude: 16.5062,
      longitude: 80.648,
    });
    expect(valid.success).toBe(true);
  });

  it('rejects an invalid crop name', () => {
    const invalid = AnalyzeRequestSchema.safeParse({
      crop: 'InvalidCropName',
      location: 'Vijayawada, Andhra Pradesh',
    });
    expect(invalid.success).toBe(false);
  });

  it('validates image size and MIME type', () => {
    const valid = ImageValidationSchema.safeParse({
      mimeType: 'image/jpeg',
      sizeBytes: 5 * 1024 * 1024,
    });
    expect(valid.success).toBe(true);
  });

  it('rejects oversized images (>10MB)', () => {
    const invalid = ImageValidationSchema.safeParse({
      mimeType: 'image/jpeg',
      sizeBytes: 15 * 1024 * 1024,
    });
    expect(invalid.success).toBe(false);
  });

  it('validates assistant question length', () => {
    const valid = AssistantRequestSchema.safeParse({
      question: 'What if rain starts early tomorrow?',
      contextCrop: 'Tomato',
    });
    expect(valid.success).toBe(true);

    const invalid = AssistantRequestSchema.safeParse({
      question: 'Hi',
    });
    expect(invalid.success).toBe(false);
  });
});
