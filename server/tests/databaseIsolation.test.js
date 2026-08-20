import { afterAll, describe, expect, it } from 'vitest';
import { db } from '../src/db.js';

describe('test database isolation', () => {
  it('never connects the test suite to the development database', async () => {
    const databases = await db.$queryRawUnsafe('PRAGMA database_list');
    const mainDatabase = databases.find((database) => database.name === 'main');
    const normalizedPath = mainDatabase?.file.replaceAll('\\', '/');

    expect(normalizedPath).toMatch(/\/test-\d+-\d+\.db$/);
    expect(normalizedPath).not.toMatch(/\/dev\.db$/);
  });
});

afterAll(async () => {
  await db.$disconnect();
});
