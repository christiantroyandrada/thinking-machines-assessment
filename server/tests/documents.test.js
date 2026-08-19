import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { db } from '../src/db.js';

const app = createApp();

beforeAll(async () => {
  await db.document.deleteMany();
  await db.user.deleteMany({ where: { email: 'doctester@meridian.com' } });
});
afterAll(async () => {
  await db.document.deleteMany();
  await db.user.deleteMany({ where: { email: 'doctester@meridian.com' } });
  await db.$disconnect();
});

describe('documents', () => {
  it('uploads a text document and extracts analysis text', async () => {
    const res = await request(app)
      .post('/api/documents')
      .field('type', 'PO')
      .attach('file', Buffer.from('Purchase Order PO-1001\nVendor: Acme Industrial\nTotal: PHP 500000'), 'po.txt');
    expect(res.status).toBe(201);
    expect(res.body.type).toBe('PO');
    expect(res.body.status).toBe('pending');
    expect(res.body.contentText).toContain('PO-1001');
  });

  it('lists documents with time spent aggregated', async () => {
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(200);
    expect(res.body.total).toBeGreaterThanOrEqual(1);
    expect(res.body.items[0]).toHaveProperty('totalTimeSpent');
    expect(res.body.items[0]).toHaveProperty('checkInCount');
  });

  it('filters by status', async () => {
    const created = await request(app).post('/api/documents').field('type', 'PO').attach('file', Buffer.from('PO'), 'approved.txt');
    await request(app).patch(`/api/documents/${created.body.id}`).send({ status: 'approved' });
    const res = await request(app).get('/api/documents?status=approved');
    expect(res.body.items.every((d) => d.status === 'approved')).toBe(true);
  });

  it('gets a document detail with check-ins', async () => {
    const created = await request(app).post('/api/documents').field('type', 'QUOTE').attach('file', Buffer.from('Quote 123'), 'q.txt');
    const res = await request(app).get(`/api/documents/${created.body.id}`);
    expect(res.status).toBe(200);
    expect(res.body.checkIns).toEqual([]);
    expect(res.body.totalTimeSpent).toBe(0);
  });

  it('updates document status', async () => {
    const created = await request(app).post('/api/documents').field('type', 'REQ').attach('file', Buffer.from('Req'), 'r.txt');
    const res = await request(app).patch(`/api/documents/${created.body.id}`).send({ status: 'in-review' });
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('in-review');
  });

  it('rejects missing file', async () => {
    const res = await request(app).post('/api/documents').field('type', 'PO');
    expect(res.status).toBe(400);
  });

  it('deletes a document', async () => {
    const created = await request(app).post('/api/documents').field('type', 'PO').attach('file', Buffer.from('X'), 'x.txt');
    const res = await request(app).delete(`/api/documents/${created.body.id}`);
    expect(res.status).toBe(204);
  });

  it('aggregates time spent from linked check-ins', async () => {
    const user = await db.user.create({ data: { name: 'DocTester', email: 'doctester@meridian.com', department: 'Procurement', role: 'user' } });
    const doc = await request(app).post('/api/documents').field('type', 'PO').attach('file', Buffer.from('PO'), 'po2.txt');
    await request(app).post('/api/checkins').set('x-user-id', String(user.id)).send({ hours: 3, tag: 'procurement', activities: 'process PO', date: '2026-08-01', documentId: doc.body.id });
    await request(app).post('/api/checkins').set('x-user-id', String(user.id)).send({ hours: 2, tag: 'procurement', activities: 'negotiate', date: '2026-08-02', documentId: doc.body.id });
    const detail = await request(app).get(`/api/documents/${doc.body.id}`);
    expect(detail.body.totalTimeSpent).toBe(5);
    expect(detail.body.checkIns).toHaveLength(2);
  });
});
