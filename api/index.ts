import serverApp from '../server/dist/app.js';
import * as serverDb from '../server/dist/db/connection.js';

const app = (serverApp as any).app || (serverApp as any).default || serverApp;
const connectDatabase = serverDb.connectDatabase || (serverDb as any).default?.connectDatabase;

export default async function handler(req: any, res: any) {
  try {
    if (typeof connectDatabase === 'function') {
      await connectDatabase();
    }
  } catch (err) {
    console.warn('[AgriPulse Serverless DB] Connection warning:', err);
  }
  return app(req, res);
}
