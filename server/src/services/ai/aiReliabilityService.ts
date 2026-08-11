import { CropAssessment, SupportedCrop } from '../../types/index.js';
import { AgronomyService } from '../agronomy/agronomyService.js';
import { config } from '../../config/index.js';

export type ReliabilityStatus = 'RELIABLE' | 'NEEDS_REVIEW' | 'UNSUPPORTED';

export type ReliabilityReason =
  | 'HIGH_CONFIDENCE_MATCH'
  | 'LOW_CONFIDENCE'
  | 'UNKNOWN_CONDITION'
  | 'UNKNOWN_CROP'
  | 'UNSUPPORTED_CROP'
  | 'UNSUPPORTED_CONDITION'
  | 'POOR_IMAGE_QUALITY'
  | 'CROP_MISMATCH'
  | 'COMPETING_DIAGNOSIS';

export interface ReliabilityResult {
  status: ReliabilityStatus;
  reasonCode: ReliabilityReason;
  message: string;
  isReliable: boolean;
  minConfidence: number;
  evaluatedConfidence: number;
  detectedCrop: string;
  detectedCondition: string;
  competingDiagnosis?: {
    condition: string;
    confidence: number;
  };
}

export class AIReliabilityService {
  public static evaluate(
    assessment: CropAssessment,
    userSelectedCrop?: SupportedCrop
  ): ReliabilityResult {
    const minConfidence = config.geminiMinConfidence || 0.7;
    const evaluatedConfidence = Math.max(0, Math.min(1, assessment.confidenceScore));
    const detectedCrop = assessment.cropName;
    const detectedCondition = assessment.primaryCondition.name;
    const rawConditionId = assessment.primaryCondition.id.split('_').slice(1).join('_') || 'unknown';

    // 1. Unknown / Invalid Crop Check
    const supportedCrops: SupportedCrop[] = [
      'Rice',
      'Wheat',
      'Maize',
      'Tomato',
      'Potato',
      'Chilli',
      'Soybean',
      'Groundnut',
      'Chickpea',
      'Cotton',
    ];

    if (!detectedCrop || detectedCrop.toLowerCase() === 'unknown') {
      return {
        status: 'NEEDS_REVIEW',
        reasonCode: 'UNKNOWN_CROP',
        message: 'AgriPulse could not identify the crop species from this image.',
        isReliable: false,
        minConfidence,
        evaluatedConfidence,
        detectedCrop: 'unknown',
        detectedCondition,
      };
    }

    const isCropSupported = supportedCrops.some((c) => c.toLowerCase() === detectedCrop.toLowerCase());
    if (!isCropSupported) {
      return {
        status: 'NEEDS_REVIEW',
        reasonCode: 'UNSUPPORTED_CROP',
        message: `Crop '${detectedCrop}' is outside the 10 supported AgriPulse crops.`,
        isReliable: false,
        minConfidence,
        evaluatedConfidence,
        detectedCrop,
        detectedCondition,
      };
    }

    // 2. User Selected Crop Mismatch Check
    if (userSelectedCrop) {
      const normUser = userSelectedCrop.toLowerCase();
      const normDetected = detectedCrop.toLowerCase();
      if (normUser !== normDetected && normDetected !== 'unknown') {
        return {
          status: 'NEEDS_REVIEW',
          reasonCode: 'CROP_MISMATCH',
          message: `Selected crop (${userSelectedCrop}) differs from visually detected crop (${detectedCrop}). Please verify field crop selection.`,
          isReliable: false,
          minConfidence,
          evaluatedConfidence,
          detectedCrop,
          detectedCondition,
        };
      }
    }

    // 3. Unknown / Missing Condition Check
    if (
      !rawConditionId ||
      rawConditionId === 'unknown' ||
      detectedCondition.toLowerCase().includes('unknown') ||
      detectedCondition.toLowerCase().includes('unidentified')
    ) {
      return {
        status: 'NEEDS_REVIEW',
        reasonCode: 'UNKNOWN_CONDITION',
        message: 'Visual evidence is insufficient to identify a specific crop condition.',
        isReliable: false,
        minConfidence,
        evaluatedConfidence,
        detectedCrop,
        detectedCondition,
      };
    }

    // 4. Ground-Truth Taxonomy Validation (AgronomyService)
    const isTaxonomySupported = AgronomyService.isConditionSupported(detectedCrop as SupportedCrop, rawConditionId);
    if (!isTaxonomySupported) {
      return {
        status: 'UNSUPPORTED',
        reasonCode: 'UNSUPPORTED_CONDITION',
        message: `Condition '${detectedCondition}' is not in AgriPulse ground-truth agronomy knowledge base.`,
        isReliable: false,
        minConfidence,
        evaluatedConfidence,
        detectedCrop,
        detectedCondition,
      };
    }

    // 5. Confidence Threshold Check
    if (evaluatedConfidence < minConfidence) {
      return {
        status: 'NEEDS_REVIEW',
        reasonCode: 'LOW_CONFIDENCE',
        message: `AI visual confidence (${(evaluatedConfidence * 100).toFixed(0)}%) is below required threshold (${(minConfidence * 100).toFixed(0)}%).`,
        isReliable: false,
        minConfidence,
        evaluatedConfidence,
        detectedCrop,
        detectedCondition,
      };
    }

    // 6. Image Quality Check
    const qualityNotes = assessment.imageQuality?.qualityNotes || '';
    const isPoorQuality = !assessment.imageQuality?.isValid && (qualityNotes.toLowerCase().includes('poor') || qualityNotes.toLowerCase().includes('blurry') || qualityNotes.toLowerCase().includes('too_dark'));
    if (isPoorQuality) {
      return {
        status: 'NEEDS_REVIEW',
        reasonCode: 'POOR_IMAGE_QUALITY',
        message: 'Image quality is too poor or blurry for high-confidence diagnostic feature extraction.',
        isReliable: false,
        minConfidence,
        evaluatedConfidence,
        detectedCrop,
        detectedCondition,
      };
    }

    // 7. Competing Alternative Diagnosis Check (Threshold: alternative >= primary - 0.10)
    // Note: GeminiVisionProvider passes visualObservations / symptoms. If alternative condition present in observation notes or primary summary
    const diagnosisSummary = assessment.diagnosisSummary || '';
    const altMatch = diagnosisSummary.match(/Alternative:\s*([^(\n]+)\s*\(([\d.]+)%\)/i);
    if (altMatch) {
      const altCondition = altMatch[1].trim();
      const altConfidence = parseFloat(altMatch[2]) / 100;
      if (altConfidence >= evaluatedConfidence - 0.10) {
        return {
          status: 'NEEDS_REVIEW',
          reasonCode: 'COMPETING_DIAGNOSIS',
          message: `Strong competing visual diagnosis detected: '${altCondition}' (${(altConfidence * 100).toFixed(0)}% confidence).`,
          isReliable: false,
          minConfidence,
          evaluatedConfidence,
          detectedCrop,
          detectedCondition,
          competingDiagnosis: {
            condition: altCondition,
            confidence: altConfidence,
          },
        };
      }
    }

    // 8. RELIABLE — Passed all diagnostic reliability checks
    return {
      status: 'RELIABLE',
      reasonCode: 'HIGH_CONFIDENCE_MATCH',
      message: `High-confidence grounded visual diagnostic match for ${detectedCondition} in ${detectedCrop}.`,
      isReliable: true,
      minConfidence,
      evaluatedConfidence,
      detectedCrop,
      detectedCondition,
    };
  }
}
