import { Router } from 'express';
import { getCurrentUser, listUsers } from '../services/users.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/me', asyncHandler(async (req, res) => {
  res.json(await getCurrentUser(req.userId));
}));

router.get('/', asyncHandler(async (req, res) => {
  res.json({ users: await listUsers(req.query.department) });
}));

export default router;
