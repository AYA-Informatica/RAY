# 🧪 RAY Platform - End-to-End Testing Guide

Complete E2E testing suite for both **ray-web** and **ray-admin** applications using Playwright.

---

## 📦 Installation

### 1. Install Playwright for both apps

```bash
# Web App
cd ray-web
npm install
npx playwright install

# Admin App
cd ../ray-admin
npm install
npx playwright install
```

---

## 🚀 Running Tests

### Ray-Web Tests

```bash
cd ray-web

# Run all tests (headless)
npm run test:e2e

# Run with UI mode (recommended for development)
npm run test:e2e:ui

# Run in headed mode (see browser)
npm run test:e2e:headed

# Debug mode (step through tests)
npm run test:e2e:debug

# Run specific test file
npx playwright test e2e/home.spec.ts

# Run specific test by name
npx playwright test -g "should display home page"
```

### Ray-Admin Tests

```bash
cd ray-admin

# Run all tests
npm run test:e2e

# Run with UI mode
npm run test:e2e:ui

# Run in headed mode
npm run test:e2e:headed

# Debug mode
npm run test:e2e:debug
```

---

## 📋 Test Coverage

### Ray-Web (User App) - 6 Test Suites

#### 1. **Authentication Tests** (`auth.spec.ts`)
- ✅ Display login page
- ✅ Phone input with Rwanda prefix (+250)
- ✅ Validate phone number format
- ✅ Redirect to OTP page
- ✅ Protected route redirect

#### 2. **Home Page Tests** (`home.spec.ts`)
- ✅ Load home page successfully
- ✅ Display all 8 categories
- ✅ Navigate to category page
- ✅ Display listing cards
- ✅ Show search bar
- ✅ Navigate to search results

#### 3. **Navigation & Layout Tests** (`navigation.spec.ts`)
- ✅ Display navbar on all pages
- ✅ Show mobile tab bar on mobile
- ✅ Navigate using navbar links
- ✅ Show footer
- ✅ Handle 404 page
- ✅ Responsive on tablet
- ✅ Responsive on mobile

#### 4. **Listing Detail Tests** (`listing-detail.spec.ts`)
- ✅ Display listing details
- ✅ Show image gallery
- ✅ Display seller information
- ✅ Show chat CTA button
- ✅ Display similar listings
- ✅ Show share and favorite buttons

#### 5. **Search & Filters Tests** (`search.spec.ts`)
- ✅ Display search results page
- ✅ Show filter sidebar
- ✅ Filter by category
- ✅ Filter by price range
- ✅ Sort listings
- ✅ Display no results message

#### 6. **Post Ad Flow Tests** (`post-ad.spec.ts`)
- ✅ Display post ad page
- ✅ Show category selection step
- ✅ Navigate through posting steps
- ✅ Validate required fields
- ✅ Show photo upload step
- ✅ Show featured listing upsell

**Total: 40+ test cases**

---

### Ray-Admin (Admin Dashboard) - 7 Test Suites

#### 1. **Admin Authentication Tests** (`auth.spec.ts`)
- ✅ Display admin login page
- ✅ Validate email format
- ✅ Require password
- ✅ Show error on invalid credentials
- ✅ Redirect to dashboard on success

#### 2. **Dashboard Tests** (`dashboard.spec.ts`)
- ✅ Display dashboard page
- ✅ Show 4 stat cards
- ✅ Display activity charts
- ✅ Show category distribution pie chart
- ✅ Display recent activity
- ✅ Navigate to listings from stat card

#### 3. **Listings Management Tests** (`listings.spec.ts`)
- ✅ Display listings page
- ✅ Show listings table
- ✅ Search listings
- ✅ Filter by status
- ✅ Show action buttons
- ✅ Feature a listing
- ✅ Delete with confirmation
- ✅ Paginate listings

#### 4. **Users Management Tests** (`users.spec.ts`)
- ✅ Display users page
- ✅ Show users table
- ✅ Search users
- ✅ Show user action buttons
- ✅ Ban user with confirmation
- ✅ Verify user
- ✅ View user details

#### 5. **Reports & Moderation Tests** (`reports.spec.ts`)
- ✅ Display reports page
- ✅ Show reports queue
- ✅ Filter reports by type
- ✅ Expand report details
- ✅ Resolve a report
- ✅ Dismiss a report
- ✅ Show report statistics

#### 6. **Analytics Tests** (`analytics.spec.ts`)
- ✅ Display analytics page
- ✅ Show revenue chart
- ✅ Display monetization breakdown
- ✅ Show platform health metrics
- ✅ Filter by date range
- ✅ Export analytics data

