import { checkInsRepository } from '../repositories/checkInsRepository.js';
import { parseCheckIn } from './parser.js';
import { mockCategorize } from './genai.js';
import { parsePagination } from '../utils/query.js';
import { serializeCheckIn } from '../utils/serialize.js';
import { badRequest, runPrisma } from '../utils/errors.js';
import { parseIsoDate, parsePositiveInteger } from '../utils/validation.js';

function buildWhere(query = {}) {
  const where = {};
  if (query.tag) where.tag = query.tag;
  if (query.userId) where.userId = parsePositiveInteger(query.userId, 'userId');
  if (query.department) where.user = { department: query.department };
  if (query.from || query.to) {
    where.date = {};
    if (query.from) where.date.gte = parseIsoDate(query.from, 'from');
    if (query.to) where.date.lte = parseIsoDate(query.to, 'to', { endOfDay: true });
  }
  if (query.q) {
    where.OR = [
      { activities: { contains: query.q } },
      { tag: { contains: query.q } },
    ];
  }
  return where;
}

function requireValidHours(value) {
  if (!Number.isFinite(value) || value <= 0 || value > 24) {
    throw badRequest('hours must be a positive number no greater than 24');
  }
}

function normalizeTag(value) {
  if (value === undefined || value === '') return 'general';
  if (typeof value !== 'string') throw badRequest('tag must be a string');
  const normalized = value.replace(/^#/, '').trim().toLowerCase();
  if (!normalized) throw badRequest('tag must not be empty');
  return normalized;
}

function requireActivities(value) {
  if (value !== undefined && typeof value !== 'string') {
    throw badRequest('activities must be a string');
  }
}

export async function listCheckIns(query) {
  const { page, pageSize, skip, take } = parsePagination(query);
  const where = buildWhere(query);
  const [items, total] = await checkInsRepository.list(where, { skip, take });
  return { items: items.map(serializeCheckIn), total, page, pageSize };
}

export async function createCheckIn({ userId, body = {} }) {
  const { text, hours, tag, activities, date, documentId, useSmartTag } = body;
  let data = { hours, tag, activities };
  if (text) {
    const parsed = parseCheckIn(text);
    if (!parsed.valid) throw badRequest(parsed.errors.join(' '));
    data = { hours: parsed.hours, tag: parsed.tag, activities: parsed.activities };
  }
  requireValidHours(data.hours);
  requireActivities(data.activities);
  if (useSmartTag && !body.tag) {
    const ai = mockCategorize(data.activities || data.tag || '');
    data.tag = ai.tag;
  }
  data.tag = normalizeTag(data.tag);
  const user = await checkInsRepository.findUser(userId);
  if (!user) throw badRequest('User does not exist');
  const linkedDocumentId = documentId ? parsePositiveInteger(documentId, 'documentId') : null;
  if (linkedDocumentId) {
    const doc = await checkInsRepository.findDocument(linkedDocumentId);
    if (!doc) throw badRequest('Linked document does not exist');
  }
  const checkIn = await checkInsRepository.create({
      userId,
      hours: data.hours,
      tag: data.tag,
      activities: data.activities || '',
      date: date ? parseIsoDate(date) : new Date(),
      documentId: linkedDocumentId,
  });
  return serializeCheckIn(checkIn);
}

export async function updateCheckIn(id, body = {}) {
  const data = {};
  if (body.hours !== undefined) {
    requireValidHours(body.hours);
    data.hours = body.hours;
  }
  if (body.tag !== undefined) data.tag = normalizeTag(body.tag);
  if (body.activities !== undefined) {
    requireActivities(body.activities);
    data.activities = body.activities;
  }
  if (body.date !== undefined) data.date = parseIsoDate(body.date);
  if (body.documentId !== undefined) {
    data.documentId = body.documentId ? parsePositiveInteger(body.documentId, 'documentId') : null;
    if (data.documentId) {
      const document = await checkInsRepository.findDocument(data.documentId);
      if (!document) throw badRequest('Linked document does not exist');
    }
  }
  const checkIn = await runPrisma(() => checkInsRepository.update(id, data), 'Check-in');
  return serializeCheckIn(checkIn);
}

export async function deleteCheckIn(id) {
  await runPrisma(() => checkInsRepository.delete(id), 'Check-in');
}
