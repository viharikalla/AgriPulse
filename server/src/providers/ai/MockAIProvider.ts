import { AIProvider } from './AIProvider.js';
import { SupportedCrop, CropAssessment } from '../../types/index.js';
import { getConditionById } from '../../data/cropTaxonomy.js';

export class MockAIProvider implements AIProvider {
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

    return {
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
  }

  async answerFieldQuestion(
    question: string,
    contextCrop?: SupportedCrop,
    _contextAnalysis?: CropAssessment
  ): Promise<string> {
    const qLower = question.toLowerCase();

    if (qLower.includes('rain') || qLower.includes('wet')) {
      return 'If rain occurs before spray dry time, postpone application. Protectant fungicides require at least 2 hours of dry foliage for rainfast uptake.';
    }
    if (qLower.includes('dose') || qLower.includes('quantity') || qLower.includes('mix')) {
      return 'Standard recommended dosage for protectant spray is 2.0 grams per liter of water (approx 150-200 L per acre). Always wear PPE during mixing.';
    }
    if (qLower.includes('when') || qLower.includes('time')) {
      return 'The optimal weather window is tomorrow morning from 07:00 to 10:30 AM when wind speed stays under 8 km/h and rain chance is 10%.';
    }

    return `Agronomic answer for ${contextCrop || 'crop'} inquiry: Inspect leaf undersides daily and ensure foliage undersides receive uniform spray coverage during calm morning weather windows.`;
  }
}
