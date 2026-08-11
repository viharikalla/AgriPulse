import { AIProvider } from './AIProvider.js';
import { SupportedCrop, CropAssessment } from '../../types/index.js';
import { getConditionById } from '../../data/cropTaxonomy.js';

export class MockAIProvider implements AIProvider {
  private customAssessment?: Partial<CropAssessment>;

  constructor(customAssessment?: Partial<CropAssessment>) {
    this.customAssessment = customAssessment;
  }

  async analyzeCrop(
    _imageBuffer: Buffer,
    _mimeType: string,
    crop: SupportedCrop,
    location: string
  ): Promise<CropAssessment> {
    // Map crop to realistic default diagnostic condition
    let conditionId = 'tomato_early_blight';
    if (crop === 'Rice') conditionId = 'rice_brown_spot';
    if (crop === 'Chilli') conditionId = 'chilli_anthracnose';
    if (crop === 'Potato') conditionId = 'potato_early_blight';
    if (crop === 'Maize') conditionId = 'maize_fall_armyworm_damage';

    const taxonomy = getConditionById(crop, conditionId);

    const baseAssessment: CropAssessment = {
      id: `ass-${Date.now()}`,
      cropName: crop,
      primaryCondition: {
        id: taxonomy.id,
        name: taxonomy.name,
        category: taxonomy.category,
        severity: taxonomy.severity,
        description: taxonomy.description,
        symptoms: taxonomy.symptoms,
      },
      confidenceScore: 0.93,
      confidenceLevel: 'High',
      visualObservations: [
        `Visual diagnostic match for ${crop} condition in ${location}.`,
        `Concentric necrotic lesions and leaf margin chlorosis identified.`,
      ],
      diagnosisSummary: `High-confidence visual evidence detection of ${taxonomy.name}.`,
      imageQuality: {
        isValid: true,
        mimeType: _mimeType,
        sizeBytes: _imageBuffer.length,
        resized: true,
        qualityNotes: 'Sufficient illumination and resolution for feature extraction.',
      },
    };

    if (this.customAssessment) {
      return {
        ...baseAssessment,
        ...this.customAssessment,
        primaryCondition: {
          ...baseAssessment.primaryCondition,
          ...(this.customAssessment.primaryCondition || {}),
        },
      };
    }

    return baseAssessment;
  }

  async answerFieldQuestion(
    question: string,
    contextCrop?: SupportedCrop,
    contextAnalysis?: CropAssessment
  ): Promise<string> {
    const qLower = question.toLowerCase();

    // Reliability safety check: if diagnosis is unconfirmed / low confidence / unknown, do not assume specific disease or chemical advice
    const isNeedsReview =
      contextAnalysis &&
      (contextAnalysis.confidenceLevel === 'Low' ||
        contextAnalysis.confidenceScore < 0.7 ||
        contextAnalysis.primaryCondition?.id?.includes('unknown') ||
        contextAnalysis.primaryCondition?.name?.toLowerCase().includes('unknown') ||
        contextAnalysis.primaryCondition?.name?.toLowerCase().includes('unidentified'));

    if (isNeedsReview) {
      return `Agronomic Assistant Safety Notice: The visual diagnosis for ${contextCrop || 'this crop'} is currently unconfirmed (Requires Field Verification). AgriPulse cannot assume a specific disease or recommend chemical treatments. Please inspect foliage closely and consult a local agricultural extension officer before applying any spray.`;
    }

    const conditionName = contextAnalysis?.primaryCondition?.name || 'Early Blight';

    if (qLower.includes('rain') || qLower.includes('wet')) {
      return `For ${conditionName}, postpone application if rain is expected within 4 hours. Protectant fungicides require at least 2 hours of dry foliage for rainfast uptake.`;
    }
    if (qLower.includes('dose') || qLower.includes('quantity') || qLower.includes('mix')) {
      return `For ${conditionName}, standard recommended dosage for protectant spray is 2.0 grams per liter of water (approx 150-200 L per acre). Always wear PPE during mixing.`;
    }
    if (qLower.includes('when') || qLower.includes('time')) {
      return `The optimal weather window for ${conditionName} treatment is tomorrow morning from 07:00 to 10:30 AM when wind speed stays under 8 km/h and rain chance is 10%.`;
    }

    return `Agronomic answer for ${contextCrop || 'crop'} inquiry regarding ${conditionName}: Inspect leaf undersides daily and ensure foliage undersides receive uniform spray coverage during calm morning weather windows.`;
  }
}
