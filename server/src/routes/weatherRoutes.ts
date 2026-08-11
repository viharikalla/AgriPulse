import { Router } from 'express';
import { getWeather } from '../controllers/weatherController.js';
import { weatherRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();
router.get('/', weatherRateLimiter, getWeather);

export default router;
