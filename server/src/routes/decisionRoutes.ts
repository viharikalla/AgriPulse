import { Router } from 'express';
import { evaluateDecision } from '../controllers/decisionController.js';
import { weatherRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();
router.post('/evaluate', weatherRateLimiter, evaluateDecision);

export default router;
