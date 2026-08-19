const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SHOTS = path.join(__dirname, 'output');
const OUT = path.join(__dirname, 'output');
fs.mkdirSync(SHOTS, { recursive: true });
fs.mkdirSync(OUT, { recursive: true });

const USER = { id: 1, name: 'James Wong', role: 'admin', department: 'Engineering' };
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    recordVideo: { dir: OUT, size: { width: 1280, height: 720 } },
  });
  await context.addInitScript((u) => {
    localStorage.setItem('worksmart-user', JSON.stringify(u));
    localStorage.setItem('worksmart-user-id', String(u.id));
  }, USER);
  const page = await context.newPage();
  page.setDefaultTimeout(10000);

  const shot = async (name) => {
    await page.screenshot({ path: path.join(SHOTS, `${name}.png`) });
    console.log(`  shot: ${name}`);
  };

  // Login page (no user)
  const anon = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const anonPage = await anon.newPage();
  await anonPage.goto('http://localhost:8080', { waitUntil: 'networkidle' });
  await anonPage.waitForSelector('.user-row', { timeout: 5000 });
  await pause(600);
  await anonPage.screenshot({ path: path.join(SHOTS, '01-login.png') });
  console.log('  shot: 01-login');
  await anon.close();

  // Main walkthrough (authenticated)
  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  await page.waitForSelector('.cards-grid', { timeout: 10000 });
  await pause(800);
  await shot('02-dashboard');

  // Check-ins: list + pagination + edit
  await page.click('a[href="/check-ins"]');
  await page.waitForSelector('section.checkins table tbody tr', { timeout: 10000 });
  await pause(800);
  await shot('03-checkins');
  await page.locator('.pager button').first().click().catch(() => {});
  await pause(600);
  await page.click('section.checkins tbody tr .btn-ghost');
  await page.waitForSelector('.modal-backdrop', { timeout: 5000 });
  await pause(800);
  await shot('04-checkin-edit');
  await page.click('.modal button.btn-ghost');
  await pause(500);

  // Analytics: dimensions + charts
  await page.goto('http://localhost:8080/analytics', { waitUntil: 'networkidle' });
  await page.waitForSelector('main', { timeout: 10000 });
  await pause(1000);
  await shot('05-analytics');
  await page.getByRole('button', { name: /Department/i }).click().catch(() => {});
  await pause(800);
  await shot('06-analytics-department');

  // Documents: list + upload
  await page.goto('http://localhost:8080/documents', { waitUntil: 'networkidle' });
  await page.waitForSelector('table', { timeout: 10000 });
  await pause(800);
  await shot('07-documents');

  // Search: AI answer
  await page.goto('http://localhost:8080/search', { waitUntil: 'networkidle' });
  await page.getByPlaceholder(/about your time/i).fill('how many hours on procurement');
  await page.getByRole('button', { name: /Ask AI/i }).click();
  await page.waitForSelector('.ai-answer', { timeout: 10000 });
  await pause(1500);
  await shot('08-ai-search');

  // Admin: team analytics
  await page.goto('http://localhost:8080/admin', { waitUntil: 'networkidle' });
  await page.waitForSelector('main', { timeout: 10000 });
  await pause(1000);
  await shot('09-admin');

  // Theme toggle (dark)
  await page.click('.theme-toggle');
  await pause(700);
  await shot('10-dark-theme');
  await page.click('.theme-toggle');
  await pause(400);

  // Sidebar interactions on desktop
  await page.hover('.sidebar-nav a[href="/check-ins"]');
  await pause(400);
  await page.click('.sidebar-actions .btn-ghost').catch(() => {});
  await page.waitForSelector('.user-row', { timeout: 5000 });
  await pause(600);
  await shot('11-switch-identity');
  await page.locator('.user-row').first().click();
  await page.waitForSelector('.cards-grid', { timeout: 10000 });
  await pause(500);

  // Mobile responsive drawer
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForTimeout(500);
  await pause(400);
  await shot('12-mobile-home');
  await page.click('.hamburger');
  await pause(800);
  await shot('13-mobile-drawer-open');
  await page.keyboard.press('Escape');
  await pause(800);

  console.log('Walkthrough complete. Closing video...');
  await page.waitForTimeout(800);
  await context.close();
  await browser.close();

  const vids = fs.readdirSync(OUT).filter((f) => f.endsWith('.webm'));
  console.log(`Video saved: ${OUT}\\${vids[vids.length - 1]}`);
})();