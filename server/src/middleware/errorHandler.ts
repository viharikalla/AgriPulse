import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  status?: number;
  code?: string;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  let statusCode = err.statusCode || err.status || (err instanceof ZodError ? 400 : 500);
  let code = err.code || (err instanceof ZodError ? 'VALIDATION_ERROR' : 'INTERNAL_SERVER_ERROR');

  if (err.code) {
    switch (err.code) {
      case 'AI_INVALID_REQUEST':
        statusCode = 400;
        break;
      case 'AI_PERMISSION_DENIED':
        statusCode = 403;
        break;
      case 'AI_MODEL_UNAVAILABLE':
        statusCode = 404;
        break;
      case 'AI_RATE_LIMITED':
        statusCode = 429;
        break;
      case 'AI_PROVIDER_ERROR':
        statusCode = 500;
        break;
      case 'AI_PROVIDER_UNAVAILABLE':
        statusCode = 503;
        break;
      case 'AI_TIMEOUT':
        statusCode = 504;
        break;
    }
  }

  let message = err.message || 'An unexpected error occurred.';
  if (err instanceof ZodError) {
    message = err.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
  }

  // Ensure secrets/keys are never exposed in error responses
  const sanitizedMessage = message.replace(/key=[^&\s]+/gi, 'key=REDACTED');

  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message: sanitizedMessage,
    },
  });
}
