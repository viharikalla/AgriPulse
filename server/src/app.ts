import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import apiRoutes from './routes/index.js';
import { sessionMiddleware } from './middleware/sessionMiddleware.js';
import { errorHandler } from './middleware/errorHandler.js';
import { config } from './config/index.js';

export const app = express();

// Security Headers Middleware (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled for API server to avoid breaking frontend script loads
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS Allowlist
app.use(
  cors({
    origin: config.clientOrigin,
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: '12mb' }));
app.use(express.urlencoded({ extended: true, limit: '12mb' }));

// Anonymous Session Ownership Middleware
app.use(sessionMiddleware);

// API Router Mount
app.use('/api', apiRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);
