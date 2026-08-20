import { Router } from 'express';
import { getAdminAnalytics } from '../services/admin.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/analytics', asyncHandler(async (req, res) => {
  res.json(await getAdminAnalytics());
}));

export default router;
