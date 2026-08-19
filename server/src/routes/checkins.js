import { Router } from 'express';
import { parseCheckIn } from '../services/parser.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { createCheckIn, deleteCheckIn, listCheckIns, updateCheckIn } from '../services/checkins.js';

const router = Router();

router.post('/parse', asyncHandler(async (req, res) => {
  res.json({ parsed: parseCheckIn(req.body.text || '') });
}));

router.get('/', asyncHandler(async (req, res) => {
  res.json(await listCheckIns(req.query));
}));

router.post('/', asyncHandler(async (req, res) => {
  res.status(201).json(await createCheckIn({ userId: req.userId, body: req.body }));
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  res.json(await updateCheckIn(Number(req.params.id), req.body));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await deleteCheckIn(Number(req.params.id));
  res.status(204).end();
}));

export default router;