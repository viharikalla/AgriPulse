import { Request, Response, NextFunction } from 'express';
import { LocationService } from '../services/locationService.js';

export async function searchLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const q = (req.query.q as string) || '';
    if (!q || q.trim().length < 2) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Query parameter q must be at least 2 characters long.',
        },
      });
      return;
    }

    const locations = await LocationService.searchLocations(q.trim());

    res.status(200).json({
      success: true,
      locations,
      data: locations,
    });
  } catch (err) {
    next(err);
  }
}
