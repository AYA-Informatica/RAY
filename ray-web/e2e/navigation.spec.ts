import { test, expect } from '@playwright/test';

test.describe('Navigation & Layout', () => {
  test('should display navbar on all pages', async ({ page }) => {
    await page.goto('/');
    // Check for header with banner role
    await expect(page.locator('header[role="banner"]')).toBeVisible();
    
    await page.goto('/search');
    await expect(page.locator('header[role="banner"]')).toBeVisible();
  });

  test('should show mobile tab bar on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check for mobile nav element with role
    const tabBar = page.locator('nav[role="navigation"]');
    await expect(tabBar).toBeVisible();
  });

  test('should navigate using navbar links', async ({ page }) => {
    await page.goto('/');
    
    // Click RAY logo to go home
    await page.click('a:has-text("RAY")');
    await expect(page).toHaveURL('/');
    
    // Click Post Ad button
    await page.click('button:has-text("Post Ad")');
    await expect(page).toHaveURL(/\/post|\/login/); // May redirect to auth or go to post
  });

  test('should show footer', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('footer[role="contentinfo"]')).toBeVisible();
    await expect(page.locator('text=© 2026 RAY')).toBeVisible();
  });

  test('should handle 404 page', async ({ page }) => {
    await page.goto('/nonexistent-page-xyz');
    await expect(page.locator('text=404').first()).toBeVisible();
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('header[role="banner"]')).toBeVisible();
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});
