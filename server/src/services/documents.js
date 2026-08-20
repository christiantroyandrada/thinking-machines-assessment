import path from 'node:path';
import { documentsRepository } from '../repositories/documentsRepository.js';
import { mockAnalyzeDocument, mockSuggestWorkflow } from './genai.js';
import { parsePagination } from '../utils/query.js';
import { parseStoredAnalysis, serializeDocument, serializeDocumentSummary } from '../utils/serialize.js';
import { badRequest, notFound, runPrisma } from '../utils/errors.js';

export const MAX_FILE_SIZE = 5 * 1024 * 1024;

const TEXT_EXTENSIONS = new Set(['.txt', '.md', '.csv', '.json', '.log']);
const ALLOWED_STATUS = ['pending', 'in-review', 'approved', 'rejected'];
const ALLOWED_TYPES = ['PO', 'QUOTE', 'REQ', 'OTHER'];

function requireTitle(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 200) {
    throw badRequest('title must be a non-empty string no longer than 200 characters');
  }
  return value.trim();
}

export function extractText(filename, buffer) {
  const ext = path.extname(filename || '').toLowerCase();
  if (TEXT_EXTENSIONS.has(ext)) {
    return { text: buffer.toString('utf-8'), mimeType: 'text/plain' };
  }
  return { text: null, mimeType: 'application/octet-stream' };
}

function buildWhere(query = {}) {
  const where = {};
  if (query.status) where.status = query.status;
  if (query.type) where.type = query.type;
  if (query.q) where.title = { contains: query.q };
  return where;
}

export async function listDocuments(query) {
  const { page, pageSize, skip, take } = parsePagination(query);
  const where = buildWhere(query);
  const [items, total] = await documentsRepository.list(where, { skip, take });
  return { items: items.map(serializeDocumentSummary), total, page, pageSize };
}

export async function getDocument(id) {
  const doc = await documentsRepository.findDetail(id);
  if (!doc) throw notFound('Document');
  return {
    ...serializeDocument(doc),
    checkIns: doc.checkIns.map((c) => ({ id: c.id, hours: c.hours, date: c.date, tag: c.tag, activities: c.activities, userName: c.user?.name })),
  };
}

export async function createDocument({ file, body = {} }) {
  if (!file) throw badRequest('file is required (multipart field "file")');
  const { type = 'OTHER', title } = body;
  if (!ALLOWED_TYPES.includes(type)) {
    throw badRequest(`type must be one of ${ALLOWED_TYPES.join(', ')}`);
  }
  const extracted = extractText(file.originalname, file.buffer);
  if (extracted.text === null) {
    throw badRequest('Unsupported file format. Supported formats: TXT, MD, CSV, JSON, and LOG');
  }
  const safeTitle = requireTitle(title || file.originalname.replace(/\.[^.]+$/, '') || 'Untitled document');
  const doc = await documentsRepository.create({
      type,
      title: safeTitle,
      filename: file.originalname,
      mimeType: extracted.mimeType,
      sizeBytes: file.size,
      contentText: extracted.text,
      status: 'pending',
  });
  return serializeDocument(doc);
}

export async function updateDocument(id, body = {}) {
  const data = {};
  if (body.title !== undefined) data.title = requireTitle(body.title);
  if (body.type !== undefined) {
    if (!ALLOWED_TYPES.includes(body.type)) {
      throw badRequest(`type must be one of ${ALLOWED_TYPES.join(', ')}`);
    }
    data.type = body.type;
  }
  if (body.status !== undefined) {
    if (!ALLOWED_STATUS.includes(body.status)) {
      throw badRequest(`status must be one of ${ALLOWED_STATUS.join(', ')}`);
    }
    data.status = body.status;
  }
  const doc = await runPrisma(() => documentsRepository.update(id, data), 'Document');
  return serializeDocument(doc);
}

export async function deleteDocument(id) {
  await runPrisma(() => documentsRepository.delete(id), 'Document');
}

export async function analyzeDocument(id) {
  const doc = await documentsRepository.findById(id);
  if (!doc) throw notFound('Document');
  const result = mockAnalyzeDocument({ type: doc.type, title: doc.title, text: doc.contentText || '' });
  await documentsRepository.saveAnalysis(doc.id, JSON.stringify(result));
  return result;
}

export async function suggestDocument(id) {
  const doc = await documentsRepository.findById(id);
  if (!doc) throw notFound('Document');
  const analysis = parseStoredAnalysis(doc.analysis) || mockAnalyzeDocument({ type: doc.type, title: doc.title, text: doc.contentText || '' });
  return mockSuggestWorkflow({ type: doc.type, status: doc.status, analysis });
}
