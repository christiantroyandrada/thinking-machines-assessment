import { beforeAll, afterAll, describe, it, expect } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { db } from '../src/db.js';

const app = createApp();

beforeAll(async () => {
  await db.user.deleteMany();
  await db.user.createMany({ data: [
    { name: 'James Wong', department: 'Engineering', role: 'admin', email: 'james@meridian.com' },
    { name: 'Maria Chen', department: 'Finance', role: 'admin', email: 'maria@meridian.com' },
    { name: 'Sam Lee', department: 'Procurement', role: 'member', email: 'sam@meridian.com' },
  ] });
});
afterAll(async () => {
  await db.user.deleteMany();
  await db.$disconnect();
});

describe('users', () => {
  it('lists users', async () => {
    const res = await request(app).get('/api/users');
    expect(res.status).toBe(200);
    expect(res.body.users.length).toBe(3);
  });

  it('filters users by department', async () => {
    const res = await request(app).get('/api/users?department=Finance');
    expect(res.body.users.every((u) => u.department === 'Finance')).toBe(true);
  });

  it('returns current user', async () => {
    const james = await db.user.findFirst({ where: { name: 'James Wong' } });
    const res = await request(app).get('/api/users/me').set('x-user-id', String(james.id));
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('James Wong');
  });
});
