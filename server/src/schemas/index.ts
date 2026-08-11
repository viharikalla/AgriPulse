import { z } from 'zod';
import { config } from '../config/index.js';

export const SupportedCropSchema = z.enum(['Rice', 'Tomato', 'Chilli', 'Potato', 'Maize']);

export const AnalyzeRequestSchema = z.object({
  crop: SupportedCropSchema,
  location: z.string().min(2, 'Location name is required').max(150, 'Location too long'),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  notes: z.string().max(500, 'Notes max length is 500 characters').optional(),
});

export const ImageValidationSchema = z.object({
  mimeType: z.string().refine((val) => config.allowedMimeTypes.includes(val), {
    message: 'Invalid image MIME type. Allowed: JPEG, PNG, WebP.',
  }),
  sizeBytes: z.number().max(config.maxImageSizeBytes, {
    message: 'Image size exceeds maximum limit of 10 MB.',
  }),
});

export const AssistantRequestSchema = z.object({
  question: z.string().min(3, 'Question must be at least 3 characters long').max(400, 'Question max length is 400 characters'),
  analysisId: z.string().optional(),
  contextCrop: SupportedCropSchema.optional(),
});

export const IdParamSchema = z.object({
  id: z.string().min(1, 'ID parameter is required').max(100),
});
