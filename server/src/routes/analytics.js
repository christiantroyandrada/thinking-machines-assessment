import { Router } from 'express';
import { getDepartmentAnalytics, getDocumentAnalytics, getTimeAnalytics } from '../services/analytics.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
const DIMENSIONS = new Set(['tag', 'date', 'department', 'user']);

router.get('/time', asyncHandler(async (req, res) => {
  const dimension = req.query.dimension;
  if (!DIMENSIONS.has(dimension)) {
    return res.status(400).json({ error: `dimension must be one of ${[...DIMENSIONS].join(', ')}` });
  }
  res.json(await getTimeAnalytics(dimension));
}));

router.get('/time/departments', asyncHandler(async (req, res) => {
  res.json({ departments: await getDepartmentAnalytics() });
}));

router.get('/documents', asyncHandler(async (req, res) => {
  res.json(await getDocumentAnalytics());
}));

export default router;
