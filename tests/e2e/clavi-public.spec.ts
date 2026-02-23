import { test, expect } from '@playwright/test';

test.describe('CLAVI Public Pages', () => {
  test('landing page renders correctly', async ({ page }) => {
    await page.goto('/clavi');
    // Wait for client-side hydration
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveTitle(/CLAVI|エヌアンドエス/);
  });

  test('pricing page renders correctly', async ({ page }) => {
    await page.goto('/clavi/pricing');
    await page.waitForLoadState('networkidle');
    // Use getByRole to avoid strict mode violations (Starter appears in heading and table)
    await expect(page.getByRole('heading', { name: 'Starter' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Enterprise' })).toBeVisible();
  });

  test('features page renders correctly', async ({ page }) => {
    await page.goto('/clavi/features');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Analyze')).toBeVisible();
    await expect(page.locator('text=Generate')).toBeVisible();
    await expect(page.locator('text=Expand')).toBeVisible();
  });

  test('navigation between public pages works', async ({ page }) => {
    await page.goto('/clavi/pricing');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('heading', { name: 'Starter' })).toBeVisible();

    await page.goto('/clavi/features');
    await page.waitForLoadState('networkidle');
    await expect(page.locator('text=Analyze')).toBeVisible();
  });
});
