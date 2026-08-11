import { Router } from 'express';
import { searchLocation } from '../controllers/locationController.js';
import { locationRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();
router.get('/search', locationRateLimiter, searchLocation);

export default router;
