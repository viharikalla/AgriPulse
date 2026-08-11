import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/authService.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { config } from '../config/index.js';

export class AuthController {
  public static async signup(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, email, password, confirmPassword } = req.body || {};

      if (!confirmPassword || confirmPassword !== password) {
        res.status(400).json({
          success: false,
          error: {
            code: 'PASSWORD_MISMATCH',
            message: 'Confirm password must match the password exactly.',
          },
        });
        return;
      }

      const user = await AuthService.signup({ name, email, password });
      const token = AuthService.generateToken(user);

      res.cookie('agripulse_session', token, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 3600 * 1000,
      });

      res.status(201).json({
        success: true,
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = req.body || {};
      const { user, token } = await AuthService.login({ email, password });

      res.cookie('agripulse_session', token, {
        httpOnly: true,
        secure: config.env === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 3600 * 1000,
      });

      res.status(200).json({
        success: true,
        data: { user },
      });
    } catch (err) {
      next(err);
    }
  }

  public static async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie('agripulse_session', {
      httpOnly: true,
      secure: config.env === 'production',
      sameSite: 'lax',
    });

    res.status(200).json({
      success: true,
      data: { message: 'Logged out successfully.' },
    });
  }

  public static async getMe(req: AuthenticatedRequest, res: Response): Promise<void> {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'Unauthenticated.',
        },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: { user: req.user },
    });
  }
}
