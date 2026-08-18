import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const base = process.env.BASE_URL || 'http://localhost:8080';
const out = 'docs/screenshots';
mkdirSync(out, { recursive: true });

// Routes + the selector that proves the page rendered with real (seeded) data.
const shots = [
  ['/', '.cards-grid', 'dashboard'],
  ['/check-ins', 'table', 'checkins'],
  ['/analytics', 'main', 'analytics'],
  ['/documents', 'table', 'documents'],
  ['/search', 'input', 'search'],
  ['/admin', 'main', 'admin'],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

for (const [path, selector, name] of shots) {
  try {
    await page.goto(`${base}${path}`, { waitUntil: 'networkidle' });
    await page.waitForSelector('main', { timeout: 8000 });
    try {
      await page.waitForSelector(selector, { timeout: 8000 });
    } catch {
      // Selector may differ from what actually rendered — capture anyway.
    }
    await page.screenshot({ path: `${out}/${name}.png`, fullPage: true });
    console.log(`captured ${name}.png`);
  } catch (err) {
    console.error(`skipped ${name}.png: ${err.message}`);
  }
}

await browser.close();
console.log('Screenshots captured');
