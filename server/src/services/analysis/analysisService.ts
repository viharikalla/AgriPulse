import { AIProvider } from '../../providers/ai/AIProvider.js';
import { WeatherProvider } from '../../providers/weather/WeatherProvider.js';
import { getAIProvider } from '../../providers/ai/aiProviderFactory.js';
import { OpenMeteoWeatherProvider } from '../../providers/weather/OpenMeteoWeatherProvider.js';
import { ImageProcessingService } from '../imageProcessingService.js';
import { DecisionEngine } from '../decision/decisionEngine.js';
import { AgronomyService } from '../agronomy/agronomyService.js';
import { AIReliabilityService } from '../ai/aiReliabilityService.js';
import { FieldAnalysis, AnalyzeRequestInput, FieldDecision, ActionWindow } from '../../types/index.js';
import { AnalysisModel, InMemAnalysisStore } from '../../models/Analysis.js';
import mongoose from 'mongoose';

export class AnalysisService {
  private customAiProvider?: AIProvider;
  private weatherProvider: WeatherProvider;

  constructor(aiProvider?: AIProvider, weatherProvider?: WeatherProvider) {
    this.customAiProvider = aiProvider;
    this.weatherProvider = weatherProvider || new OpenMeteoWeatherProvider();
  }

  public async analyzeField(
    imageBuffer: Buffer,
    mimeType: string,
    input: AnalyzeRequestInput,
    sessionId: string,
    userId?: string
  ): Promise<FieldAnalysis> {
    // 1. Process and optimize image with Sharp
    const processed = await ImageProcessingService.processImage(imageBuffer, mimeType);

    // 2. Resolve AI Provider dynamically
    const activeAiProvider = this.customAiProvider || getAIProvider();

    // 3. Run AI Assessment
    const assessment = await activeAiProvider.analyzeCrop(
      processed.buffer,
      processed.imageQuality.mimeType,
      input.crop,
      input.location
    );

    // 4. Run Deterministic AI Reliability Layer
    const reliability = AIReliabilityService.evaluate(assessment, input.crop);

    // 5. Fetch Live Weather Snapshot
    const lat = input.latitude || 16.5062;
    const lon = input.longitude || 80.648;
    const weatherSnapshot = await this.weatherProvider.getWeatherByCoords({
      locationName: input.location,
      latitude: lat,
      longitude: lon,
      hours: 48,
    });

    const id = `adv-${Date.now()}`;
    const createdAt = new Date().toISOString();

    let decision: FieldDecision;
    let managementActions = AgronomyService.getManagementActions(assessment);
    let monitoringChecklist = AgronomyService.getMonitoringChecklist(assessment);

    if (reliability.isReliable) {
      // 6A. RELIABLE — Run Deterministic Decision Engine & Agronomy Guidance
      const conditionKey = assessment.primaryCondition.id.split('_').slice(1).join('_') || 'early_blight';
      const decisionResult = DecisionEngine.evaluate(
        input.crop,
        conditionKey,
        assessment.primaryCondition.severity,
        weatherSnapshot
      );

      const fallbackWindow: ActionWindow = {
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 3.5 * 3600000).toISOString(),
        durationHours: 4,
        averageScore: 88,
        minimumScore: 80,
        maximumScore: 92,
        status: 'FAVORABLE',
        reasons: ['Optimal dry window detected.'],
        constraints: ['Wind speed < 8 km/h.'],
        weatherSummary: {
          minTempC: 25,
          maxTempC: 29,
          avgHumidityPct: 65,
          maxPrecipProbabilityPct: 10,
          totalPrecipitationMm: 0,
          maxWindSpeedKmh: 7,
          maxWindGustKmh: 10,
          dominantCondition: 'Clear',
        },
        bestStartTime: 'Tomorrow 07:00',
        bestEndTime: 'Tomorrow 10:30',
        suitabilityScore: 88,
        recommendationReason: 'Wind < 8 km/h and rain chance 10%.',
        riskFactors: ['Precipitation risk in afternoon'],
        weatherConstraintReasoning: 'Spraying during rain washes chemical.',
      };

      const actionWindow = decisionResult.bestWindow || fallbackWindow;

      decision = {
        summaryTitle: decisionResult.summaryTitle,
        decisionStatus: decisionResult.status,
        primaryAction: managementActions[0],
        actionWindow,
        monitoringChecklist,
        rationale: decisionResult.summaryText,
      };
    } else {
      // 6B. NEEDS_REVIEW / UNSUPPORTED — Safe Non-Treatment Response
      assessment.confidenceLevel = 'Low';
      assessment.diagnosisSummary = reliability.message;

      const title = reliability.status === 'UNSUPPORTED'
        ? 'Unsupported Disease Profile'
        : 'Agronomic Field Verification Needed';

      const needsReviewWindow: ActionWindow = {
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 24 * 3600000).toISOString(),
        durationHours: 0,
        averageScore: 0,
        minimumScore: 0,
        maximumScore: 0,
        status: 'INSUFFICIENT_DATA',
        reasons: [reliability.message],
        constraints: ['Diagnostic confidence insufficient for chemical spray calculation.'],
        weatherSummary: {
          minTempC: weatherSnapshot.currentTempC,
          maxTempC: weatherSnapshot.currentTempC,
          avgHumidityPct: weatherSnapshot.currentHumidity,
          maxPrecipProbabilityPct: 0,
          totalPrecipitationMm: 0,
          maxWindSpeedKmh: weatherSnapshot.currentWindSpeedKmh,
          maxWindGustKmh: weatherSnapshot.currentWindSpeedKmh,
          dominantCondition: weatherSnapshot.currentCondition,
        },
        bestStartTime: 'N/A',
        bestEndTime: 'N/A',
        suitabilityScore: 0,
        recommendationReason: reliability.message,
        riskFactors: ['Unconfirmed diagnosis risk'],
        weatherConstraintReasoning: 'Spraying unconfirmed target diseases causes ineffective control and resistance.',
      };

