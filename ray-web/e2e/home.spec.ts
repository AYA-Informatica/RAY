import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load home page successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/RAY/);
    // Check for actual content that exists on the page
    await expect(page.locator('h2:has-text("Browse Categories")')).toBeVisible();
  });

  test('should display all 8 categories', async ({ page }) => {
    await page.goto('/');
    // Use actual category names from the page
    const categories = ['Mobiles', 'Cars', 'Properties', 'Electronics', 'Fashion', 'Furniture', 'Jobs', 'Services'];
    for (const category of categories) {
      await expect(page.locator(`text=${category}`)).toBeVisible();
    }
  });

  test('should navigate to category page on click', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Electronics');
    await expect(page).toHaveURL(/\/category\/electronics/);
  });

  test('should display listing cards', async ({ page }) => {
    await page.goto('/');
    const listingCards = page.locator('[data-testid="listing-card"]').first();
    await expect(listingCards).toBeVisible({ timeout: 10000 });
  });

  test('should show search bar', async ({ page }) => {
    await page.goto('/');
    // Use desktop search input specifically
    const searchInput = page.locator('[data-testid="desktop-search-input"]');
    await expect(searchInput).toBeVisible();
  });

  test('should navigate to search results on search', async ({ page }) => {
    await page.goto('/');
    await page.fill('[data-testid="desktop-search-input"]', 'laptop');
    await page.press('[data-testid="desktop-search-input"]', 'Enter');
    await expect(page).toHaveURL(/\/search/);
  });
});
