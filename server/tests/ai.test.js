import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { db } from '../src/db.js';

const app = createApp();

let anaId;

beforeAll(async () => {
  await db.user.deleteMany();
  await db.checkIn.deleteMany();
  await db.document.deleteMany();
  const user = await db.user.create({ data: { name: 'Ana', email: 'ana@meridian.com', department: 'Procurement', role: 'user' } });
  anaId = user.id;
  await db.checkIn.create({ data: { userId: user.id, hours: 4, tag: 'procurement', activities: 'vendor negotiation', date: new Date('2026-08-01') } });
});
afterAll(async () => {
  await db.checkIn.deleteMany(); await db.document.deleteMany(); await db.user.deleteMany(); await db.$disconnect();
});

describe('ai endpoints', () => {
  it('returns time insights', async () => {
    const res = await request(app).get('/api/ai/insights');
    expect(res.status).toBe(200);
    expect(res.body.insights.length).toBeGreaterThan(0);
  });

  it('returns anomalies', async () => {
    const res = await request(app).get('/api/ai/anomalies');
    expect(res.status).toBe(200);
    expect(res.body.anomalies).toBeDefined();
  });

  it('answers natural language search', async () => {
    const res = await request(app).get('/api/ai/search').query({ q: 'how many hours on procurement' });
    expect(res.status).toBe(200);
    expect(res.body.answer).toContain('4.0');
  });

  it('smart categorizes when useSmartTag is set', async () => {
    const res = await request(app).post('/api/checkins').set('x-user-id', String(anaId)).send({ hours: 2, activities: 'vendor negotiation and quote review', useSmartTag: true });
    expect(res.body.tag).toBe('procurement');
  });

  it('analyzes a document', async () => {
    const doc = await request(app).post('/api/documents').field('type', 'PO').attach('file', Buffer.from('Vendor: Acme Industrial\nTotal: PHP 500000\nPO 1001'), 'po.txt');
    const res = await request(app).post(`/api/documents/${doc.body.id}/analyze`);
    expect(res.status).toBe(200);
    expect(res.body.analysis.fields.vendor).toBe('acme industrial');
  });

  it('suggests next steps for a document', async () => {
    const doc = await request(app).post('/api/documents').field('type', 'PO').attach('file', Buffer.from('PO'), 's.txt');
    const res = await request(app).post(`/api/documents/${doc.body.id}/suggest`);
    expect(res.status).toBe(200);
    expect(res.body.suggestions.length).toBeGreaterThan(0);
  });
});
