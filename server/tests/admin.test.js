import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { db } from '../src/db.js';

const app = createApp();

beforeAll(async () => {
  await db.user.deleteMany();
  await db.checkIn.deleteMany();
  const u1 = await db.user.create({ data: { name: 'A', email: 'a@meridian.com', department: 'Engineering', role: 'user' } });
  const u2 = await db.user.create({ data: { name: 'B', email: 'b@meridian.com', department: 'Procurement', role: 'user' } });
  await db.checkIn.create({ data: { userId: u1.id, hours: 3, tag: 'project-x', activities: 'x', date: new Date() } });
  await db.checkIn.create({ data: { userId: u2.id, hours: 5, tag: 'procurement', activities: 'y', date: new Date() } });
});
afterAll(async () => { await db.checkIn.deleteMany(); await db.user.deleteMany(); await db.$disconnect(); });

describe('admin analytics', () => {
  it('returns team metrics', async () => {
    const res = await request(app).get('/api/admin/analytics');
    expect(res.status).toBe(200);
    expect(res.body.totalHours).toBe(8);
    expect(res.body.departmentBreakdown).toHaveLength(2);
    expect(res.body.topTags[0].tag).toBe('procurement');
  });
});