      decision = {
        summaryTitle: title,
        decisionStatus: 'INSUFFICIENT_DATA',
        primaryAction: {
          id: `act-review-${Date.now()}`,
          actionType: 'Inspect',
          title: 'Manual Field Verification Required',
          description: reliability.message,
          recommendedDosage: 'N/A - Chemical treatment not advised without visual confirmation.',
          timingWindow: needsReviewWindow,
          precautions: [
            'Inspect affected leaves and stem junctions closely.',
            'Consult a certified local extension officer before applying crop protection chemicals.',
          ],
          priority: 'High',
        },
        actionWindow: needsReviewWindow,
        monitoringChecklist: [
          'Capture clear close-up photos of affected foliage.',
          'Inspect neighboring plants for uniform lesion expansion.',
        ],
        rationale: reliability.message,
      };

      managementActions = [decision.primaryAction];
      monitoringChecklist = decision.monitoringChecklist;
    }

    // 7. Synthesize Field Analysis Record
    const analysis: FieldAnalysis = {
      id,
      sessionId,
      userId,
      createdAt,
      location: input.location,
      latitude: input.latitude,
      longitude: input.longitude,
      crop: {
        name: input.crop,
        displayName: input.crop,
      },
      photoUrl: `data:${processed.imageQuality.mimeType || 'image/jpeg'};base64,${processed.buffer.toString('base64')}`,
      assessment,
      weatherSnapshot,
      decision,
      managementActions,
      sourceMetadata: {
        providerAI: activeAiProvider.constructor.name,
        providerWeather: weatherSnapshot.provider,
        engineVersion: `v1.0.0-stage11f-${reliability.status.toLowerCase()}`,
        processedAt: createdAt,
      },
      notes: input.notes,
    };

    // 8. Persistence (Mongoose if connected, else InMem fallback)
    if (mongoose.connection.readyState === 1) {
      try {
        await AnalysisModel.create({
          ...analysis,
          _id: id,
        });
      } catch {
        await InMemAnalysisStore.save(analysis);
      }
    } else {
      await InMemAnalysisStore.save(analysis);
    }

    return analysis;
  }

  public async getAnalysisById(id: string, sessionId?: string, userId?: string): Promise<FieldAnalysis | null> {
    if (mongoose.connection.readyState === 1) {
      try {
        const query: any = { _id: id };
        const doc = await AnalysisModel.findOne(query);
        if (doc) {
          // Ownership verification: If userId is provided, user must match analysis.userId
          if (userId && doc.userId && doc.userId !== userId) {
            return null;
          }
          if (sessionId && doc.sessionId !== sessionId && !doc.userId) {
            return null;
          }
          return {
            id: String(doc._id),
            sessionId: doc.sessionId,
            userId: doc.userId,
            createdAt: doc.createdAt,
            location: doc.location,
            latitude: doc.latitude,
            longitude: doc.longitude,
            crop: doc.crop,
            photoUrl: doc.photoUrl,
            assessment: doc.assessment,
            weatherSnapshot: doc.weatherSnapshot,
            decision: doc.decision,
            managementActions: doc.managementActions,
            sourceMetadata: doc.sourceMetadata,
            notes: doc.notes,
          };
        }
      } catch {
        // Fallback to in-mem store
      }
    }
    return InMemAnalysisStore.findById(id, sessionId, userId);
  }

  public async getHistory(sessionId: string, userId?: string): Promise<FieldAnalysis[]> {
    if (userId) {
      return this.getHistoryByUser(userId);
    }

    if (mongoose.connection.readyState === 1) {
      try {
        const docs = await AnalysisModel.find({ sessionId }).sort({ createdAt: -1 }).limit(50);
        return docs.map((doc) => ({
          id: String(doc._id),
          sessionId: doc.sessionId,
          userId: doc.userId,
          createdAt: doc.createdAt,
          location: doc.location,
          latitude: doc.latitude,
          longitude: doc.longitude,
          crop: doc.crop,
          photoUrl: doc.photoUrl,
          assessment: doc.assessment,
          weatherSnapshot: doc.weatherSnapshot,
          decision: doc.decision,
          managementActions: doc.managementActions,
          sourceMetadata: doc.sourceMetadata,
          notes: doc.notes,
        }));
      } catch {
        // Fallback to in-mem store
      }
    }
    return InMemAnalysisStore.findBySession(sessionId);
  }

  public async getHistoryByUser(userId: string): Promise<FieldAnalysis[]> {
    if (mongoose.connection.readyState === 1) {
      try {
        const docs = await AnalysisModel.find({ userId }).sort({ createdAt: -1 }).limit(50);
        return docs.map((doc) => ({
          id: String(doc._id),
          sessionId: doc.sessionId,
          userId: doc.userId,
          createdAt: doc.createdAt,
          location: doc.location,
          latitude: doc.latitude,
          longitude: doc.longitude,
          crop: doc.crop,
          photoUrl: doc.photoUrl,
          assessment: doc.assessment,
          weatherSnapshot: doc.weatherSnapshot,
          decision: doc.decision,
          managementActions: doc.managementActions,
          sourceMetadata: doc.sourceMetadata,
          notes: doc.notes,
        }));
      } catch {
        // Fallback
      }
    }
    return InMemAnalysisStore.findByUser(userId);
  }

  public async askAssistant(question: string, contextCrop?: any, analysisId?: string): Promise<string> {
    let contextAnalysis: any = undefined;
    if (analysisId) {
      const record = await this.getAnalysisById(analysisId);
      if (record) {
        contextAnalysis = record.assessment;
      }
    }
    const provider = this.customAiProvider || getAIProvider();
    return provider.answerFieldQuestion(question, contextCrop, contextAnalysis);
  }
}
