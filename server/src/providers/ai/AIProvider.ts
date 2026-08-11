import { SupportedCrop, CropAssessment } from '../../types/index.js';

export interface AIProvider {
  analyzeCrop(imageBuffer: Buffer, mimeType: string, crop: SupportedCrop, location: string): Promise<CropAssessment>;
  answerFieldQuestion(question: string, contextCrop?: SupportedCrop, contextAnalysis?: CropAssessment): Promise<string>;
}
