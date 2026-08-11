import { Router } from 'express';
import { askAssistant } from '../controllers/assistantController.js';
import { assistantRateLimiter } from '../middleware/rateLimiter.js';

const router = Router();
router.post('/assistant', assistantRateLimiter, askAssistant);

export default router;
