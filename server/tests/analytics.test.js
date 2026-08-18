import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { db } from '../src/db.js';

const app = createApp();

beforeAll(async () => {
  await db.user.deleteMany();
  await db.checkIn.deleteMany();
  await db.document.deleteMany();
  const ana = await db.user.create({ data: { name: 'Ana', department: 'Engineering', email: 'ana@meridian.com', role: 'member' } });
  await db.checkIn.createMany({ data: [
    { userId: ana.id, hours: 5, tag: 'dev', activities: 'api', date: new Date('2026-08-01') },
    { userId: ana.id, hours: 3, tag: 'dev', activities: 'ui', date: new Date('2026-08-02') },
    { userId: ana.id, hours: 2, tag: 'meeting', activities: 'standup', date: new Date('2026-08-03') },
  ] });
});
afterAll(async () => {
  await db.checkIn.deleteMany();
  await db.user.deleteMany();
  await db.document.deleteMany();
  await db.$disconnect();
});

describe('analytics', () => {
  it('aggregates time by tag', async () => {
    const res = await request(app).get('/api/analytics/time?dimension=tag');
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(10);
    const dev = res.body.series.find((s) => s.key === 'dev');
    expect(dev.hours).toBe(8);
  });

  it('aggregates time by user', async () => {
    const res = await request(app).get('/api/analytics/time?dimension=user');
    expect(res.body.series[0].key).toBe('Ana');
    expect(res.body.series[0].hours).toBe(10);
  });

  it('aggregates by department', async () => {
    const res = await request(app).get('/api/analytics/time/departments');
    expect(res.status).toBe(200);
    expect(res.body.departments[0].department).toBe('Engineering');
    expect(res.body.departments[0].totalHours).toBe(10);
  });
});
