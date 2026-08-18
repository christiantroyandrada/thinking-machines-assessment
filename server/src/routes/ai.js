import { Router } from 'express';
import { db } from '../db.js';
import { mockAnomalies, mockSearch, mockTimeInsights } from '../services/genai.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/insights', asyncHandler(async (req, res) => {
  const checkins = await db.checkIn.findMany();
  res.json({ insights: mockTimeInsights(checkins) });
}));

router.get('/anomalies', asyncHandler(async (req, res) => {
  const [checkins, documents] = await Promise.all([db.checkIn.findMany(), db.document.findMany()]);
  res.json({ anomalies: mockAnomalies(checkins, documents) });
}));

router.get('/search', asyncHandler(async (req, res) => {
  const [checkins, documents] = await Promise.all([
    db.checkIn.findMany({ include: { user: true } }),
    db.document.findMany(),
  ]);
  const ctxCheckins = checkins.map((c) => ({ id: c.id, hours: c.hours, tag: c.tag, activities: c.activities, userName: c.user?.name || 'Unknown', date: c.date }));
  res.json(mockSearch(req.query.q || '', { checkins: ctxCheckins, documents }));
}));

export default router;
