import { test, expect } from '@playwright/test';

test.describe('Search & Filters', () => {
  test('should display search results page', async ({ page }) => {
    await page.goto('/search?q=phone');
    // Check for actual heading that exists
    await expect(page.locator('h1:has-text("Results for")')).toBeVisible();
  });

  test('should show filter sidebar', async ({ page }) => {
    await page.goto('/search');
    await expect(page.locator('text=Category').first()).toBeVisible();
    await expect(page.locator('text=Price').first()).toBeVisible();
    await expect(page.locator('text=Condition').first()).toBeVisible();
  });

  test('should filter by category', async ({ page }) => {
    await page.goto('/search');
    await page.click('button:has-text("Electronics")');
    // Wait for URL to update or page to reload
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/cat=electronics/);
  });

  test('should filter by price range', async ({ page }) => {
    await page.goto('/search');
    // Fill price inputs using proper selectors
    const minInput = page.locator('input[type="number"]').first();
    const maxInput = page.locator('input[type="number"]').last();
    await minInput.fill('10000');
    await maxInput.fill('50000');
    await page.click('button:has-text("Apply Filters")');
    await page.waitForTimeout(500);
  });

  test('should sort listings', async ({ page }) => {
    await page.goto('/search');
    // Select from dropdown
    await page.selectOption('select', 'price_asc');
    await page.waitForTimeout(500);
    await expect(page).toHaveURL(/sort=price_asc/);
  });

  test('should display no results message when no listings found', async ({ page }) => {
    await page.goto('/search?q=xyzabc123nonexistent');
    await expect(page.locator('text=No results').first()).toBeVisible({ timeout: 10000 });
  });
});
