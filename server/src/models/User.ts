import mongoose, { Schema, Document } from 'mongoose';
import { User } from '../types/index.js';

export interface IUserDocument extends Document {
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  updatedAt: string;
  toSafeObject(): User;
}

const UserSchema = new Schema<IUserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    createdAt: { type: String, required: true, default: () => new Date().toISOString() },
    updatedAt: { type: String, required: true, default: () => new Date().toISOString() },
  },
  {
    timestamps: true,
  }
);

UserSchema.methods.toSafeObject = function (): User {
  return {
    id: String(this._id),
    name: this.name,
    email: this.email,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const UserModel = mongoose.model<IUserDocument>('User', UserSchema);

// In-Memory Fallback User Repository for Dev/Test mode
export class InMemUserStore {
  private static users: Map<string, { id: string; name: string; email: string; passwordHash: string; createdAt: string; updatedAt: string }> = new Map();

  public static async save(user: { id: string; name: string; email: string; passwordHash: string }): Promise<User> {
    const createdAt = new Date().toISOString();
    const record = {
      ...user,
      email: user.email.toLowerCase().trim(),
      createdAt,
      updatedAt: createdAt,
    };
    this.users.set(user.id, record);
    return {
      id: record.id,
      name: record.name,
      email: record.email,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  public static async findByEmail(email: string): Promise<{ id: string; name: string; email: string; passwordHash: string; createdAt: string; updatedAt: string } | null> {
    const norm = email.toLowerCase().trim();
    for (const u of this.users.values()) {
      if (u.email === norm) return u;
    }
    return null;
  }

  public static async findById(id: string): Promise<User | null> {
    const u = this.users.get(id);
    if (!u) return null;
    return {
      id: u.id,
      name: u.name,
      email: u.email,
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    };
  }

  public static clear(): void {
    this.users.clear();
  }
}
