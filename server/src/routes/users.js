import { Router } from 'express';
import { db } from '../db.js';

const router = Router();

router.get('/me', async (req, res, next) => {
  try {
    const user = await db.user.findUnique({ where: { id: req.userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ id: user.id, name: user.name, department: user.department, role: user.role, email: user.email });
  } catch (err) { next(err); }
});

router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.department) where.department = req.query.department;
    const users = await db.user.findMany({ where, orderBy: { name: 'asc' }, select: { id: true, name: true, department: true, role: true, email: true } });
    res.json({ users });
  } catch (err) { next(err); }
});

export default router;
