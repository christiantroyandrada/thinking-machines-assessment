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
  it('lists documents', async () => {
    const res = await request(app).get('/api/documents');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.documents)).toBe(true);
  });

  it('creates a document', async () => {
    const res = await request(app).post('/api/documents').send({ title: 'PO-100', type: 'PO', status: 'pending', contentText: 'Vendor Acme amount 5000' });
    expect(res.status).toBe(201);
    expect(res.body.type).toBe('PO');
  });

  it('rejects invalid document type', async () => {
    const res = await request(app).post('/api/documents').send({ title: 'X', type: 'BAD' });
    expect(res.status).toBe(400);
  });

  it('deletes a document', async () => {
    const created = await request(app).post('/api/documents').send({ title: 'PO-200', type: 'PO' });
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
