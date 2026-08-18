import { chromium } from '@playwright/test';
import { existsSync, readdirSync, renameSync, rmSync } from 'node:fs';
import path from 'node:path';

const BASE = process.env.BASE_URL || 'http://localhost:8080';
const OUT = 'docs/presentation';

const routes = ['/', '/check-ins', '/analytics', '/documents', '/search', '/admin'];

const browser = await chromium.launch();
const context = await browser.newContext({
  recordVideo: { dir: OUT, size: { width: 1280, height: 800 } },
  viewport: { width: 1280, height: 800 },
});
const page = await context.newPage();

try {
  for (const r of routes) {
    await page.goto(BASE + r, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1800);
  }

  // Interactive moment: ask the AI search
  await page.goto(BASE + '/search', { waitUntil: 'networkidle' });
  await page.getByPlaceholder(/about your time/i).fill('how many hours on procurement');
  await page.getByRole('button', { name: /Ask AI/i }).click();
  await page.waitForTimeout(2200);

  // Interactive moment: log a check-in
  await page.goto(BASE + '/check-ins', { waitUntil: 'networkidle' });
  await page.getByPlaceholder(/vendor negotiation for procurement/i).fill('2 hrs #procurement review vendor quote');
  await page.waitForTimeout(800);
  await page.getByRole('button', { name: /Log it/i }).click();
  await page.waitForTimeout(1500);
} finally {
  await context.close();
  await browser.close();
}

// Rename the produced video to demo.webm
const files = readdirSync(OUT).filter((f) => f.endsWith('.webm'));
if (files.length) {
  const src = path.join(OUT, files[0]);
  const dst = path.join(OUT, 'demo.webm');
  if (existsSync(dst)) rmSync(dst);
  renameSync(src, dst);
  console.log('wrote', dst);
} else {
  console.error('no webm produced');
  process.exit(1);
}