#### 7. **Navigation & Layout Tests** (`navigation.spec.ts`)
- ✅ Display admin sidebar
- ✅ Navigate between pages
- ✅ Show admin header
- ✅ Display logout button
- ✅ Logout and redirect
- ✅ Protect routes without auth
- ✅ Highlight active navigation

**Total: 45+ test cases**

---

## 🎯 Test Execution Flow

### Automated Test Pipeline

```
1. Install dependencies
   ↓
2. Start dev server (auto)
   ↓
3. Run all test suites
   ↓
4. Generate HTML report
   ↓
5. Take screenshots on failure
   ↓
6. Save trace for debugging
```

---

## 📊 Test Reports

After running tests, view the HTML report:

```bash
# Web app
cd ray-web
npx playwright show-report

# Admin app
cd ray-admin
npx playwright show-report
```

Reports include:
- ✅ Pass/fail status for each test
- ⏱️ Execution time
- 📸 Screenshots on failure
- 🎬 Video recordings (if enabled)
- 🔍 Trace viewer for debugging

---

## 🔧 Configuration

### Browser Coverage

**Ray-Web** tests run on:
- ✅ Chrome (Desktop)
- ✅ Firefox (Desktop)
- ✅ Safari (Desktop)
- ✅ iPhone 13 (Mobile)

**Ray-Admin** tests run on:
- ✅ Chrome (Desktop only)

### Timeouts

- Default: 30 seconds per test
- Navigation: 30 seconds
- Action: 10 seconds

### Retries

- CI: 2 retries on failure
- Local: 0 retries

---

## 🐛 Debugging Failed Tests

### 1. Run in UI Mode (Best for debugging)

```bash
npm run test:e2e:ui
```

### 2. Run in Debug Mode

```bash
npm run test:e2e:debug
```

### 3. View Trace

```bash
npx playwright show-trace trace.zip
```

### 4. Run Single Test

```bash
npx playwright test e2e/home.spec.ts --headed --debug
```

---

## 📝 Writing New Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    // Arrange
    await page.goto('/page');
    
    // Act
    await page.click('button');
    
    // Assert
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### Best Practices

1. **Use data-testid attributes** for stable selectors
2. **Mock authentication** for protected routes
3. **Wait for elements** before interacting
4. **Use descriptive test names**
5. **Keep tests independent** (no shared state)
6. **Clean up after tests** (if needed)

---

## 🚨 Common Issues & Solutions

### Issue: Tests fail with "Timeout"

**Solution:**
```typescript
// Increase timeout for slow operations
await expect(page.locator('text=Loading')).toBeVisible({ timeout: 10000 });
```

### Issue: Element not found

**Solution:**
```typescript
// Wait for element to be visible
await page.waitForSelector('button', { state: 'visible' });
```

### Issue: Firebase auth errors

**Solution:**
```typescript
// Mock authentication in beforeEach
await page.evaluate(() => {
  localStorage.setItem('ray_auth_user', JSON.stringify({
    uid: 'test-user-123',
    phoneNumber: '+250788123456'
  }));
});
```

### Issue: API calls fail

**Solution:**
```typescript
// Mock API responses
await page.route('**/api/listings', route => {
  route.fulfill({
    status: 200,
    body: JSON.stringify({ listings: [] })
  });
});
```

---

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

---

## 📈 Test Metrics

### Current Coverage

| App | Test Suites | Test Cases | Coverage |
|-----|-------------|------------|----------|
| ray-web | 6 | 40+ | Core flows |
| ray-admin | 7 | 45+ | All features |
| **Total** | **13** | **85+** | **Comprehensive** |

### Key User Flows Tested

✅ User registration & login  
✅ Browse & search listings  
✅ View listing details  
✅ Post new ad (6-step flow)  
✅ Admin login & dashboard  
✅ Manage listings (CRUD)  
✅ Manage users (ban/verify)  
✅ Handle reports & moderation  
✅ View analytics & charts  

---

## 🎯 Next Steps

- [ ] Add API integration tests
- [ ] Add performance tests (Lighthouse)
- [ ] Add accessibility tests (axe-core)
- [ ] Add visual regression tests
- [ ] Add load testing (k6)
- [ ] Add mobile app E2E tests (Detox)

---

## 📚 Resources

- [Playwright Documentation](https://playwright.dev)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [CI/CD Guide](https://playwright.dev/docs/ci)

---

**Built with ❤️ for RAY Platform**
