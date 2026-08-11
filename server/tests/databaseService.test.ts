import { describe, it, expect, beforeEach } from 'vitest';
import { getSanitizedMongoUri, connectDatabase } from '../src/db/connection.js';
import { AnalysisModel, InMemAnalysisStore } from '../src/models/Analysis.js';
import { FieldAnalysis } from '../src/types/index.js';

function createSampleAnalysis(id: string, sessionId: string): FieldAnalysis {
  return {
    id,
    sessionId,
    createdAt: new Date().toISOString(),
    location: 'Vijayawada',
    latitude: 16.5062,
    longitude: 80.648,
    crop: { name: 'Tomato', displayName: 'Tomato' },
    photoUrl: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?auto=format&fit=crop&w=800&q=80',
    assessment: {
      id: 'ass-1',
      cropName: 'Tomato',
      primaryCondition: {
        id: 'tomato_early_blight',
        name: 'Tomato Early Blight',
        category: 'Fungal Disease',
        severity: 'Moderate',
        description: 'Test spots',
        symptoms: [],
      },
      confidenceScore: 0.92,
      confidenceLevel: 'High',
      visualObservations: [],
      diagnosisSummary: 'Sample diagnosis summary.',
    },
    weatherSnapshot: {
      locationName: 'Vijayawada',
      currentTempC: 30,
      currentHumidity: 60,
      currentWindSpeedKmh: 8,
      currentCondition: 'Clear',
      hourlyForecast: [],
    },
    decision: {
      summaryTitle: 'WAIT FOR OPTIMAL WINDOW',
      decisionStatus: 'WAIT',
      primaryAction: {
        id: 'act-1',
        actionType: 'Spray',
        title: 'Apply Protectant Treatment',
        description: 'Sample description',
        timingWindow: {} as any,
        precautions: [],
        priority: 'High',
      },
      actionWindow: {} as any,
      monitoringChecklist: [],
      rationale: 'Sample rationale',
    },
    managementActions: [],
    sourceMetadata: {
      providerAI: 'MockAIProvider',
      providerWeather: 'open-meteo',
      engineVersion: 'v1.0.0',
      processedAt: new Date().toISOString(),
    },
  };
}

describe('Stage 11I Database & Persistence Unit Tests', () => {
  beforeEach(() => {
    InMemAnalysisStore.clear();
  });

  it('1. getSanitizedMongoUri masks password credentials cleanly', () => {
    const rawUri = 'mongodb+srv://test_user:SecretPassword123@cluster0.fvrccmi.mongodb.net/agripulse';
    const sanitized = getSanitizedMongoUri(rawUri);

    expect(sanitized).not.toContain('SecretPassword123');
    expect(sanitized).toContain('test_user:****@cluster0.fvrccmi.mongodb.net');
  });

  it('2. Empty or missing MONGODB_URI returns false without crashing', async () => {
    const result = await connectDatabase('');
    expect(result).toBe(false);
  });

  it('3. InMemAnalysisStore saves and retrieves FieldAnalysis by ID and session', async () => {
    const item = createSampleAnalysis('adv-1001', 'session-alpha');
    await InMemAnalysisStore.save(item);

    const retrieved = await InMemAnalysisStore.findById('adv-1001', 'session-alpha');
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe('adv-1001');
    expect(retrieved?.crop.name).toBe('Tomato');
  });

  it('4. InMemAnalysisStore enforces session ownership validation', async () => {
    const item = createSampleAnalysis('adv-1002', 'session-alpha');
    await InMemAnalysisStore.save(item);

    const unauthorizedLookup = await InMemAnalysisStore.findById('adv-1002', 'session-beta');
    expect(unauthorizedLookup).toBeNull();
  });

  it('5. InMemAnalysisStore queries history by session sorted by createdAt descending', async () => {
    const item1 = createSampleAnalysis('adv-2001', 'session-gamma');
    item1.createdAt = '2026-08-11T10:00:00.000Z';
    const item2 = createSampleAnalysis('adv-2002', 'session-gamma');
    item2.createdAt = '2026-08-11T12:00:00.000Z';

    await InMemAnalysisStore.save(item1);
    await InMemAnalysisStore.save(item2);

    const history = await InMemAnalysisStore.findBySession('session-gamma');
    expect(history.length).toBe(2);
    expect(history[0].id).toBe('adv-2002');
    expect(history[1].id).toBe('adv-2001');
  });

  it('6. AnalysisModel Schema defines compound index for sessionId and createdAt', () => {
    const indexes = AnalysisModel.schema.indexes();
    const hasSessionCreatedIndex = indexes.some((idx) => {
      const fields = idx[0] as Record<string, number>;
      return fields.sessionId === 1 && fields.createdAt === -1;
    });

    expect(hasSessionCreatedIndex).toBe(true);
  });

  it('7. AnalysisModel Schema defines compound index for crop.name', () => {
    const indexes = AnalysisModel.schema.indexes();
    const hasCropIndex = indexes.some((idx) => {
      const fields = idx[0] as Record<string, number>;
      return fields['crop.name'] === 1;
    });

    expect(hasCropIndex).toBe(true);
  });
});
