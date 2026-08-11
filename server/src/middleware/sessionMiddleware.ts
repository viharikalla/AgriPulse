import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

declare global {
  namespace Express {
    interface Request {
      sessionId: string;
    }
  }
}

export const SESSION_COOKIE_NAME = 'agripulse_sid';

export function sessionMiddleware(req: Request, res: Response, next: NextFunction): void {
  // Check cookie or header for session ID
  let sid = req.cookies?.[SESSION_COOKIE_NAME] || (req.headers['x-session-id'] as string);

  if (!sid || typeof sid !== 'string' || sid.trim().length < 8) {
    sid = `sid_${crypto.randomUUID()}`;
    res.cookie(SESSION_COOKIE_NAME, sid, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    });
  }

  req.sessionId = sid;
  res.setHeader('X-Session-ID', sid);
  next();
}
