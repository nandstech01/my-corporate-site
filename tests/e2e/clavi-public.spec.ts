import { test, expect } from '@playwright/test';

test.describe('CLAVI Public Pages', () => {
  test('landing page renders correctly', async ({ page }) => {
    await page.goto('/clavi');
    await expect(page).toHaveTitle(/CLAVI|エヌアンドエス/);
    await expect(page.locator('text=AI検索最適化')).toBeVisible();
  });

  test('pricing page renders correctly', async ({ page }) => {
    await page.goto('/clavi/pricing');
    await expect(page.locator('text=Starter')).toBeVisible();
    await expect(page.locator('text=Pro')).toBeVisible();
    await expect(page.locator('text=Enterprise')).toBeVisible();
  });

  test('features page renders correctly', async ({ page }) => {
    await page.goto('/clavi/features');
    await expect(page.locator('text=Analyze')).toBeVisible();
    await expect(page.locator('text=Generate')).toBeVisible();
    await expect(page.locator('text=Expand')).toBeVisible();
  });

  test('navigation between public pages works', async ({ page }) => {
    await page.goto('/clavi');
    await expect(page.locator('text=AI検索最適化')).toBeVisible();

    await page.goto('/clavi/pricing');
    await expect(page.locator('text=Starter')).toBeVisible();

    await page.goto('/clavi/features');
    await expect(page.locator('text=Analyze')).toBeVisible();
  });
});
