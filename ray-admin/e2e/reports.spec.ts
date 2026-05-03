import { test, expect } from '@playwright/test';

test.describe('Admin Reports & Moderation', () => {
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

  test('should display reports page', async ({ page }) => {
    await page.goto('/reports');
    await expect(page.locator('text=Reports & Moderation')).toBeVisible();
  });

  test('should show reports queue', async ({ page }) => {
    await page.goto('/reports');
    
    await expect(page.locator('text=Pending Reports')).toBeVisible();
    await expect(page.locator('table')).toBeVisible();
  });

  test('should filter reports by type', async ({ page }) => {
    await page.goto('/reports');
    
    await page.click('text=Filter');
    await page.click('text=Scam');
    await expect(page).toHaveURL(/type=scam/);
  });

  test('should expand report details', async ({ page }) => {
    await page.goto('/reports');
    
    const expandButton = page.locator('button:has-text("View")').first();
    await expandButton.click();
    await expect(page.locator('text=Report Details')).toBeVisible();
  });

  test('should resolve a report', async ({ page }) => {
    await page.goto('/reports');
    
    const resolveButton = page.locator('button:has-text("Resolve")').first();
    await resolveButton.click();
    await expect(page.locator('text=Resolved successfully')).toBeVisible({ timeout: 5000 });
  });

  test('should dismiss a report', async ({ page }) => {
    await page.goto('/reports');
    
    const dismissButton = page.locator('button:has-text("Dismiss")').first();
    await dismissButton.click();
    await expect(page.locator('text=Dismissed successfully')).toBeVisible({ timeout: 5000 });
  });

  test('should show report statistics', async ({ page }) => {
    await page.goto('/reports');
    
    await expect(page.locator('text=Total Reports')).toBeVisible();
    await expect(page.locator('text=Pending')).toBeVisible();
    await expect(page.locator('text=Resolved')).toBeVisible();
  });
});
