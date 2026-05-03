import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock admin authentication
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.setItem('ray_admin_user', JSON.stringify({
        uid: 'admin-123',
        email: 'admin@ray.com',
        role: 'admin'
      }));
    });
  });

  test('should display dashboard page', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Dashboard')).toBeVisible();
  });

  test('should show 4 stat cards', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.locator('text=Total Users')).toBeVisible();
    await expect(page.locator('text=Active Listings')).toBeVisible();
    await expect(page.locator('text=Total Revenue')).toBeVisible();
    await expect(page.locator('text=Pending Reports')).toBeVisible();
  });

  test('should display activity charts', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.locator('text=User Growth')).toBeVisible();
    await expect(page.locator('text=Listing Activity')).toBeVisible();
  });

  test('should show category distribution pie chart', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Category Distribution')).toBeVisible();
  });

  test('should display recent activity', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('text=Recent Activity')).toBeVisible();
  });

  test('should navigate to listings from stat card', async ({ page }) => {
    await page.goto('/dashboard');
    await page.click('text=Active Listings');
    await expect(page).toHaveURL(/\/listings/);
  });
});
