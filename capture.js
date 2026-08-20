const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'output');
fs.mkdirSync(OUT, { recursive: true });

const USER = { id: 1, name: 'James Wong', role: 'admin', department: 'Engineering' };
const pause = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch();
  const shot = async (page, name) => {
    await page.screenshot({ path: path.join(OUT, `${name}.png`) });
    console.log(`  shot: ${name}`);
  };

  // ---------- Login page (no user) ----------
  const anon = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const anonPage = await anon.newPage();
  await anonPage.goto('http://localhost:8080', { waitUntil: 'networkidle' });
  await anonPage.waitForSelector('.user-row', { timeout: 5000 });
  await pause(600);
  await shot(anonPage, '01-login');
  await anon.close();

  // ---------- Desktop video (1280x720, video matches viewport) ----------
  const desktop = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    recordVideo: { dir: OUT, size: { width: 1280, height: 720 } },
  });
  await desktop.addInitScript((u) => {
    localStorage.setItem('worksmart-user', JSON.stringify(u));
    localStorage.setItem('worksmart-user-id', String(u.id));
  }, USER);
  const page = await desktop.newPage();
  page.setDefaultTimeout(10000);

  await page.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  await page.waitForSelector('.cards-grid', { timeout: 10000 });
  await pause(800);
  await shot(page, '02-dashboard');

  await page.click('a[href="/check-ins"]');
  await page.waitForSelector('section.checkins table tbody tr', { timeout: 10000 });
  await pause(800);
  await shot(page, '03-checkins');
  await page.locator('.pager button').first().click().catch(() => {});
  await pause(600);
  await page.click('section.checkins tbody tr .btn-ghost');
  await page.waitForSelector('.modal-backdrop', { timeout: 5000 });
  await pause(800);
  await shot(page, '04-checkin-edit');
  await page.click('.modal button.btn-ghost');
  await pause(500);

  await page.goto('http://localhost:8080/analytics', { waitUntil: 'networkidle' });
  await page.waitForSelector('main', { timeout: 10000 });
  await pause(1000);
  await shot(page, '05-analytics');
  await page.getByRole('button', { name: /Department/i }).click().catch(() => {});
  await pause(800);
  await shot(page, '06-analytics-department');

  await page.goto('http://localhost:8080/documents', { waitUntil: 'networkidle' });
  await page.waitForSelector('table', { timeout: 10000 });
  await pause(800);
  await shot(page, '07-documents');

  await page.goto('http://localhost:8080/search', { waitUntil: 'networkidle' });
  await page.getByPlaceholder(/about your time/i).fill('how many hours on procurement');
  await page.getByRole('button', { name: /Ask AI/i }).click();
  await page.waitForSelector('.ai-answer', { timeout: 10000 });
  await pause(1500);
  await shot(page, '08-ai-search');

  await page.goto('http://localhost:8080/admin', { waitUntil: 'networkidle' });
  await page.waitForSelector('main', { timeout: 10000 });
  await pause(1000);
  await shot(page, '09-admin');

  await page.click('.theme-toggle');
  await pause(700);
  await shot(page, '10-dark-theme');
  await page.click('.theme-toggle');
  await pause(400);

  await page.click('.sidebar-actions .btn-ghost').catch(() => {});
  await page.waitForSelector('.user-row', { timeout: 5000 });
  await pause(600);
  await shot(page, '11-switch-identity');
  await page.locator('.user-row').first().click();
  await page.waitForSelector('.cards-grid', { timeout: 10000 });
  await pause(600);

  console.log('Desktop walkthrough complete.');
  const desktopVideo = page.video();
  await desktop.close();
  fs.copyFileSync(await desktopVideo.path(), path.join(OUT, 'desktop-walkthrough.webm'));

  // ---------- Mobile video (390x844, video matches viewport) ----------
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    recordVideo: { dir: OUT, size: { width: 390, height: 844 } },
  });
  await mobile.addInitScript((u) => {
    localStorage.setItem('worksmart-user', JSON.stringify(u));
    localStorage.setItem('worksmart-user-id', String(u.id));
  }, USER);
  const mpage = await mobile.newPage();
  mpage.setDefaultTimeout(10000);

  await mpage.goto('http://localhost:8080/', { waitUntil: 'networkidle' });
  await mpage.waitForSelector('.cards-grid', { timeout: 10000 });
  await pause(800);
  await shot(mpage, '12-mobile-home');

  await mpage.click('.hamburger');
  await pause(800);
  await shot(mpage, '13-mobile-drawer-open');
  await mpage.keyboard.press('Escape');
  await pause(600);

  const gotoViaDrawer = async (href) => {
    const expanded = await mpage.getAttribute('.hamburger', 'aria-expanded');
    if (expanded === 'true') {
      await mpage.keyboard.press('Escape');
      await pause(500);
    }
    await mpage.click('.hamburger');
    await pause(500);
    await mpage.click(`.sidebar-nav a[href="${href}"]`);
    await mpage.waitForTimeout(600);
  };

  await gotoViaDrawer('/check-ins');
  await mpage.waitForSelector('section.checkins table tbody tr', { timeout: 10000 });
  await pause(800);
  await shot(mpage, '14-mobile-checkins');

  await gotoViaDrawer('/analytics');
  await mpage.waitForSelector('main', { timeout: 10000 });
  await pause(1000);
  await shot(mpage, '15-mobile-analytics');
  await mpage.getByRole('button', { name: /Department/i }).click().catch(() => {});
  await pause(800);
  await shot(mpage, '16-mobile-analytics-department');

  await gotoViaDrawer('/documents');
  await mpage.waitForSelector('table', { timeout: 10000 });
  await pause(800);
  await shot(mpage, '17-mobile-documents');

  await gotoViaDrawer('/search');
  await mpage.getByPlaceholder(/about your time/i).fill('how many hours on procurement');
  await mpage.getByRole('button', { name: /Ask AI/i }).click();
  await mpage.waitForSelector('.ai-answer', { timeout: 10000 });
  await pause(1500);
  await shot(mpage, '18-mobile-ai-search');

  await gotoViaDrawer('/admin');
  await mpage.waitForSelector('main', { timeout: 10000 });
  await pause(1000);
  await shot(mpage, '19-mobile-admin');

  await mpage.click('.hamburger');
  await pause(500);
  await mpage.click('.theme-toggle');
  await pause(700);
  await shot(mpage, '20-mobile-dark-theme');
  await mpage.keyboard.press('Escape');
  await pause(800);

  console.log('Mobile walkthrough complete.');
  const mobileVideo = mpage.video();
  await mobile.close();
  fs.copyFileSync(await mobileVideo.path(), path.join(OUT, 'mobile-walkthrough.webm'));
  await browser.close();

  const vids = fs.readdirSync(OUT).filter((f) => f.endsWith('.webm'));
  console.log(`Videos: ${vids.join(', ')}`);
})();
