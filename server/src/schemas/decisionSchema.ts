import { z } from 'zod';
import { SupportedCropEnum } from './agronomySchema.js';

export const DecisionEvaluationSchema = z.object({
  crop: SupportedCropEnum,
  condition: z.string().min(2, 'Condition parameter is required'),
  severity: z.enum(['Healthy', 'Low', 'Moderate', 'High', 'Critical']).optional().default('Moderate'),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  locationName: z.string().optional(),
});
