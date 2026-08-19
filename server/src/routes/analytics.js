import { Router } from 'express';
import { db } from '../db.js';
import { aggregateBy, aggregateByDepartment } from '../services/analytics.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
const DIMENSIONS = new Set(['tag', 'date', 'department', 'user']);

router.get('/time', asyncHandler(async (req, res) => {
  const dimension = req.query.dimension;
  if (!DIMENSIONS.has(dimension)) {
    return res.status(400).json({ error: `dimension must be one of ${[...DIMENSIONS].join(', ')}` });
  }
  const checkIns = await db.checkIn.findMany({ include: { user: true } });
  const series = aggregateBy(checkIns, dimension);
  const totalHours = Number(series.reduce((sum, e) => sum + e.hours, 0).toFixed(2));
  res.json({ totalHours, series });
}));

router.get('/time/departments', asyncHandler(async (req, res) => {
  const [users, checkins] = await Promise.all([
    db.user.findMany(),
    db.checkIn.findMany({ include: { user: true } }),
  ]);
  const departments = aggregateByDepartment(users, checkins).map((d) => ({
    department: d.department,
    totalHours: Number(d.hours.toFixed(2)),
    users: d.users,
    avgHoursPerUser: Number((d.hours / Math.max(1, d.users)).toFixed(2)),
  }));
  res.json({ departments });
}));

router.get('/documents', asyncHandler(async (req, res) => {
  const documents = await db.document.findMany();
  const byStatus = documents.reduce((acc, d) => {
    acc[d.status] = (acc[d.status] || 0) + 1;
    return acc;
  }, {});
  res.json({ totalDocuments: documents.length, byStatus });
}));

export default router;