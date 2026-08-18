import { Router } from 'express';
import multer from 'multer';
import { mockAnalyzeDocument, mockSuggestWorkflow } from '../services/genai.js';
import { db } from '../db.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const where = {};
    if (req.query.type) where.type = req.query.type;
    if (req.query.status) where.status = req.query.status;
    const documents = await db.document.findMany({ where, orderBy: { createdAt: 'desc' }, include: { checkIns: { select: { hours: true } } } });
    res.json({ documents: documents.map((d) => ({
      ...d,
      linkedCheckIns: d.checkIns.length,
      totalTimeSpent: Number(d.checkIns.reduce((s, c) => s + c.hours, 0).toFixed(2)),
    })) });
  } catch (err) { next(err); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const doc = await db.document.findUnique({ where: { id: Number(req.params.id) }, include: { checkIns: { include: { user: true } } } });
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    const totalTimeSpent = Number(doc.checkIns.reduce((s, c) => s + c.hours, 0).toFixed(2));
    res.json({ ...doc, totalTimeSpent });
  } catch (err) { next(err); }
});

router.post('/', upload.single('file'), async (req, res, next) => {
  try {
    const body = req.body || {};
    const title = body.title || req.file?.originalname;
    const type = body.type;
    if (!title || !type) return res.status(400).json({ error: 'title and type are required' });
    if (!['PO', 'QUOTE', 'REQ'].includes(type)) return res.status(400).json({ error: 'type must be PO, QUOTE, or REQ' });
    const contentText = body.contentText || (req.file && req.file.mimetype && req.file.mimetype.startsWith('text') ? req.file.buffer.toString('utf8') : '');
    const doc = await db.document.create({
      data: {
        title,
        type,
        filename: req.file?.originalname || body.filename || title,
        status: body.status || 'pending',
        mimeType: req.file?.mimetype || body.mimeType || 'text/plain',
        sizeBytes: (req.file?.size ?? Number(body.sizeBytes)) || 0,
        contentText,
      },
    });
    res.status(201).json(doc);
  } catch (err) { next(err); }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const data = {};
    const ALLOWED_STATUS = ['pending', 'in-review', 'approved', 'rejected'];
    if (req.body.title !== undefined) data.title = req.body.title;
    if (req.body.type !== undefined) data.type = req.body.type;
    if (req.body.status !== undefined) {
      if (!ALLOWED_STATUS.includes(req.body.status)) {
        return res.status(400).json({ error: `status must be one of ${ALLOWED_STATUS.join(', ')}` });
      }
      data.status = req.body.status;
    }
    if (req.body.contentText !== undefined) data.contentText = req.body.contentText;
    const doc = await db.document.update({ where: { id }, data });
    res.json(doc);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Document not found' });
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await db.document.delete({ where: { id: Number(req.params.id) } });
    res.status(204).end();
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ error: 'Document not found' });
    next(err);
  }
});

router.post('/:id/analyze', async (req, res, next) => {
  try {
    const doc = await db.document.findUnique({ where: { id: Number(req.params.id) } });
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    const result = mockAnalyzeDocument({ type: doc.type, title: doc.title, text: doc.contentText || '' });
    await db.document.update({ where: { id: doc.id }, data: { analysis: JSON.stringify(result) } });
    res.json({ analysis: result });
  } catch (err) { next(err); }
});

router.post('/:id/suggest', async (req, res, next) => {
  try {
    const doc = await db.document.findUnique({ where: { id: Number(req.params.id) } });
    if (!doc) return res.status(404).json({ error: 'Document not found' });
    const analysis = doc.analysis ? JSON.parse(doc.analysis) : mockAnalyzeDocument({ type: doc.type, title: doc.title, text: doc.contentText || '' });
    const suggestions = mockSuggestWorkflow({ type: doc.type, status: doc.status, analysis });
    res.json({ suggestions });
  } catch (err) { next(err); }
});

export default router;
