import { Router } from 'express';
import { getAnomalies, getInsights, searchWorkspace } from '../services/ai.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/insights', asyncHandler(async (req, res) => {
  res.json({ insights: await getInsights() });
}));

router.get('/anomalies', asyncHandler(async (req, res) => {
  res.json({ anomalies: await getAnomalies() });
}));

router.get('/search', asyncHandler(async (req, res) => {
  res.json(await searchWorkspace(req.query.q || ''));
}));

export default router;
