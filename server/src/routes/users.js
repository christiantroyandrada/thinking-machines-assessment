import { Router } from 'express';
import { db } from '../db.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/me', asyncHandler(async (req, res) => {
  const user = await db.user.findUnique({ where: { id: req.userId } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ id: user.id, name: user.name, department: user.department, role: user.role, email: user.email });
}));

router.get('/', asyncHandler(async (req, res) => {
  const where = {};
  if (req.query.department) where.department = req.query.department;
  const users = await db.user.findMany({ where, orderBy: [{ role: 'asc' }, { name: 'asc' }], select: { id: true, name: true, department: true, role: true, email: true } });
  res.json({ users });
}));

export default router;
