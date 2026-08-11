import { Request, Response } from 'express';
import { config } from '../config/index.js';

export function getHealth(_req: Request, res: Response): void {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: config.env,
      version: '0.1.0-stage7',
    },
  });
}
