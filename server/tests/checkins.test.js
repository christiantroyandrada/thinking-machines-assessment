import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { db } from '../src/db.js';

const app = createApp();
let tester;

beforeAll(async () => {
  await db.user.deleteMany();
  tester = await db.user.create({ data: { name: 'Tester', email: 'tester@meridian.com', department: 'Procurement', role: 'admin' } });
});
afterAll(async () => {
  await db.checkIn.deleteMany();
  await db.user.deleteMany();
  await db.$disconnect();
});

describe('check-ins', () => {
  it('parses a check-in text', async () => {
    const res = await request(app).post('/api/checkins/parse').send({ text: '5.5 hrs #project-x fix login issue' });
    expect(res.status).toBe(200);
    expect(res.body.parsed).toMatchObject({ hours: 5.5, tag: 'project-x', valid: true });
  });

  it('creates a check-in from structured fields', async () => {
    const res = await request(app).post('/api/checkins').set('x-user-id', String(tester.id)).send({ hours: 2, tag: 'procurement', activities: 'vendor negotiation', date: '2026-08-01' });
    expect(res.status).toBe(201);
    expect(res.body.tag).toBe('procurement');
    expect(res.body.userName).toBe('Tester');
  });

  it('creates a check-in from text', async () => {
    const res = await request(app).post('/api/checkins').set('x-user-id', String(tester.id)).send({ text: '1.5 hrs #meeting standup' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ hours: 1.5, tag: 'meeting' });
  });

  it('rejects invalid check-in payloads', async () => {
    const res = await request(app).post('/api/checkins').set('x-user-id', String(tester.id)).send({ hours: -1, activities: 'nope' });
    expect(res.status).toBe(400);
  });

  it('lists check-ins with pagination', async () => {
    const res = await request(app).get('/api/checkins?page=1&pageSize=2');
    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(2);
    expect(res.body.total).toBeGreaterThanOrEqual(2);
  });

  it('filters check-ins by tag', async () => {
    const res = await request(app).get('/api/checkins?tag=procurement');
    expect(res.body.items.every((c) => c.tag === 'procurement')).toBe(true);
  });

  it('edits a check-in', async () => {
    const created = await request(app).post('/api/checkins').set('x-user-id', String(tester.id)).send({ hours: 3, tag: 'ops', activities: 'logistics' });
    const res = await request(app).patch(`/api/checkins/${created.body.id}`).send({ hours: 4 });
    expect(res.status).toBe(200);
    expect(res.body.hours).toBe(4);
  });

  it('deletes a check-in', async () => {
    const created = await request(app).post('/api/checkins').set('x-user-id', String(tester.id)).send({ hours: 1, tag: 'support', activities: 'ticket' });
    const res = await request(app).delete(`/api/checkins/${created.body.id}`);
    expect(res.status).toBe(204);
    const gone = await request(app).get(`/api/checkins?q=support`);
    expect(gone.body.items.find((c) => c.id === created.body.id)).toBeUndefined();
  });
});
