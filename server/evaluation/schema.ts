import { z } from 'zod';

export const SupportedCropEnum = z.enum([
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
]);

export type EvaluationCrop = z.infer<typeof SupportedCropEnum>;

export const EvaluationCaseSchema = z.object({
  id: z.string().min(1, 'Case ID is required'),
  crop: SupportedCropEnum,
  expectedCondition: z.string().min(1, 'Expected condition ID is required'),
  imagePath: z.string().min(1, 'Image path is required'),
  datasetSource: z.string().min(1, 'Dataset source is required'),
  imageQuality: z.enum(['good', 'fair', 'poor']).default('good'),
  notes: z.string().optional(),
});

export type EvaluationCase = z.infer<typeof EvaluationCaseSchema>;

export const EvaluationSetSchema = z.array(EvaluationCaseSchema);
