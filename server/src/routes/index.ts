import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import analysisRoutes from './analysisRoutes.js';
import assistantRoutes from './assistantRoutes.js';
import locationRoutes from './locationRoutes.js';
import weatherRoutes from './weatherRoutes.js';
import decisionRoutes from './decisionRoutes.js';
import { authRouter } from './authRoutes.js';

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRouter);
router.use('/location', locationRoutes);
router.use('/weather', weatherRoutes);
router.use('/decision', decisionRoutes);
router.use('/', analysisRoutes);
router.use('/', assistantRoutes);

export default router;
