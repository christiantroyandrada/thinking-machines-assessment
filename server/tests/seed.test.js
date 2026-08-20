import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { db } from '../src/db.js';
import { seedDatabase } from '../prisma/seed.js';

const sentinelEmail = 'seed-sentinel@meridian.com';

beforeAll(async () => {
  await db.user.deleteMany({ where: { email: sentinelEmail } });
});

afterAll(async () => {
  await db.user.deleteMany({ where: { email: sentinelEmail } });
  await db.$disconnect();
});

describe('database seeding', () => {
  it('does not replace existing application data by default', async () => {
    const sentinel = await db.user.create({
      data: {
        name: 'Persistent User',
        email: sentinelEmail,
        department: 'Engineering',
        role: 'user',
      },
    });

    const result = await seedDatabase(db);

    expect(result).toEqual({ skipped: true, reason: 'database-not-empty' });
    await expect(db.user.findUnique({ where: { id: sentinel.id } })).resolves.toMatchObject({
      email: sentinelEmail,
    });
  });
});
