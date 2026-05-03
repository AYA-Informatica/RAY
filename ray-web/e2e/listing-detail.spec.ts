import { test, expect } from '@playwright/test';

test.describe('Listing Detail Page', () => {
  test('should display listing details', async ({ page }) => {
    await page.goto('/');
    // Check if listings exist first
    const listingCard = page.locator('[data-testid="listing-card"]').first();
    const hasListings = await listingCard.count() > 0;
    
    if (!hasListings) {
      // Skip test if no listings available
      test.skip();
      return;
    }
    
    await listingCard.click({ timeout: 10000 });
    
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Rwf')).toBeVisible();
    await expect(page.locator('text=Description')).toBeVisible();
  });

  test('should show image gallery', async ({ page }) => {
    await page.goto('/');
    const listingCard = page.locator('[data-testid="listing-card"]').first();
    const hasListings = await listingCard.count() > 0;
    
    if (!hasListings) {
      test.skip();
      return;
    }
    
    await listingCard.click({ timeout: 10000 });
    
    const images = page.locator('img[alt*="listing"]');
    await expect(images.first()).toBeVisible();
  });

  test('should display seller information', async ({ page }) => {
    await page.goto('/');
    const listingCard = page.locator('[data-testid="listing-card"]').first();
    const hasListings = await listingCard.count() > 0;
    
    if (!hasListings) {
      test.skip();
      return;
    }
    
    await listingCard.click({ timeout: 10000 });
    
    await expect(page.locator('text=Seller')).toBeVisible();
    await expect(page.locator('[data-testid="seller-card"]')).toBeVisible();
  });

  test('should show chat CTA button', async ({ page }) => {
    await page.goto('/');
    const listingCard = page.locator('[data-testid="listing-card"]').first();
    const hasListings = await listingCard.count() > 0;
    
    if (!hasListings) {
      test.skip();
      return;
    }
    
    await listingCard.click({ timeout: 10000 });
    
    const chatButton = page.locator('button:has-text("Chat")');
    await expect(chatButton).toBeVisible();
  });

  test('should display similar listings', async ({ page }) => {
    await page.goto('/');
    const listingCard = page.locator('[data-testid="listing-card"]').first();
    const hasListings = await listingCard.count() > 0;
    
    if (!hasListings) {
      test.skip();
      return;
    }
    
    await listingCard.click({ timeout: 10000 });
    
    await expect(page.locator('text=Similar Listings')).toBeVisible({ timeout: 10000 });
  });

  test('should show share and favorite buttons', async ({ page }) => {
    await page.goto('/');
    const listingCard = page.locator('[data-testid="listing-card"]').first();
    const hasListings = await listingCard.count() > 0;
    
    if (!hasListings) {
      test.skip();
      return;
    }
    
    await listingCard.click({ timeout: 10000 });
    
    await expect(page.locator('[aria-label="Share"]')).toBeVisible();
    await expect(page.locator('[aria-label="Favorite"]')).toBeVisible();
  });
});
