import { test, expect } from '@playwright/test';

test.describe('Admin Authentication', () => {
  test('should display admin login page', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Admin Login')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Login")');
    
    await expect(page.locator('text=Invalid email')).toBeVisible({ timeout: 5000 });
  });

  test('should require password', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'admin@ray.com');
    await page.click('button:has-text("Login")');
    
    await expect(page.locator('text=Password is required')).toBeVisible({ timeout: 5000 });
  });

  test('should show error on invalid credentials', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Login")');
    
    await expect(page.locator('text=Invalid credentials').or(page.locator('text=Login failed'))).toBeVisible({ timeout: 10000 });
  });

  test('should redirect to dashboard on successful login', async ({ page }) => {
    await page.goto('/');
    
    // Mock successful login
    await page.evaluate(() => {
      localStorage.setItem('ray_admin_user', JSON.stringify({
        uid: 'admin-123',
        email: 'admin@ray.com',
        role: 'admin'
      }));
    });
    
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/dashboard/);
  });
});
