import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import mongoose from 'mongoose';
import { AnalysisService } from '../src/services/analysis/analysisService.js';
import { AnalysisModel, InMemAnalysisStore } from '../src/models/Analysis.js';
import { ImageProcessingService } from '../src/services/imageProcessingService.js';

describe('MongoDB Analysis Persistence & Custom String _id Regression Tests', () => {
  beforeEach(() => {
    InMemAnalysisStore.clear();

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
    vi.restoreAllMocks();
  });

  it('1. AnalysisSchema explicitly accepts custom application string _id like adv-1739266000000', async () => {
    const customId = `adv-${Date.now()}`;

    // Verify AnalysisModel can instantiate a document with custom string _id without throwing CastError
    const doc = new AnalysisModel({
      _id: customId,
      sessionId: 'sid_test_123',
      userId: 'user_test_456',
      createdAt: new Date().toISOString(),
      location: 'Vijayawada',
      crop: {
        name: 'Tomato',
        displayName: 'Tomato',
        icon: '🍅',
      },
      photoUrl: 'data:image/jpeg;base64,mockbytes',
      assessment: {
        id: 'ass-123',
        cropName: 'Tomato',
        primaryCondition: {
          id: 'tomato_early_blight',
          name: 'Tomato Early Blight',
          category: 'Fungal Disease',
          severity: 'Moderate',
          description: 'Early blight leaf spot',
          symptoms: ['Target spots'],
        },
        confidenceScore: 0.9,
        confidenceLevel: 'High',
      },
      weatherSnapshot: { provider: 'OpenMeteo' },
      decision: { decisionStatus: 'ACT_NOW' },
      managementActions: [],
      sourceMetadata: { providerAI: 'MockAIProvider' },
    });

    expect(doc._id).toBe(customId);
    expect(typeof doc._id).toBe('string');
  });

  it('2. AnalysisService throws DATABASE_ERROR and logs sanitized message on MongoDB write failure without falling back to InMemStore', async () => {
    // Simulate active MongoDB connection state readyState === 1
    const originalState = mongoose.connection.readyState;
    Object.defineProperty(mongoose.connection, 'readyState', { value: 1, configurable: true });

    // Spy on AnalysisModel.create to throw a database validation error
    vi.spyOn(AnalysisModel, 'create').mockRejectedValue(new Error('Simulated Mongoose validation error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const service = new AnalysisService();

    await expect(
      service.analyzeField(
        Buffer.from('fake-image'),
        'image/jpeg',
        { crop: 'Tomato', location: 'Vijayawada' },
        'session-db-fail',
        'user-db-fail'
      )
    ).rejects.toThrow('DATABASE_ERROR');

    expect(consoleSpy).toHaveBeenCalled();
    const logCall = consoleSpy.mock.calls[0][0];
    expect(logCall).toContain('PERSISTENCE_FAILED');
    expect(logCall).not.toContain('fake-image');

    // Verify record was NOT saved to InMemAnalysisStore
    const history = await InMemAnalysisStore.findByUser('user-db-fail');
    expect(history.length).toBe(0);

    // Restore readyState
    Object.defineProperty(mongoose.connection, 'readyState', { value: originalState, configurable: true });
  });

  it('3. InMemAnalysisStore is preserved for intentional no-Mongo scenarios when readyState is 0', async () => {
    const originalState = mongoose.connection.readyState;
    Object.defineProperty(mongoose.connection, 'readyState', { value: 0, configurable: true });

    const service = new AnalysisService();
    const result = await service.analyzeField(
      Buffer.from('fake-image'),
      'image/jpeg',
      { crop: 'Tomato', location: 'Vijayawada' },
      'session-inmem-1',
      'user-inmem-1'
    );

    expect(result.id.startsWith('adv-')).toBe(true);
    expect(result.userId).toBe('user-inmem-1');

    const inMemHistory = await InMemAnalysisStore.findByUser('user-inmem-1');
    expect(inMemHistory.length).toBe(1);
    expect(inMemHistory[0].id).toBe(result.id);

    Object.defineProperty(mongoose.connection, 'readyState', { value: originalState, configurable: true });
  });
});
