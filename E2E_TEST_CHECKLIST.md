# ✅ RAY Platform - E2E Testing Checklist

Use this checklist before deployment to ensure all critical flows are tested.

---

## 🚀 Pre-Test Setup

- [ ] Both apps installed: `cd ray-web && npm install && cd ../ray-admin && npm install`
- [ ] Playwright installed: `npx playwright install` (in both directories)
- [ ] Environment variables configured (`.env` files)
- [ ] Firebase project configured
- [ ] Backend API running (if testing with real data)

---

## 📱 RAY-WEB (User App) Tests

### Authentication & Onboarding
- [ ] Login page displays correctly
- [ ] Phone number input accepts Rwanda format (+250)
- [ ] Invalid phone numbers show error
- [ ] OTP verification flow works
- [ ] Protected routes redirect to login
- [ ] Profile setup page for new users

### Home Page
- [ ] Home page loads within 3 seconds
- [ ] All 8 categories display
- [ ] Category navigation works
- [ ] Listing cards render correctly
- [ ] Search bar is functional
- [ ] Premium banner displays (if applicable)

### Search & Browse
- [ ] Search results page displays
- [ ] Filter sidebar shows all options
- [ ] Category filter works
- [ ] Price range filter works
- [ ] Location filter works
- [ ] Sort options work (newest, price, etc.)
- [ ] Pagination works
- [ ] "No results" message displays correctly

### Listing Detail
- [ ] Listing details page loads
- [ ] Image gallery displays and navigates
- [ ] Price displays in Rwf format
- [ ] Seller card shows correct info
- [ ] Chat CTA button visible
- [ ] Share button works
- [ ] Favorite button works
- [ ] Similar listings display
- [ ] Breadcrumb navigation works

### Post Ad Flow
- [ ] Post ad page accessible (after login)
- [ ] Step 1: Category selection works
- [ ] Step 2: Title & description validation
- [ ] Step 3: Price input accepts Rwf
- [ ] Step 4: Location selection works
- [ ] Step 5: Photo upload works (Cloudinary)
- [ ] Step 6: Featured upsell displays (Rwf 499)
- [ ] Form validation shows errors
- [ ] Success message after posting
- [ ] Redirect to listing detail

### Chat (if implemented)
- [ ] Chat list displays conversations
- [ ] Chat detail shows messages
- [ ] Real-time message updates
- [ ] Quick replies work
- [ ] Safety banner displays
- [ ] Send message works

### Account & Profile
- [ ] Account page displays user info
- [ ] Stats show correct numbers
- [ ] My listings tab works
- [ ] Edit profile works
- [ ] Logout works
- [ ] Public seller profile displays

### Responsive Design
- [ ] Mobile view (375px) works
- [ ] Tablet view (768px) works
- [ ] Desktop view (1920px) works
- [ ] Mobile tab bar displays on mobile
- [ ] Touch interactions work on mobile

### Performance
- [ ] Page load time < 3 seconds
- [ ] Images load progressively
- [ ] No console errors
- [ ] No memory leaks

---

## 🔐 RAY-ADMIN (Admin Dashboard) Tests

### Authentication
- [ ] Admin login page displays
- [ ] Email validation works
- [ ] Password validation works
- [ ] Invalid credentials show error
- [ ] Successful login redirects to dashboard
- [ ] Role-based access control works

### Dashboard
- [ ] Dashboard loads within 2 seconds
- [ ] 4 stat cards display correct data
- [ ] User growth chart renders
- [ ] Listing activity chart renders
- [ ] Category distribution pie chart renders
- [ ] Recent activity list displays
- [ ] Stat cards are clickable

### Listings Management
- [ ] Listings table displays
- [ ] Search listings works
- [ ] Filter by status works
- [ ] Filter by category works
- [ ] Sort columns work
- [ ] Approve listing works
- [ ] Reject listing works
- [ ] Feature listing works
- [ ] Delete listing shows confirmation
- [ ] Pagination works
- [ ] Bulk actions work (if implemented)

### Users Management
- [ ] Users table displays
- [ ] Search users works
- [ ] Filter by status works
- [ ] View user details works
- [ ] Ban user shows confirmation
- [ ] Unban user works
- [ ] Verify user works
- [ ] User stats display correctly

