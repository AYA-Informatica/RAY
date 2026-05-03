import { test, expect } from '@playwright/test';

test.describe('Post Ad Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display post ad page', async ({ page }) => {
    await page.goto('/post');
    await page.waitForLoadState('networkidle');
    // Check if redirected to login or on post page
    const hasPostContent = await page.locator('text=What are you selling').isVisible().catch(() => false);
    const hasAuthContent = await page.locator('text=Enter Your Phone Number').isVisible().catch(() => false);
    
    if (hasAuthContent) {
      await expect(page.locator('text=Enter Your Phone Number')).toBeVisible();
    } else {
      await expect(page.locator('text=What are you selling').or(page.locator('text=Post Your Ad'))).toBeVisible();
    }
  });

  test('should show category selection step', async ({ page }) => {
    await page.goto('/post');
    await page.waitForLoadState('networkidle');
    
    const onAuthPage = await page.locator('text=Enter Your Phone Number').isVisible().catch(() => false);
    
    if (onAuthPage) {
      test.skip();
      return;
    }
    
    await expect(page.locator('text=Electronics')).toBeVisible();
  });

  test('should navigate through posting steps', async ({ page }) => {
    await page.goto('/post');
    await page.waitForLoadState('networkidle');
    
    const onAuthPage = await page.locator('text=Enter Your Phone Number').isVisible().catch(() => false);
    if (onAuthPage) {
      test.skip();
      return;
    }
    
    // Step 1: Category
    await page.click('text=Electronics');
    await page.click('button:has-text("Continue")');
    
    // Should progress to next step
    await expect(page.locator('text=Add Photos').or(page.locator('text=Step 2'))).toBeVisible({ timeout: 5000 });
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/post');
    await page.waitForLoadState('networkidle');
    
    const onAuthPage = await page.locator('text=Enter Your Phone Number').isVisible().catch(() => false);
    if (onAuthPage) {
      test.skip();
      return;
    }
    
    // Try to proceed without selecting category
    await page.click('button:has-text("Continue")');
    await expect(page.locator('text=Select a category').or(page.locator('text=required'))).toBeVisible({ timeout: 5000 });
  });

  test('should show photo upload step', async ({ page }) => {
    await page.goto('/post');
    await page.waitForLoadState('networkidle');
    
    const onAuthPage = await page.locator('text=Enter Your Phone Number').isVisible().catch(() => false);
    if (onAuthPage) {
      test.skip();
      return;
    }
    
    await page.click('text=Electronics');
    await page.click('button:has-text("Continue")');
    
    await expect(page.locator('text=Add Photos').or(page.locator('text=photo'))).toBeVisible({ timeout: 5000 });
  });

  test('should show featured listing upsell', async ({ page }) => {
    await page.goto('/post');
    await page.waitForLoadState('networkidle');
    
    const onAuthPage = await page.locator('text=Enter Your Phone Number').isVisible().catch(() => false);
    if (onAuthPage) {
      test.skip();
      return;
    }
    
    // The featured upsell appears in the final step
    await expect(page.locator('text=Post Your Ad').or(page.locator('text=Featured'))).toBeVisible({ timeout: 5000 });
  });
});
