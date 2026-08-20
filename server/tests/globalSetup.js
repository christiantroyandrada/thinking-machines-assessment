import { spawnSync } from 'node:child_process';
import { rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const databaseUrl = process.env.DATABASE_URL;
if (!/^file:\.\/test-\d+-\d+\.db$/.test(databaseUrl || '')) {
  throw new Error('Refusing to prepare a test database without a unique test file URL');
}
const testDatabaseName = databaseUrl.slice('file:./'.length);
const testDatabasePath = fileURLToPath(new URL(`../prisma/${testDatabaseName}`, import.meta.url));
const testJournalPath = `${testDatabasePath}-journal`;
const prismaCliPath = fileURLToPath(new URL('../node_modules/prisma/build/index.js', import.meta.url));
const serverPath = fileURLToPath(new URL('..', import.meta.url));

function removeTestDatabase() {
  rmSync(testDatabasePath, { force: true });
  rmSync(testJournalPath, { force: true });
}

export default function setup() {
  removeTestDatabase();

  const result = spawnSync(
    process.execPath,
    [prismaCliPath, 'db', 'push', '--skip-generate', '--accept-data-loss'],
    {
      cwd: serverPath,
      encoding: 'utf8',
      // Prisma's Windows schema engine can exit without diagnostics during
      // startup unless Rust logging is initialized. Output remains captured.
      env: { ...process.env, DATABASE_URL: databaseUrl, RUST_LOG: 'info' },
    },
  );

  if (result.status !== 0) {
    throw new Error(`Failed to prepare isolated test database:\n${result.stderr || result.stdout}`);
  }

  return () => {
    removeTestDatabase();
  };
}
