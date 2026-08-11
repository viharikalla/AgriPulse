import { app } from './app.js';
import { config } from './config/index.js';
import { connectDatabase, disconnectDatabase } from './db/connection.js';

async function startServer() {
  try {
    // Attempt MongoDB connection if configured
    await connectDatabase();

    const server = app.listen(config.port, () => {
      console.log(`[AgriPulse Server] Running on http://localhost:${config.port} (${config.env} mode)`);
    });

    const shutdown = async () => {
      console.log('[AgriPulse Server] Graceful shutdown initiated...');
      server.close(async () => {
        await disconnectDatabase();
        console.log('[AgriPulse Server] Server stopped cleanly.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('[AgriPulse Server] Startup failure:', err);
    process.exit(1);
  }
}

startServer();
