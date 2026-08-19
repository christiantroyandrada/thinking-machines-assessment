import { Router } from 'express';
import { db } from '../db.js';
import { aggregateBy, aggregateByDepartment } from '../services/analytics.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/analytics', asyncHandler(async (req, res) => {
  const [users, checkins] = await Promise.all([
    db.user.findMany(),
    db.checkIn.findMany({ include: { user: true } }),
  ]);
  const totalHours = checkins.reduce((s, c) => s + c.hours, 0);
  const activeUsers = new Set(checkins.map((c) => c.userId)).size;
  const byTag = aggregateBy(checkins, 'tag');
  res.json({
    totalUsers: users.length,
    totalHours,
    activeUsers,
    departmentBreakdown: aggregateByDepartment(users, checkins),
    topTags: byTag.slice(0, 5).map((t) => ({ tag: t.key, hours: t.hours })),
  });
}));

export default router;