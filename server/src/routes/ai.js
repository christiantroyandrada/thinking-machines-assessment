import { Router } from 'express';
import { db } from '../db.js';
import { mockAnomalies, mockSearch, mockTimeInsights } from '../services/genai.js';

const router = Router();

router.get('/insights', async (req, res, next) => {
  try {
    const checkins = await db.checkIn.findMany();
    res.json({ insights: mockTimeInsights(checkins) });
  } catch (err) { next(err); }
});

router.get('/anomalies', async (req, res, next) => {
  try {
    const [checkins, documents] = await Promise.all([db.checkIn.findMany(), db.document.findMany()]);
    res.json({ anomalies: mockAnomalies(checkins, documents) });
  } catch (err) { next(err); }
});

router.get('/search', async (req, res, next) => {
  try {
    const [checkins, documents] = await Promise.all([
      db.checkIn.findMany({ include: { user: true } }),
      db.document.findMany(),
    ]);
    const ctxCheckins = checkins.map((c) => ({ id: c.id, hours: c.hours, tag: c.tag, activities: c.activities, userName: c.user?.name || 'Unknown', date: c.date }));
    const result = mockSearch(req.query.q || '', { checkins: ctxCheckins, documents });
    res.json(result);
  } catch (err) { next(err); }
});

export default router;
