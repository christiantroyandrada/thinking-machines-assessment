import { Router } from 'express';
import { parseCheckIn } from '../services/parser.js';
import { mockCategorize } from '../services/genai.js';
import { db } from '../db.js';

const router = Router();

function serialize(c) {
  return {
    id: c.id,
    userId: c.userId,
    userName: c.user?.name,
    department: c.user?.department,
    hours: c.hours,
    date: c.date,
    tag: c.tag,
    activities: c.activities,
    documentId: c.documentId,
    documentTitle: c.document?.title || null,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

const INCLUDE = { user: true, document: { select: { id: true, title: true } } };

router.post('/parse', (req, res) => {
  const parsed = parseCheckIn(req.body.text || '');
  res.json({ parsed });
});

router.get('/', async (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(req.query.pageSize) || 25));
  const where = {};
  if (req.query.tag) where.tag = req.query.tag;
  if (req.query.userId) where.userId = Number(req.query.userId);
  if (req.query.department) where.user = { department: req.query.department };
  if (req.query.from || req.query.to) {
    where.date = {};
    if (req.query.from) where.date.gte = new Date(req.query.from);
    if (req.query.to) where.date.lte = new Date(`${req.query.to}T23:59:59`);
  }
  if (req.query.q) {
    where.OR = [
      { activities: { contains: req.query.q } },
      { tag: { contains: req.query.q } },
    ];
  }
  const [items, total] = await Promise.all([
    db.checkIn.findMany({ where, include: INCLUDE, orderBy: { date: 'desc' }, skip: (page - 1) * pageSize, take: pageSize }),
    db.checkIn.count({ where }),
  ]);
  res.json({ items: items.map(serialize), total, page, pageSize });
});

router.post('/', async (req, res, next) => {
  try {
    const { text, hours, tag, activities, date, documentId } = req.body;
    let data = { hours, tag, activities };
    if (text) {
      const parsed = parseCheckIn(text);
      if (!parsed.valid) {
        return res.status(400).json({ error: parsed.errors.join(' ') });
      }
      data = { hours: parsed.hours, tag: parsed.tag, activities: parsed.activities };
    }
    if (!Number.isFinite(data.hours) || data.hours <= 0) {
      return res.status(400).json({ error: 'hours is required and must be a positive number' });
    }
    if (req.body.useSmartTag && !req.body.tag) {
      const ai = mockCategorize(data.activities || data.tag || '');
      data.tag = ai.tag;
    }
    if (data.tag && data.tag.startsWith('#')) data.tag = data.tag.slice(1).toLowerCase();
    if (documentId) {
      const doc = await db.document.findUnique({ where: { id: Number(documentId) } });
      if (!doc) return res.status(400).json({ error: 'Linked document does not exist' });
    }
    const checkIn = await db.checkIn.create({
      data: {
        userId: req.userId,
        hours: data.hours,
        tag: (data.tag || 'general').toLowerCase(),
        activities: data.activities || '',
        date: date ? new Date(date) : new Date(),
        documentId: documentId ? Number(documentId) : null,
      },
      include: INCLUDE,
    });
    res.status(201).json(serialize(checkIn));
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = {};
    if (req.body.hours !== undefined) {
      if (!Number.isFinite(req.body.hours) || req.body.hours <= 0) {
        return res.status(400).json({ error: 'hours must be a positive number' });
      }
      data.hours = req.body.hours;
    }
    if (req.body.tag !== undefined) data.tag = req.body.tag.toLowerCase();
    if (req.body.activities !== undefined) data.activities = req.body.activities;
    if (req.body.date !== undefined) data.date = new Date(req.body.date);
    if (req.body.documentId !== undefined) data.documentId = req.body.documentId ? Number(req.body.documentId) : null;
    const checkIn = await db.checkIn.update({ where: { id }, data, include: INCLUDE });
    res.json(serialize(checkIn));
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Check-in not found' });
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.checkIn.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Check-in not found' });
    next(err);
  }
});

export default router;
