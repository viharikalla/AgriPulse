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

export const WeatherSensitivitySchema = z.object({
  rainfall: z.enum(['unfavorable', 'favorable_for_disease', 'neutral']),
  humidity: z.enum(['favorable_for_disease', 'unfavorable_for_disease', 'neutral']),
  wind: z.enum(['spreads_spores', 'promotes_drying', 'neutral']),
  dryWindowHours: z.number().min(1).max(24),
  daylightPreferred: z.boolean(),
});

export const SourceMetadataSchema = z.object({
  title: z.string().min(3),
  organization: z.string().min(2),
  url: z.string().url().optional(),
  accessedAt: z.string().min(8),
});

export const AgronomyConditionEntrySchema = z.object({
  id: z.string().min(2),
  crop: SupportedCropEnum,
  condition: z.string().min(2),
  displayName: z.string().min(3),
  summary: z.string().min(10),
  visibleSymptoms: z.array(z.string()).min(1),
  differentialClues: z.array(z.string()).min(1),
  managementPrinciples: z.array(z.string()).min(1),
  monitoring: z.array(z.string()).min(1),
  prevention: z.array(z.string()).min(1),
  weatherSensitivity: WeatherSensitivitySchema,
  severityGuidance: z.string().min(5),
  sources: z.array(SourceMetadataSchema).min(1),
  confidenceNotes: z.string().min(5),
});

export type AgronomyConditionEntry = z.infer<typeof AgronomyConditionEntrySchema>;
