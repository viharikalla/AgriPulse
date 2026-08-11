import mongoose from 'mongoose';
import { config } from '../config/index.js';

export function getSanitizedMongoUri(uri: string): string {
  if (!uri) return '';
  return uri.replace(/\/\/(.*):(.*)@/, '//$1:****@');
}

export async function connectDatabase(customUri?: string): Promise<boolean> {
  const uri = customUri !== undefined ? customUri : config.mongoUri;
  if (!uri || uri.trim() === '') {
    if (config.env !== 'test') {
      console.log('[AgriPulse DB] MONGODB_URI not provided. Running in in-memory fallback mode.');
    }
    return false;
  }

  const sanitizedUri = getSanitizedMongoUri(uri);

  try {
    if (config.env !== 'test') {
      console.log(`[AgriPulse DB] Connecting to MongoDB at ${sanitizedUri}...`);
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });

    if (config.env !== 'test') {
      console.log(`[AgriPulse DB] MongoDB successfully connected (${sanitizedUri}).`);
    }
    return true;
  } catch (err: any) {
    console.warn(
      `[AgriPulse DB] MongoDB connection warning: ${err.message || 'Connection failed'}. Falling back to in-memory storage.`
    );
    return false;
  }
}

export async function disconnectDatabase(): Promise<void> {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    if (config.env !== 'test') {
      console.log('[AgriPulse DB] MongoDB disconnected cleanly.');
    }
  }
}
