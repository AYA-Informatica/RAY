import { test, expect } from '@playwright/test';

test.describe('Admin Listings Management', () => {
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

  test('should display listings page', async ({ page }) => {
    await page.goto('/listings');
    await expect(page.locator('text=Listings Management')).toBeVisible();
  });

  test('should show listings table', async ({ page }) => {
    await page.goto('/listings');
    
    await expect(page.locator('table')).toBeVisible();
    await expect(page.locator('th:has-text("Title")')).toBeVisible();
    await expect(page.locator('th:has-text("Price")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });

  test('should search listings', async ({ page }) => {
    await page.goto('/listings');
    
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('laptop');
    await expect(searchInput).toHaveValue('laptop');
  });

  test('should filter by status', async ({ page }) => {
    await page.goto('/listings');
    
    await page.click('text=Filter');
    await page.click('text=Active');
    await expect(page).toHaveURL(/status=active/);
  });

  test('should show action buttons for each listing', async ({ page }) => {
    await page.goto('/listings');
    
    await expect(page.locator('button:has-text("Approve")').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('button:has-text("Reject")').first()).toBeVisible({ timeout: 10000 });
  });

  test('should feature a listing', async ({ page }) => {
    await page.goto('/listings');
    
    const featureButton = page.locator('button:has-text("Feature")').first();
    await featureButton.click();
    await expect(page.locator('text=Featured successfully')).toBeVisible({ timeout: 5000 });
  });

  test('should delete a listing with confirmation', async ({ page }) => {
    await page.goto('/listings');
    
    const deleteButton = page.locator('button:has-text("Delete")').first();
    await deleteButton.click();
    await expect(page.locator('text=Are you sure')).toBeVisible();
  });

  test('should paginate listings', async ({ page }) => {
    await page.goto('/listings');
    
    const nextButton = page.locator('button:has-text("Next")');
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await expect(page).toHaveURL(/page=2/);
    }
  });
});
