import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/authService.js';
import { User } from '../types/index.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const token =
    req.cookies?.agripulse_session ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

  if (!token) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required. Please log in to access this feature.',
      },
    });
    return;
  }

  const payload = AuthService.verifyToken(token);
  if (!payload) {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication session expired or invalid. Please log in again.',
      },
    });
    return;
  }

  req.user = {
    id: payload.id,
    name: payload.name,
    email: payload.email,
    createdAt: new Date().toISOString(),
  };

  next();
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction): void {
  const token =
    req.cookies?.agripulse_session ||
    (req.headers.authorization?.startsWith('Bearer ') ? req.headers.authorization.split(' ')[1] : null);

  if (token) {
    const payload = AuthService.verifyToken(token);
    if (payload) {
      req.user = {
        id: payload.id,
        name: payload.name,
        email: payload.email,
        createdAt: new Date().toISOString(),
      };
    }
  }

  next();
}
