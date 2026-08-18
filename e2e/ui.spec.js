import { test, expect } from '@playwright/test';

test('dashboard shows insights and stat cards', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
  await expect(page.locator('.cards-grid').first()).toBeVisible();
  await expect(page.getByText(/hrs logged/i)).toBeVisible();
});

test('check-ins list renders seeded data (1000+)', async ({ page }) => {
  await page.goto('/check-ins');
  await page.waitForSelector('section.checkins ul li');
  const items = page.locator('section.checkins ul li');
  await expect(items.first()).toBeVisible();
  await expect(items).not.toHaveCount(0);
});

test('analytics page renders dimension sections', async ({ page }) => {
  await page.goto('/analytics');
  await expect(page.getByRole('heading', { name: /Analytics/i })).toBeVisible();
  await expect(page.locator('main')).toBeVisible();
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
