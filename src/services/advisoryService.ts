import { FieldAnalysis, SupportedCropName } from '../types';
import { MOCK_ANALYSES, MOCK_WEATHER_SNAPSHOT } from '../data/mockData';
import { SUPPORTED_CROPS } from '../config/crops';

export class AdvisoryService {
  private static mockDatabase: FieldAnalysis[] = [...MOCK_ANALYSES];

  public static async getHistory(): Promise<FieldAnalysis[]> {
    // Simulate minor network delay
    await new Promise((resolve) => setTimeout(resolve, 200));
    return [...this.mockDatabase];
  }

  public static async getById(id: string): Promise<FieldAnalysis | null> {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const record = this.mockDatabase.find((item) => item.id === id);
    return record || null;
  }

  public static async createAnalysis(input: {
    cropName: SupportedCropName;
    location: string;
    photoUrl: string;
  }): Promise<FieldAnalysis> {
    await new Promise((resolve) => setTimeout(resolve, 600));

    const crop = SUPPORTED_CROPS.find((c) => c.name === input.cropName) || SUPPORTED_CROPS[0];
    const newId = `adv-${Date.now().toString().slice(-4)}`;

    const newAnalysis: FieldAnalysis = {
      id: newId,
      createdAt: new Date().toISOString(),
      location: input.location || 'Guntur District, Andhra Pradesh',
      crop,
      photoUrl: input.photoUrl,
      assessment: {
        id: `ass-${Date.now()}`,
        primaryCondition: {
          id: `cond-${crop.name.toLowerCase()}`,
          name: `${crop.name} Foliar Disease Spotting`,
          category: 'Fungal Disease',
          severity: 'Moderate',
          description: `Diagnostic symptoms of fungal foliar lesioning on ${crop.name}.`,
          symptoms: ['Leaf chlorosis', 'Necrotic spot borders', 'Reduced photosynthetic area'],
        },
        confidenceScore: 0.91,
        visualObservations: [
          `Visual lesion coverage on ${crop.name} leaves`,
          'Early canopy yellowing in lower third of plant',
        ],
        diagnosisSummary: `AI image recognition detected moderate fungal foliar spot on ${crop.name}.`,
      },
      weatherSnapshot: MOCK_WEATHER_SNAPSHOT,
      decision: {
        summaryTitle: `Targeted Spray Window for ${crop.name}`,
        primaryAction: {
          id: `act-${Date.now()}`,
          actionType: 'Spray',
          title: `Apply Broad-Spectrum Protectant Fungicide on ${crop.name}`,
          description: `Foliar spray targeted at affected ${crop.name} canopy.`,
          recommendedDosage: '2.0 g/L water (approx 150-200L per acre)',
          timingWindow: {
            bestStartTime: '17:00',
            bestEndTime: '18:30',
            suitabilityScore: 89,
            recommendationReason: 'Low precipitation probability (<10%) and wind speeds under 10 km/h.',
            riskFactors: ['Spraying during high temperature hours causes drop evaporation'],
            weatherConstraintReasoning: '17:00 window prevents leaf wash-off from midday rain showers.',
          },
          precautions: ['Use PPE kit during preparation', 'Ensure uniform foliage coverage'],
          priority: 'High',
        },
        actionWindow: {
          bestStartTime: '17:00 Today',
          bestEndTime: '18:30 Today',
          suitabilityScore: 89,
          recommendationReason: 'Favorable 90-minute spray weather window.',
          riskFactors: ['High winds earlier in the afternoon'],
          weatherConstraintReasoning: 'Avoids chemical drift and rain wash-off.',
        },
        monitoringChecklist: [
          'Inspect leaf underside 48h post application for spore halting.',
          'Monitor next 24h rain forecast for re-application needs.',
        ],
        rationale: `Applying treatment during the 17:00 window maximizes chemical uptake on ${crop.name} foliage.`,
      },
      managementActions: [
        {
          id: `act-1`,
          actionType: 'Spray',
          title: 'Foliar Protectant Spray',
          description: `Apply protectant fungicide on ${crop.name}.`,
          recommendedDosage: '2.0 g/L water',
          timingWindow: {
            bestStartTime: '17:00',
            bestEndTime: '18:30',
            suitabilityScore: 89,
            recommendationReason: 'Optimal spray window.',
            riskFactors: [],
            weatherConstraintReasoning: 'No rain risk.',
          },
          precautions: ['Wear gloves and mask'],
          priority: 'High',
        },
      ],
    };

    this.mockDatabase.unshift(newAnalysis);
    return newAnalysis;
  }
}
