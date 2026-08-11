import { Router } from 'express';
import multer from 'multer';
import { analyzeField, getAnalysisById, getHistory } from '../controllers/analysisController.js';
import { analyzeRateLimiter } from '../middleware/rateLimiter.js';
import { optionalAuth } from '../middleware/authMiddleware.js';
import { config } from '../config/index.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: config.maxImageSizeBytes },
});

const router = Router();

router.post('/analyze', optionalAuth, analyzeRateLimiter, upload.single('image'), analyzeField);
router.get('/analysis/:id', optionalAuth, getAnalysisById);
router.get('/history', optionalAuth, getHistory);

export default router;
