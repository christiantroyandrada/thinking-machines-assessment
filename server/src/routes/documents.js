import { Router } from 'express';
import multer from 'multer';
import { asyncHandler } from '../middleware/asyncHandler.js';
import {
  analyzeDocument,
  createDocument,
  deleteDocument,
  getDocument,
  listDocuments,
  MAX_FILE_SIZE,
  suggestDocument,
  updateDocument,
} from '../services/documents.js';
import { parsePositiveInteger } from '../utils/validation.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: MAX_FILE_SIZE } });

router.get('/', asyncHandler(async (req, res) => {
  res.json(await listDocuments(req.query));
}));

router.get('/:id', asyncHandler(async (req, res) => {
  res.json(await getDocument(parsePositiveInteger(req.params.id)));
}));

router.post('/', upload.single('file'), asyncHandler(async (req, res) => {
  res.status(201).json(await createDocument({ file: req.file, body: req.body }));
}));

router.patch('/:id', asyncHandler(async (req, res) => {
  res.json(await updateDocument(parsePositiveInteger(req.params.id), req.body));
}));

router.delete('/:id', asyncHandler(async (req, res) => {
  await deleteDocument(parsePositiveInteger(req.params.id));
  res.status(204).end();
}));

router.post('/:id/analyze', asyncHandler(async (req, res) => {
  res.json({ analysis: await analyzeDocument(parsePositiveInteger(req.params.id)) });
}));

router.post('/:id/suggest', asyncHandler(async (req, res) => {
  res.json({ suggestions: await suggestDocument(parsePositiveInteger(req.params.id)) });
}));

export default router;
