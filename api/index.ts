import { app } from '../server/src/app.js';
import { connectDatabase } from '../server/src/db/connection.js';

export default async function handler(req: any, res: any) {
  try {
    await connectDatabase();
  } catch (err) {
    console.warn('[AgriPulse Serverless DB] Connection warning:', err);
  }
  return app(req, res);
}
