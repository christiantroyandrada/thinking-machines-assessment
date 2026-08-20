import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { db } from '../src/db.js';
import { aggregateBy } from '../src/services/analytics.js';

const app = createApp();

beforeAll(async () => {
  await db.user.deleteMany();
  await db.checkIn.deleteMany();
  await db.document.deleteMany();
  const ana = await db.user.create({ data: { name: 'Ana', email: 'ana@meridian.com', department: 'Procurement', role: 'user' } });
  await db.checkIn.create({ data: { userId: ana.id, hours: 4, tag: 'procurement', activities: 'a', date: new Date('2026-08-01') } });
  await db.checkIn.create({ data: { userId: ana.id, hours: 2, tag: 'procurement', activities: 'b', date: new Date('2026-08-02') } });
  await db.checkIn.create({ data: { userId: ana.id, hours: 1, tag: 'meeting', activities: 'c', date: new Date('2026-08-03') } });
});
afterAll(async () => {
  await db.checkIn.deleteMany();
  await db.document.deleteMany();
  await db.user.deleteMany();
  await db.$disconnect();
});

describe('analytics', () => {
  it('orders date series chronologically for charting', () => {
    const series = aggregateBy([
      { date: new Date('2026-08-01'), hours: 1 },
      { date: new Date('2026-08-02'), hours: 8 },
      { date: new Date('2026-08-03'), hours: 2 },
    ], 'date');

    expect(series.map((entry) => entry.key)).toEqual([
      '2026-08-01',
      '2026-08-02',
      '2026-08-03',
    ]);
  });

  it('aggregates time by tag', async () => {
    const res = await request(app).get('/api/analytics/time?dimension=tag');
    expect(res.status).toBe(200);
    const procurement = res.body.series.find((s) => s.key === 'procurement');
    expect(procurement.hours).toBe(6);
    expect(procurement.count).toBe(2);
    expect(res.body.totalHours).toBe(7);
  });

  it('aggregates time by user', async () => {
    const res = await request(app).get('/api/analytics/time?dimension=user');
    expect(res.body.series[0]).toMatchObject({ key: 'Ana', hours: 7, count: 3 });
  });

  it('aggregates time by date', async () => {
    const res = await request(app).get('/api/analytics/time?dimension=date');
    expect(res.status).toBe(200);
    expect(res.body.series).toHaveLength(3);
  });

  it('rejects unknown dimensions', async () => {
    const res = await request(app).get('/api/analytics/time?dimension=nope');
    expect(res.status).toBe(400);
  });

  it('returns document status counts', async () => {
    await db.document.create({ data: { type: 'PO', title: 'PO-1', filename: 'po1.txt', mimeType: 'text/plain', sizeBytes: 10, status: 'pending' } });
    await db.document.create({ data: { type: 'PO', title: 'PO-2', filename: 'po2.txt', mimeType: 'text/plain', sizeBytes: 10, status: 'approved' } });
    const res = await request(app).get('/api/analytics/documents');
    expect(res.status).toBe(200);
    expect(res.body.totalDocuments).toBe(2);
    expect(res.body.byStatus).toEqual({ pending: 1, approved: 1 });
  });
});
