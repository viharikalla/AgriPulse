import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../../types/index.js';
import { UserModel, InMemUserStore } from '../../models/User.js';
import { config } from '../../config/index.js';
import mongoose from 'mongoose';

export interface SignupInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export class AuthService {
  private static JWT_SECRET = config.sessionSecret || 'agripulse_jwt_secret_32bytes_key';

  public static generateToken(user: User): string {
    return jwt.sign(
      { id: user.id, email: user.email, name: user.name },
      this.JWT_SECRET,
      { expiresIn: '7d' }
    );
  }

  public static verifyToken(token: string): { id: string; email: string; name: string } | null {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as any;
      if (decoded && decoded.id && decoded.email) {
        return { id: decoded.id, email: decoded.email, name: decoded.name };
      }
    } catch {
      // Invalid or expired token
    }
    return null;
  }

  public static validatePasswordRequirements(password: string): string | null {
    if (!password || password.length < 8) {
      return 'Password must be at least 8 characters long.';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter.';
    }
    if (!/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter.';
    }
    if (!/[0-9]/.test(password)) {
      return 'Password must contain at least one number.';
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return 'Password must contain at least one special character.';
    }
    return null;
  }

  public static async signup(input: SignupInput): Promise<User> {
    const trimmedName = input.name ? input.name.trim() : '';
    const normEmail = input.email ? input.email.toLowerCase().trim() : '';

    if (!trimmedName || trimmedName.length > 100) {
      const err = new Error('Full name is required (maximum 100 characters).');
      (err as any).status = 400;
      (err as any).code = 'INVALID_NAME';
      throw err;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!normEmail || !emailRegex.test(normEmail)) {
      const err = new Error('Please enter a valid email address.');
      (err as any).status = 400;
      (err as any).code = 'INVALID_EMAIL';
      throw err;
    }

    const passError = this.validatePasswordRequirements(input.password);
    if (passError) {
      const err = new Error(passError);
      (err as any).status = 400;
      (err as any).code = 'WEAK_PASSWORD';
      throw err;
    }

    // Check for existing user
    if (mongoose.connection.readyState === 1) {
      const existing = await UserModel.findOne({ email: normEmail });
      if (existing) {
        const err = new Error('An account with this email already exists.');
        (err as any).status = 409;
        (err as any).code = 'EMAIL_EXISTS';
        throw err;
      }
    } else {
      const existing = await InMemUserStore.findByEmail(normEmail);
      if (existing) {
        const err = new Error('An account with this email already exists.');
        (err as any).status = 409;
        (err as any).code = 'EMAIL_EXISTS';
        throw err;
      }
    }

    // Hash password with bcrypt cost factor 10
    const passwordHash = await bcrypt.hash(input.password, 10);

    if (mongoose.connection.readyState === 1) {
      const doc = await UserModel.create({
        name: trimmedName,
        email: normEmail,
        passwordHash,
      });
      return doc.toSafeObject();
    } else {
      const id = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      return InMemUserStore.save({ id, name: trimmedName, email: normEmail, passwordHash });
    }
  }

  public static async login(input: LoginInput): Promise<{ user: User; token: string }> {
    const normEmail = input.email ? input.email.toLowerCase().trim() : '';
    const genericAuthError = new Error('Email or password is incorrect.');
    (genericAuthError as any).status = 401;
    (genericAuthError as any).code = 'INVALID_CREDENTIALS';

    if (!normEmail || !input.password) {
      throw genericAuthError;
    }

    let foundUser: { id: string; name: string; email: string; passwordHash: string; createdAt: string; updatedAt?: string } | null = null;

    if (mongoose.connection.readyState === 1) {
      const doc = await UserModel.findOne({ email: normEmail });
      if (doc) {
        foundUser = {
          id: String(doc._id),
          name: doc.name,
          email: doc.email,
          passwordHash: doc.passwordHash,
          createdAt: doc.createdAt,
          updatedAt: doc.updatedAt,
        };
      }
    } else {
      foundUser = await InMemUserStore.findByEmail(normEmail);
    }

    if (!foundUser) {
      throw genericAuthError;
    }

    const isValid = await bcrypt.compare(input.password, foundUser.passwordHash);
    if (!isValid) {
      throw genericAuthError;
    }

    const safeUser: User = {
      id: foundUser.id,
      name: foundUser.name,
      email: foundUser.email,
      createdAt: foundUser.createdAt,
      updatedAt: foundUser.updatedAt,
    };

    const token = this.generateToken(safeUser);
    return { user: safeUser, token };
  }

  public static async getUserById(id: string): Promise<User | null> {
    if (mongoose.connection.readyState === 1) {
      const doc = await UserModel.findById(id);
      return doc ? doc.toSafeObject() : null;
    }
    return InMemUserStore.findById(id);
  }
}
