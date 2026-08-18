import { Router } from 'express';
import { db } from '../db.js';
import { aggregateBy } from '../services/analytics.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/time', asyncHandler(async (req, res) => {
  const dimension = req.query.dimension || 'tag';
  const checkIns = await db.checkIn.findMany({ include: { user: true } });
  res.json(aggregateBy(checkIns, dimension));
}));

router.get('/time/departments', asyncHandler(async (req, res) => {
  const users = await db.user.findMany({ include: { checkIns: { select: { hours: true, tag: true } } } });
  const byDept = {};
  for (const u of users) {
    byDept[u.department] = byDept[u.department] || { department: u.department, totalHours: 0, users: 0 };
    byDept[u.department].totalHours += u.checkIns.reduce((s, c) => s + c.hours, 0);
    byDept[u.department].users += 1;
  }
  const result = Object.values(byDept)
    .map((d) => ({ ...d, totalHours: Number(d.totalHours.toFixed(2)), avgHoursPerUser: Number((d.totalHours / Math.max(1, d.users)).toFixed(2)) }))
    .sort((a, b) => b.totalHours - a.totalHours);
  res.json({ departments: result });
}));

router.get('/documents', asyncHandler(async (req, res) => {
  const docs = await db.document.findMany({
    include: { _count: { select: { checkIns: true } }, checkIns: { select: { hours: true } } },
  });
  const result = docs
    .map((d) => ({ id: d.id, title: d.title, type: d.type, status: d.status, linkedCheckIns: d._count.checkIns, linkedHours: Number(d.checkIns.reduce((s, c) => s + c.hours, 0).toFixed(2)) }))
    .sort((a, b) => b.linkedHours - a.linkedHours);
  res.json({ documents: result });
}));

export default router;