### Reports & Moderation
- [ ] Reports queue displays
- [ ] Filter by report type works
- [ ] Expand report details works
- [ ] Resolve report works
- [ ] Dismiss report works
- [ ] Report statistics display
- [ ] Action history shows

### Analytics
- [ ] Analytics page loads
- [ ] Revenue chart displays
- [ ] Monetization breakdown shows
- [ ] Platform health metrics display
- [ ] Date range filter works
- [ ] Export data works (if implemented)
- [ ] Charts are interactive

### Navigation & Layout
- [ ] Sidebar displays all menu items
- [ ] Navigation between pages works
- [ ] Active page is highlighted
- [ ] Header displays admin info
- [ ] Logout button works
- [ ] Logout redirects to login
- [ ] Protected routes work
- [ ] Breadcrumbs display correctly

### Data Tables
- [ ] Tables render correctly
- [ ] Column sorting works
- [ ] Column filtering works
- [ ] Row selection works
- [ ] Pagination works
- [ ] Items per page selector works
- [ ] Export to CSV works (if implemented)

---

## 🔄 Integration Tests

### API Integration
- [ ] Listings API endpoints work
- [ ] Users API endpoints work
- [ ] Auth API endpoints work
- [ ] Chat API endpoints work
- [ ] Reports API endpoints work
- [ ] Analytics API endpoints work

### Firebase Integration
- [ ] Phone auth works
- [ ] Firestore reads work
- [ ] Firestore writes work
- [ ] Storage uploads work
- [ ] Cloud messaging works (if implemented)

### Third-Party Services
- [ ] Cloudinary image upload works
- [ ] Cloudinary image optimization works
- [ ] Payment gateway works (if implemented)

---

## 🐛 Error Handling

### User App
- [ ] Network errors show friendly message
- [ ] 404 page displays
- [ ] 500 errors handled gracefully
- [ ] Form validation errors clear
- [ ] Loading states display
- [ ] Empty states display

### Admin App
- [ ] API errors show toast notifications
- [ ] Unauthorized access redirects
- [ ] Invalid data shows validation errors
- [ ] Loading spinners display
- [ ] Empty tables show message

---

## 🎨 UI/UX Tests

### Design System
- [ ] Colors match RAY palette
- [ ] Typography is consistent
- [ ] Spacing is consistent
- [ ] Buttons have hover states
- [ ] Links have hover states
- [ ] Icons display correctly

### Accessibility
- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] Alt text on images
- [ ] ARIA labels present
- [ ] Color contrast meets WCAG AA

### Animations
- [ ] Page transitions smooth
- [ ] Loading animations work
- [ ] Hover animations work
- [ ] No janky animations

---

## 📊 Test Execution Summary

### Run All Tests

```bash
# From project root
run-all-tests.bat

# Or individually
cd ray-web && npm run test:e2e
cd ray-admin && npm run test:e2e
```

### Expected Results

| App | Test Suites | Expected Pass Rate |
|-----|-------------|-------------------|
| ray-web | 6 suites | 100% (40+ tests) |
| ray-admin | 7 suites | 100% (45+ tests) |

---

## 🚨 Critical Paths (Must Pass)

These flows MUST work before deployment:

### User App
1. ✅ User can browse listings
2. ✅ User can search listings
3. ✅ User can view listing details
4. ✅ User can login with phone
5. ✅ User can post an ad

### Admin App
1. ✅ Admin can login
2. ✅ Admin can view dashboard
3. ✅ Admin can manage listings
4. ✅ Admin can manage users
5. ✅ Admin can handle reports

---

## 📝 Test Report Review

After running tests, check:

- [ ] All tests passed
- [ ] No flaky tests (inconsistent results)
- [ ] No console errors in screenshots
- [ ] Performance metrics acceptable
- [ ] Screenshots look correct
- [ ] Traces available for failed tests

---

## ✅ Sign-Off

- [ ] All critical paths tested
- [ ] All test suites passed
- [ ] No blocking issues found
- [ ] Performance acceptable
- [ ] Ready for deployment

**Tested by:** _________________  
**Date:** _________________  
**Environment:** _________________  
**Notes:** _________________

---

**Next Step:** Deploy to production with confidence! 🚀
