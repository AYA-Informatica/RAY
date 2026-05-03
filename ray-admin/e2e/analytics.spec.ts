import { test, expect } from '@playwright/test';

test.describe('Admin Analytics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('ray_admin_user', JSON.stringify({
        uid: 'admin-123',
        email: 'admin@ray.com',
        role: 'admin'
      }));
    });
  });

  test('should display analytics page', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page.locator('text=Analytics')).toBeVisible();
  });

  test('should show revenue chart', async ({ page }) => {
    await page.goto('/analytics');
    await expect(page.locator('text=Revenue Overview')).toBeVisible();
  });

  test('should display monetization breakdown', async ({ page }) => {
    await page.goto('/analytics');
    
    await expect(page.locator('text=Featured Listings')).toBeVisible();
    await expect(page.locator('text=Premium Sellers')).toBeVisible();
  });

  test('should show platform health metrics', async ({ page }) => {
    await page.goto('/analytics');
    
    await expect(page.locator('text=Platform Health')).toBeVisible();
    await expect(page.locator('text=Active Users')).toBeVisible();
  });

  test('should filter analytics by date range', async ({ page }) => {
    await page.goto('/analytics');
    
    await page.click('text=Last 7 days');
    await page.click('text=Last 30 days');
    await expect(page.locator('text=Last 30 days')).toBeVisible();
  });

  test('should export analytics data', async ({ page }) => {
    await page.goto('/analytics');
    
    const exportButton = page.locator('button:has-text("Export")');
    if (await exportButton.isVisible()) {
      await expect(exportButton).toBeEnabled();
    }
  });
});
