import { defineConfig } from 'vitest/config';

const databaseUrl = `file:./test-${process.pid}-${Date.now()}.db`;
process.env.DATABASE_URL = databaseUrl;

export default defineConfig({
  test: {
    env: {
      DATABASE_URL: databaseUrl,
    },
    fileParallelism: false,
    globalSetup: './tests/globalSetup.js',
  },
});
