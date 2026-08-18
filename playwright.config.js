import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: { timeout: 8000 },
  use: {
    baseURL: 'http://localhost:8080',
    screenshot: 'only-on-failure',
  },
  // The app is expected to be running already (e.g. `docker compose up --build`).
  // Playwright reuses the existing server at the URL below.
  webServer: {
    command: 'node -e "process.exit(0)"',
    url: 'http://localhost:8080',
    reuseExistingServer: true,
    timeout: 10000,
  },
});
