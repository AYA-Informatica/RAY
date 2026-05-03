import { test, expect } from '@playwright/test';

test.describe('Admin Users Management', () => {
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

  test('should display users page', async ({ page }) => {
    await page.goto('/users');
    await expect(page.locator('text=Users Management')).toBeVisible();
  });

  test('should show users table', async ({ page }) => {
    await page.goto('/users');
    
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Phone")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });

  test('should search users', async ({ page }) => {
    await page.goto('/users');
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('test user');
    await expect(searchInput).toHaveValue('test user');
  });

  test('should show user action buttons', async ({ page }) => {
    await page.goto('/users');
    
    await expect(page.locator('button:has-text("Ban")').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Verify")').first()).toBeVisible({ timeout: 10000 });
  });

  test('should ban a user with confirmation', async ({ page }) => {
    await page.goto('/users');
    
    const banButton = page.locator('button:has-text("Ban")').first();
    await banButton.click();
    await expect(page.locator('text=Are you sure')).toBeVisible();
  });

  test('should verify a user', async ({ page }) => {
    await page.goto('/users');
    
    const verifyButton = page.locator('button:has-text("Verify")').first();
    await verifyButton.click();
    await expect(page.locator('text=Verified successfully')).toBeVisible({ timeout: 5000 });
  });

  test('should view user details', async ({ page }) => {
    await page.goto('/users');
    
    const viewButton = page.locator('button:has-text("View")').first();
    await viewButton.click();
    await expect(page.locator('text=User Details')).toBeVisible();
  });
});
