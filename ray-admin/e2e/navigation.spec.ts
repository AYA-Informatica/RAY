import { test, expect } from '@playwright/test';

test.describe('Admin Navigation & Layout', () => {
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

  test('should display admin sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.locator('text=Dashboard')).toBeVisible();
    await expect(page.locator('text=Listings')).toBeVisible();
    await expect(page.locator('text=Users')).toBeVisible();
    await expect(page.locator('text=Reports')).toBeVisible();
    await expect(page.locator('text=Analytics')).toBeVisible();
  });

  test('should navigate between pages using sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('a:has-text("Listings")');
    await expect(page).toHaveURL(/\/listings/);
    
    await page.click('a:has-text("Users")');
    await expect(page).toHaveURL(/\/users/);
    
    await page.click('a:has-text("Reports")');
    await expect(page).toHaveURL(/\/reports/);
  });

  test('should show admin header', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.locator('text=RAY Admin')).toBeVisible();
  });

  test('should display logout button', async ({ page }) => {
    await page.goto('/dashboard');
    
    const logoutButton = page.locator('button:has-text("Logout")');
    await expect(logoutButton).toBeVisible();
  });

  test('should logout and redirect to login', async ({ page }) => {
    await page.goto('/dashboard');
    
    await page.click('button:has-text("Logout")');
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Admin Login')).toBeVisible();
  });

  test('should protect routes without authentication', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      localStorage.removeItem('ray_admin_user');
    });
    
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/');
  });

  test('should highlight active navigation item', async ({ page }) => {
    await page.goto('/dashboard');
    
    const dashboardLink = page.locator('a:has-text("Dashboard")');
    await expect(dashboardLink).toHaveClass(/active|bg-primary/);
  });
});
