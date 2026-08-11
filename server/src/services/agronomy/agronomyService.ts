import { SupportedCrop, CropAssessment, ManagementAction } from '../../types/index.js';
import { AgronomyConditionEntry } from '../../schemas/agronomySchema.js';
import { AGRONOMY_KNOWLEDGE_BASE } from '../../data/agronomy/index.js';

export class AgronomyService {
  public static isConditionSupported(crop: SupportedCrop, condition: string): boolean {
    const entries = AGRONOMY_KNOWLEDGE_BASE[crop];
    if (!entries) return false;
    return entries.some((e) => e.condition.toLowerCase() === condition.toLowerCase());
  }

  public static getCrop(crop: SupportedCrop): AgronomyConditionEntry[] {
    return AGRONOMY_KNOWLEDGE_BASE[crop] || [];
  }

  public static getConditions(crop: SupportedCrop): AgronomyConditionEntry[] {
    return this.getCrop(crop);
  }

  public static getCondition(crop: SupportedCrop, condition: string): AgronomyConditionEntry {
    const entries = this.getCrop(crop);
    const found = entries.find((e) => e.condition.toLowerCase() === condition.toLowerCase());
    if (found) return found;

    // Fallback to unknown entry for crop
    const unknown = entries.find((e) => e.condition.toLowerCase() === 'unknown');
    if (unknown) return unknown;

    throw new Error(`Unsupported crop condition '${condition}' for '${crop}'.`);
  }

  public static getManagement(crop: SupportedCrop, condition: string) {
    const entry = this.getCondition(crop, condition);
    return {
      managementPrinciples: entry.managementPrinciples,
      prevention: entry.prevention,
      severityGuidance: entry.severityGuidance,
    };
  }

  public static getWeatherProfile(crop: SupportedCrop, condition: string) {
    const entry = this.getCondition(crop, condition);
    return entry.weatherSensitivity;
  }

  public static getSources(crop: SupportedCrop, condition: string) {
    const entry = this.getCondition(crop, condition);
    return entry.sources;
  }

  public static getManagementActions(assessment: CropAssessment): ManagementAction[] {
    const rawConditionId = assessment.primaryCondition.id.split('_').slice(1).join('_') || 'unknown';
    const entry = this.getCondition(assessment.cropName, rawConditionId);

    const isUnknown = rawConditionId === 'unknown' || assessment.primaryCondition.name.toLowerCase().includes('unknown');
    const isLowConfidence = assessment.confidenceLevel === 'Low' || assessment.confidenceScore < 0.7;

    if (isUnknown || isLowConfidence) {
      return [
        {
          id: `act-review-${Date.now()}`,
          actionType: 'Inspect',
          title: 'Manual Field Verification Required',
          description: 'Visual evidence requires certified agronomic field inspection before applying chemical controls.',
          recommendedDosage: 'N/A - Chemical treatment not advised without visual confirmation.',
          timingWindow: {
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + 24 * 3600000).toISOString(),
            durationHours: 0,
            averageScore: 0,
            minimumScore: 0,
            maximumScore: 0,
            status: 'INSUFFICIENT_DATA',
            reasons: ['Diagnostic confidence insufficient for chemical spray calculation.'],
            constraints: ['Requires visual field confirmation'],
            weatherSummary: {
              minTempC: 20,
              maxTempC: 30,
              avgHumidityPct: 60,
              maxPrecipProbabilityPct: 0,
              totalPrecipitationMm: 0,
              maxWindSpeedKmh: 10,
              maxWindGustKmh: 15,
              dominantCondition: 'Clear',
            },
            bestStartTime: 'N/A',
            bestEndTime: 'N/A',
            suitabilityScore: 0,
            recommendationReason: 'Requires visual field confirmation',
            riskFactors: ['Unconfirmed diagnosis risk'],
            weatherConstraintReasoning: 'Spraying unconfirmed target diseases causes ineffective control.',
          },
          precautions: [
            'Inspect affected leaves and stem junctions closely.',
            'Consult a certified local extension officer before applying crop protection chemicals.',
          ],
          priority: 'High',
        },
      ];
    }
    return [
      {
        id: `act-1-${Date.now()}`,
        actionType: 'Spray',
        title: `Management Protocol for ${entry.displayName}`,
        description: entry.managementPrinciples[0] || 'Apply locally registered protectant treatment.',
        recommendedDosage: '2.0 g per liter of water (approx 150-200L per acre)',
        timingWindow: {
          startTime: '2026-08-11T07:00:00+05:30',
          endTime: '2026-08-11T10:30:00+05:30',
          durationHours: 3.5,
          averageScore: 88,
          minimumScore: 80,
          maximumScore: 92,
          status: 'FAVORABLE',
          reasons: [`Dry window required for ${entry.displayName}.`],
          constraints: ['Precipitation wash-off risk'],
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
          recommendationReason: `Dry window required for ${entry.displayName}.`,
          riskFactors: ['Precipitation wash-off risk'],
          weatherConstraintReasoning: 'Spraying during rain probability leads to chemical wash-off.',
        },
        precautions: [
          'Wear protective mask and gloves during mixing and spraying.',
          'Ensure complete foliage coverage.',
        ],
        priority: 'High',
      },
    ];
  }

  public static getMonitoringChecklist(assessment: CropAssessment): string[] {
    const entry = this.getCondition(assessment.cropName, assessment.primaryCondition.id.split('_').slice(1).join('_') || 'early_blight');
    return entry.monitoring;
  }
}
