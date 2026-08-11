import { Response, NextFunction } from 'express';
import { AnalysisService } from '../services/analysis/analysisService.js';
import { AnalyzeRequestSchema, IdParamSchema, ImageValidationSchema } from '../schemas/index.js';
import { SupportedCrop } from '../types/index.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const analysisService = new AnalysisService();

export async function analyzeField(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_FILE',
          message: 'Crop image file is required.',
        },
      });
      return;
    }

    // Validate Image
    ImageValidationSchema.parse({
      mimeType: file.mimetype,
      sizeBytes: file.size,
    });

    // Validate Input Payload
    const parsedInput = AnalyzeRequestSchema.parse({
      crop: req.body.crop as SupportedCrop,
      location: req.body.location,
      latitude: req.body.latitude ? parseFloat(req.body.latitude) : undefined,
      longitude: req.body.longitude ? parseFloat(req.body.longitude) : undefined,
      notes: req.body.notes,
    });

    // Execute Analysis Pipeline with optional User ID ownership
    const result = await analysisService.analyzeField(
      file.buffer,
      file.mimetype,
      parsedInput,
      req.sessionId,
      req.user?.id
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getAnalysisById(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = IdParamSchema.parse(req.params);
    const result = await analysisService.getAnalysisById(id, req.sessionId, req.user?.id);

    if (!result) {
      res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Analysis record not found or access denied.',
        },
      });
      return;
    }

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    (res as any).set('ETag', false);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
}

export async function getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const history = await analysisService.getHistory(req.sessionId, req.user?.id);

    res.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    (res as any).set('ETag', false);

    res.status(200).json({
      success: true,
      data: history,
    });
  } catch (err) {
    next(err);
  }
}
