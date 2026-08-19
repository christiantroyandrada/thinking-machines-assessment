import { db } from '../db.js';
import { parseCheckIn } from './parser.js';
import { mockCategorize } from './genai.js';
import { parsePagination } from '../utils/query.js';
import { serializeCheckIn } from '../utils/serialize.js';
import { badRequest, runPrisma } from '../utils/errors.js';

const INCLUDE = { user: true, document: { select: { id: true, title: true } } };

function buildWhere(query = {}) {
  const where = {};
  if (query.tag) where.tag = query.tag;
  if (query.userId) where.userId = Number(query.userId);
  if (query.department) where.user = { department: query.department };
  if (query.from || query.to) {
    where.date = {};
    if (query.from) where.date.gte = new Date(query.from);
    if (query.to) where.date.lte = new Date(`${query.to}T23:59:59`);
  }
  if (query.q) {
    where.OR = [
      { activities: { contains: query.q } },
      { tag: { contains: query.q } },
    ];
  }
  return where;
}

function requirePositiveHours(value) {
  if (!Number.isFinite(value) || value <= 0) {
    throw badRequest('hours must be a positive number');
  }
}

export async function listCheckIns(query) {
  const { page, pageSize, skip, take } = parsePagination(query);
  const where = buildWhere(query);
  const [items, total] = await Promise.all([
    db.checkIn.findMany({ where, include: INCLUDE, orderBy: { date: 'desc' }, skip, take }),
    db.checkIn.count({ where }),
  ]);
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
  requirePositiveHours(data.hours);
  if (useSmartTag && !body.tag) {
    const ai = mockCategorize(data.activities || data.tag || '');
    data.tag = ai.tag;
  }
  if (data.tag && data.tag.startsWith('#')) data.tag = data.tag.slice(1).toLowerCase();
  if (documentId) {
    const doc = await db.document.findUnique({ where: { id: Number(documentId) } });
    if (!doc) throw badRequest('Linked document does not exist');
  }
  const checkIn = await db.checkIn.create({
    data: {
      userId,
      hours: data.hours,
      tag: (data.tag || 'general').toLowerCase(),
      activities: data.activities || '',
      date: date ? new Date(date) : new Date(),
      documentId: documentId ? Number(documentId) : null,
    },
    include: INCLUDE,
  });
  return serializeCheckIn(checkIn);
}

export async function updateCheckIn(id, body = {}) {
  const data = {};
  if (body.hours !== undefined) {
    requirePositiveHours(body.hours);
    data.hours = body.hours;
  }
  if (body.tag !== undefined) data.tag = body.tag.toLowerCase();
  if (body.activities !== undefined) data.activities = body.activities;
  if (body.date !== undefined) data.date = new Date(body.date);
  if (body.documentId !== undefined) data.documentId = body.documentId ? Number(body.documentId) : null;
  const checkIn = await runPrisma(() => db.checkIn.update({ where: { id }, data, include: INCLUDE }), 'Check-in');
  return serializeCheckIn(checkIn);
}

export async function deleteCheckIn(id) {
  await runPrisma(() => db.checkIn.delete({ where: { id } }), 'Check-in');
}