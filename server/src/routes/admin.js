import { Router } from 'express';
import { db } from '../db.js';
import { aggregateBy } from '../services/analytics.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/analytics', asyncHandler(async (req, res) => {
  const [users, checkins] = await Promise.all([
    db.user.findMany(),
    db.checkIn.findMany({ include: { user: true } }),
  ]);
  const totalHours = checkins.reduce((s, c) => s + c.hours, 0);
  const deptMap = new Map();
  users.forEach((u) => {
    const e = deptMap.get(u.department) || { department: u.department, hours: 0, users: 0 };
    e.users += 1;
    deptMap.set(u.department, e);
  });
  checkins.forEach((c) => {
    const e = deptMap.get(c.user?.department) || { department: c.user?.department || 'Unknown', hours: 0, users: 0 };
    e.hours += c.hours;
    deptMap.set(e.department, e);
  });
  const byTag = aggregateBy(checkins, 'tag');
  res.json({
    totalUsers: users.length,
    totalHours,
    activeUsers: new Set(checkins.map((c) => c.userId)).size,
    departmentBreakdown: [...deptMap.values()].sort((a, b) => b.hours - a.hours),
    topTags: byTag.series.slice(0, 5).map((t) => ({ tag: t.key, hours: t.hours })),
  });
}));

export default router;
