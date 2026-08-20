import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.localStorage.setItem('worksmart-user', JSON.stringify({ id: 1, name: 'James Wong', role: 'admin', department: 'Engineering' }));
    window.localStorage.setItem('worksmart-user-id', '1');
  });
});

test('dashboard shows insights and stat cards', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
  await expect(page.locator('.cards-grid').first()).toBeVisible();
  await expect(page.getByText(/organization hours/i)).toBeVisible();
});

test('check-ins list renders seeded data (1000+)', async ({ page }) => {
  await page.goto('/check-ins');
  await page.waitForSelector('section.checkins table tbody tr');
  const rows = page.locator('section.checkins table tbody tr');
  await expect(rows.first()).toBeVisible();
  await expect(rows).not.toHaveCount(0);
  await expect(page.locator('.pager')).toContainText(/Page 1 of \d+/);
  const pagerText = await page.locator('.pager').textContent();
  const total = Number(pagerText.match(/Page 1 of (\d+)/)?.[1] || 0);
  expect(total * 25).toBeGreaterThanOrEqual(1000);
});

test('analytics page renders dimension sections', async ({ page }) => {
  await page.goto('/analytics');
  await expect(page.getByRole('heading', { name: /Analytics/i })).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
  await expect(page.locator('.time-chart-plot-desktop')).toBeVisible();
  await expect(page.getByRole('list', { name: 'Time by tag chart' })).toHaveCSS('clip', 'rect(0px, 0px, 0px, 0px)');
});

test('analytics chart exposes every category in the mobile layout', async ({ page }) => {
  await page.setViewportSize({ width: 370, height: 740 });
  await page.goto('/analytics');

  const compactChart = page.getByRole('list', { name: 'Time by tag chart' });
  await expect(compactChart).toBeVisible();
  await expect(page.locator('.time-chart-plot-desktop')).toBeHidden();

  const rows = compactChart.getByRole('listitem');
  expect(await rows.count()).toBeGreaterThan(4);
  await expect(rows.first().locator('strong')).toContainText(/hrs/);

  const hasHorizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(hasHorizontalOverflow).toBe(false);

  await page.getByRole('button', { name: 'By user' }).click();
  const userChart = page.getByRole('list', { name: 'Time by user chart' });
  await expect(userChart).toBeVisible();
  await expect(page.getByRole('button', { name: /Show \d+ more/ })).toBeVisible();
  expect(await userChart.getByRole('listitem').count()).toBeLessThanOrEqual(12);
});

test('documents page lists procurement documents', async ({ page }) => {
  await page.goto('/documents');
  await page.waitForSelector('table');
  await expect(page.locator('table tbody tr').first()).toBeVisible();
});

test('AI search returns an answer', async ({ page }) => {
  await page.goto('/search');
  await page.getByPlaceholder(/about your time/i).fill('how many hours on procurement');
  await page.getByRole('button', { name: /Ask AI/i }).click();
  await expect(page.locator('.ai-answer')).toBeVisible({ timeout: 8000 });
  await expect(page.locator('.ai-answer')).toContainText(/hrs/i);
});

test('admin team analytics renders', async ({ page }) => {
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: /Team Analytics/i })).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
});

test('sidebar is left-anchored on desktop, hidden mobile bar', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/');
  await expect(page.locator('.sidebar')).toBeVisible();
  const box = await page.locator('.sidebar').boundingBox();
  expect(box.x).toBe(0);
  await expect(page.locator('.mobile-bar')).toBeHidden();
});

test('sidebar drawer opens and closes on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('.mobile-bar')).toBeVisible();
  const closed = await page.locator('.sidebar').boundingBox();
  expect(closed.x).toBeLessThan(0);
  await page.click('.hamburger');
  await expect.poll(async () => (await page.locator('.sidebar').boundingBox()).x).toBe(0);
  await page.keyboard.press('Escape');
  await expect.poll(async () => (await page.locator('.sidebar').boundingBox()).x).toBeLessThan(0);
});
