# RAY Production Readiness Testing Checklist

## Priority: Items 1-6 (Core Functionality)

### 1. Authentication & User Management

- [ ] Sign up with Google OAuth
- [ ] Sign out and sign back in
- [ ] Check if user profile is created in database
- [ ] Update profile information (name, bio, location)
- [ ] Upload profile avatar image
- [ ] Verify profile changes persist after refresh
- [ ] Test authentication on mobile browser

**Expected Behavior:**
- Google OAuth redirect should work smoothly
- User record should appear in `public."User"` table after first sign-in
- Profile updates should save to database and reflect immediately
- Avatar should upload to `avatars` bucket in Supabase Storage
- Session should persist across page refreshes

---

### 2. Listing Management

- [ ] Create a new listing (test all 10 categories)
  - [ ] 📱 Phones (Brand, Storage, RAM, Battery Health)
  - [ ] 💻 Electronics (Type, Brand, Warranty)
  - [ ] 🚗 Cars (Brand, Year, Mileage, Fuel Type, Transmission)
  - [ ] 🚲 Bikes (Type, Brand, Year)
  - [ ] 🏠 Rentals (Bedrooms, Bathrooms, Furnished, Parking)
  - [ ] 🛋️ Furniture (Type, Material)
  - [ ] 👕 Fashion (Category, Size)
  - [ ] 💼 Jobs (Job Type, Remote)
  - [ ] 🛠️ Services (Service Type)
  - [ ] 👶 Kids (Type)
- [ ] Upload multiple images for a listing (test up to 7 images)
- [ ] Test dynamic category attributes for each category
- [ ] Mark a listing as sold
- [ ] Reactivate a sold listing
- [ ] Edit an existing listing
- [ ] Delete a listing
- [ ] Verify listing expiry after 30 days (check database `expiresAt` field)
- [ ] Test repost functionality (clone expired listing)

**Expected Behavior:**
- Wizard should complete in under 60 seconds
- Images should be compressed to WebP format
- Draft should save to localStorage between steps
- Dynamic attributes should render based on selected category
- Status changes should persist immediately
- Expired listings should have `status = 'EXPIRED'` after cron job runs

---

### 3. Search & Discovery

- [ ] Browse home page and view recent listings
- [ ] Search for listings by keyword
- [ ] Filter by category (test category tabs)
- [ ] Filter by location (city/district/neighborhood)
- [ ] Filter by price range
- [ ] Filter by condition (New, Like New, Good, Fair, Used)
- [ ] Test distance filter (requires location permission)
- [ ] Click on a listing to view details
- [ ] Verify listings are sorted by relevance/distance
- [ ] Test search with no results
- [ ] Test search debouncing (rapid typing should only trigger one search)

**Expected Behavior:**
- Search should debounce with 300ms delay
- Filter chips should be individually dismissable
- Distance filter should request location permission
- Results should show distance in km when location is shared
- Rate limiting should kick in after 60 searches per minute

---

### 4. Favorites

- [ ] Add a listing to favorites (heart icon)
- [ ] View favorites page (`/favorites`)
- [ ] Remove a listing from favorites
- [ ] Verify favorites persist after logout/login
- [ ] Test optimistic UI updates (heart should toggle immediately)

**Expected Behavior:**
- Heart icon should toggle red/gray instantly (optimistic update)
- Favorites should sync to server in background
- Unauthenticated users should be redirected to login when favoriting
- Favorites page should display saved listings in grid

---

### 5. Chat & Messaging

- [ ] Send a message to a seller from listing page
- [ ] Receive and reply to messages
- [ ] Send an image in chat
- [ ] Share location in chat
- [ ] Use quick replies ("Is this available?", "Last price?", etc.)
- [ ] Test read receipts (checkmark icons)
- [ ] Make a price offer (buyer)
- [ ] Accept/decline a price offer (seller)
- [ ] Verify offer status updates (pending/accepted/declined)
- [ ] Block a user
- [ ] Unblock a user
- [ ] Verify blocked users can't send messages
- [ ] Test realtime message delivery (messages appear instantly)
- [ ] Test presence indicator (online dot + "last seen")

**Expected Behavior:**
- Messages should appear in realtime via Supabase Realtime
- Conversation should auto-create on first message
- Images should upload to `chat-images` bucket
- Location sharing should open Google Maps link
- Block should prevent message sending in both directions
- Presence heartbeat should update every 90 seconds
- Offer cards should show Accept/Decline buttons to seller only

---

### 6. Reporting & Moderation

- [ ] Report a listing (test different report reasons: Spam, Fake, Stolen, Harassment, Scam, Inappropriate)
- [ ] Verify report is logged in database (`public."Report"` table)
- [ ] File 3 reports on the same listing (from different accounts if possible)
- [ ] Check if listing gets flagged after 3+ reports (`status = 'FLAGGED'`)
- [ ] Test admin dashboard access (`/admin`)
  - [ ] Verify only users with `role = 'ADMIN'` or `role = 'MODERATOR'` can access
  - [ ] View dashboard statistics
  - [ ] Browse flagged listings
  - [ ] Remove a listing
  - [ ] Restore a listing
  - [ ] Resolve a report
  - [ ] Ban a user (admin only)
  - [ ] Unban a user (admin only)

**Expected Behavior:**
- Report form should submit successfully
- Listing should auto-flag after 3+ open reports
- Admin dashboard should be blocked for regular users (403 Forbidden)
- Moderation actions should log to database and Pino logger
- Banned users should not be able to post/chat

---

## Priority: Items 7-16 (Polish & Edge Cases)

### 7. Admin Dashboard (if admin role assigned)

- [ ] Manually set your user role to ADMIN in database:
  ```sql
  UPDATE public."User" SET role = 'ADMIN' WHERE email = 'your@email.com';
  ```
- [ ] Access `/admin` route
- [ ] View dashboard statistics (users, active listings, flagged, open reports)
- [ ] Navigate to Listings tab (browse all listings)
- [ ] Navigate to Reports tab (open reports queue)
- [ ] Navigate to Users tab (user management)
- [ ] Test bulk actions

**Expected Behavior:**
- Admin nav should show 4 tabs: Overview, Listings, Reports, Users
- Statistics should be accurate
- Actions should complete without errors

---

### 8. UI/UX & Responsiveness

- [ ] Test on mobile portrait (< 640px)
- [ ] Test on mobile landscape
- [ ] Test on tablet (768px - 1024px)
- [ ] Test on desktop (1024px+)
- [ ] Test on wide desktop (1280px+)
- [ ] Verify bottom nav shows on mobile/tablet (`< lg`)
- [ ] Verify top nav shows on desktop (`lg+`)
- [ ] Test dark mode rendering (RAY is dark-mode only)
- [ ] Check all buttons and links work
- [ ] Verify loading states show properly (skeletons, spinners)
- [ ] Test error pages (visit `/nonexistent` for 404)
- [ ] Test listing detail page on mobile (sticky chat bar)
- [ ] Test listing detail page on desktop (inline chat CTA)

**Expected Behavior:**
- Layout should reflow gracefully across all breakpoints
- Bottom nav should have 5 tabs: Home, Search, Sell, Messages, Profile
- Top nav should show brand logo, links, Sell button, favorites, profile
- Unread message badge should display on Messages tab
- Grid columns should scale: 2 → 3 → 4 → 5 (mobile to desktop)

---

### 9. Performance & PWA

- [ ] Install as PWA (Add to Home Screen) on mobile
- [ ] Test offline behavior (disconnect network, browse cached pages)
- [ ] Check image loading and caching (images should load from cache on revisit)
- [ ] Verify page load times are acceptable (< 3s on 3G)
- [ ] Test with slow 3G network simulation (Chrome DevTools)
- [ ] Check service worker registration (`/sw.js` should exist)
- [ ] Verify manifest is accessible (`/manifest.json`)
- [ ] Test app icon displays correctly when installed

**Expected Behavior:**
- PWA should be installable on mobile browsers
- Service worker should cache Supabase Storage images (cache-first)
- Static assets should use stale-while-revalidate
- API routes should never be cached
- HTML pages should use network-first with 5s timeout
- App should show offline fallback when network is unavailable

---

### 10. Security

- [ ] Try accessing protected routes without login:
  - [ ] `/sell` → should redirect to `/login?redirect=/sell`
  - [ ] `/chat` → should redirect to `/login`
  - [ ] `/profile` → should redirect to `/login`
  - [ ] `/favorites` → should redirect to `/login`
  - [ ] `/admin` → should redirect to `/login`
- [ ] Verify you can only edit your own listings (try accessing `/profile/ads/[another-user-listing-id]/edit`)
- [ ] Verify you can only delete your own listings (try `DELETE /api/listings/[another-user-listing-id]`)
- [ ] Try SQL injection in search: `'; DROP TABLE "Listing"; --`
- [ ] Try XSS in listing description: `<script>alert('XSS')</script>`
- [ ] Test rate limiting:
  - [ ] Rapid-fire listing creation (should hit rate limit at 10 per 10 min)
  - [ ] Rapid-fire chat messages (should hit rate limit at 30 per 1 min)
  - [ ] Rapid-fire search (should hit rate limit at 60 per 1 min)
- [ ] Verify blocked users can't message each other
- [ ] Test CRON_SECRET protection on `/api/cron/expire-listings` (request without header should fail)

**Expected Behavior:**
- Middleware should gate protected routes
- API routes should enforce ownership via `requireUser()` + RLS
- SQL injection should be prevented by Prisma (parameterized queries)
- XSS should be stripped by DOMPurify (stored as plain text)
- Rate limiters should return `429 Too Many Requests`
- Cron endpoints should reject requests without `Authorization: Bearer <CRON_SECRET>`

---

### 11. Data & Storage

- [ ] Verify images upload to Supabase Storage:
  - [ ] Check `listings` bucket (listing photos)
  - [ ] Check `avatars` bucket (profile photos)
  - [ ] Check `chat-images` bucket (chat photos)
- [ ] Verify image compression is working (check file size < original)
- [ ] Verify images are in WebP format
- [ ] Verify database queries are fast (< 200ms on listing detail page)
- [ ] Check categories are properly seeded (10 categories with attributes)
  - Run: `SELECT * FROM public."Category" ORDER BY "order";`
  - Should return: Phones, Electronics, Cars, Bikes, Rentals, Furniture, Fashion, Jobs, Services, Kids
- [ ] Verify dynamic attributes are seeded for each category
  - Run: `SELECT * FROM public."CategoryAttribute" WHERE "categoryId" = '[category-id]';`

**Expected Behavior:**
- All three buckets should exist and be public
- Images should be < 500KB after compression
- WebP format should be visible in URLs (`.webp` extension)
- Database queries should use indexes (check with `EXPLAIN ANALYZE`)

---

### 12. Internationalization

- [ ] Switch language to Kinyarwanda (Profile → Language → Kinyarwanda)
- [ ] Verify UI text changes across pages (nav, buttons, forms)
- [ ] Test specific translations:
  - [ ] Navigation tabs
  - [ ] Sell wizard steps
  - [ ] Chat interface
  - [ ] Profile menu
- [ ] Switch to French
- [ ] Verify French translations load
- [ ] Switch back to English
- [ ] Verify language preference persists after logout/login (cookie: `ray_locale`)

**Expected Behavior:**
- Language should change immediately (client-side context)
- Cookie should persist selection
- SSR should hydrate with correct locale
- All 400+ keys should have translations (fallback to English if missing)

---

### 13. Edge Cases

- [ ] Create listing with no images (should be blocked by wizard gate)
- [ ] Create listing with 1 image (should work)
- [ ] Create listing with maximum images (7)
- [ ] Try uploading 8th image (should be capped at 7)
- [ ] Test very long listing titles (120 characters max)
- [ ] Test very long descriptions (5000 characters max)
- [ ] Test special characters in search: `!@#$%^&*()`
- [ ] Test empty search results
- [ ] Test search with only filters (no keyword)
- [ ] Try rapid-fire actions (click favorite button 10x quickly)
- [ ] Test chat with blocked user (should show "You can't message this user")
- [ ] Test editing a listing that was deleted by another user (should 404)
- [ ] Test marking a listing sold, then immediately reactivating it

**Expected Behavior:**
- Wizard gates should prevent incomplete submissions
- Image upload should cap at 7
- Zod validation should enforce max lengths
- Sanitization should strip malicious input
- Optimistic updates should handle race conditions gracefully
- Error states should display user-friendly messages

---

### 14. Email & Notifications (if implemented)

- [ ] Check if any email notifications are sent
- [ ] Verify notification preferences
- [ ] Test email templates (if any)

**Status:** ❌ Not implemented in MVP

---

### 15. SEO & Metadata

- [ ] Check page titles are correct:
  - [ ] Home: "Home · RAY"
  - [ ] Listing detail: "[Listing Title] · RAY"
  - [ ] Search: "Search · RAY"
- [ ] Verify meta descriptions on listing detail pages
- [ ] Test Open Graph tags (share listing link on social media/Slack)
  - Should show: title, description, image, price, location
- [ ] Check sitemap.xml is accessible at `/sitemap.xml`
- [ ] Verify robots.txt at `/robots.txt`
- [ ] Test JSON-LD structured data on listing detail pages (validate with https://search.google.com/test/rich-results)

**Expected Behavior:**
- Page titles should follow template: `[Page] · RAY`
- OG tags should populate when sharing links
- Sitemap should include all active listings
- robots.txt should allow all crawlers
- JSON-LD should validate as `Product` schema

---

### 16. Final Checks

- [ ] Review browser console for errors (Chrome/Firefox DevTools)
- [ ] Check Vercel deployment logs for errors
- [ ] Verify all environment variables are set correctly in Vercel:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `DATABASE_URL`
  - [ ] `DIRECT_URL`
  - [ ] `UPSTASH_REDIS_REST_URL`
  - [ ] `UPSTASH_REDIS_REST_TOKEN`
  - [ ] `NEXT_PUBLIC_SITE_URL`
  - [ ] `ALLOWED_ORIGINS`
  - [ ] `CRON_SECRET`
- [ ] Test Cron job for listing expiry:
  - Manual trigger: `curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.vercel.app/api/cron/expire-listings`
- [ ] Review Supabase logs for errors (Dashboard → Logs)
- [ ] Check Upstash Redis connection for rate limiting (Dashboard → Metrics)
- [ ] Verify Supabase Storage buckets are public:
  - `listings`
  - `avatars`
  - `chat-images`
- [ ] Confirm RLS policies are enabled on all tables
- [ ] Run `npm run typecheck` locally (should pass with no errors)
- [ ] Run `npm run lint` locally (should pass with no errors)

**Expected Behavior:**
- Console should be clean (no errors or warnings)
- Deployment logs should show successful builds
- Cron job should return `{"data":{"expired":X,"ranAt":"..."}}`
- Supabase logs should show auth events, database queries
- Redis metrics should show rate limit hits
- TypeScript and ESLint should pass

---

## Critical Issues to Fix Before Launch

- [ ] Any error that prevents core functionality (signup, listing creation, chat)
- [ ] Security vulnerabilities (exposed secrets, SQL injection, XSS)
- [ ] Data loss issues (cascading deletes not working, orphaned records)
- [ ] Performance issues causing timeouts (> 5s page load)

---

## Nice to Have Before Launch

- [ ] OAuth consent screen branding (show "RAY" instead of Supabase domain)
- [ ] Custom domain instead of vercel.app
- [ ] Analytics/monitoring setup (Google Analytics, Vercel Analytics)
- [ ] Error tracking (Sentry, LogRocket)
- [ ] Automated tests (Playwright, Vitest)
- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices, SEO)

---

## Testing Priority Order

1. **Items 1-6**: Core functionality (MUST WORK)
2. **Items 7-10**: Critical polish (should work smoothly)
3. **Items 11-16**: Edge cases and final verification (nice to have)

---

## Test User Setup

Create at least 3 test accounts for comprehensive testing:

1. **Admin User**: Set `role = 'ADMIN'` in database
2. **Regular User 1**: For creating listings and testing buyer flow
3. **Regular User 2**: For testing chat, blocking, and seller flow

---

## Database Verification Queries

```sql
-- Check user was created after sign-in
SELECT * FROM public."User" WHERE email = 'your@email.com';

-- Check listing was created
SELECT * FROM public."Listing" WHERE "userId" = 'your-user-id' ORDER BY "createdAt" DESC LIMIT 5;

-- Check categories are seeded
SELECT * FROM public."Category" ORDER BY "order";

-- Check category attributes
SELECT ca.*, c.name as category_name 
FROM public."CategoryAttribute" ca
JOIN public."Category" c ON ca."categoryId" = c.id
ORDER BY c."order", ca."order";

-- Check reports on a listing
SELECT * FROM public."Report" WHERE "listingId" = 'listing-id';

-- Check if listing is flagged
SELECT id, title, status FROM public."Listing" WHERE status = 'FLAGGED';

-- Check expired listings
SELECT id, title, "expiresAt", status FROM public."Listing" WHERE "expiresAt" < NOW() AND status = 'ACTIVE';

-- Check conversations
SELECT * FROM public."Conversation" WHERE "buyerId" = 'your-user-id' OR "sellerId" = 'your-user-id';

-- Check messages in a conversation
SELECT * FROM public."Message" WHERE "conversationId" = 'conversation-id' ORDER BY "createdAt";

-- Check blocks
SELECT * FROM public."Block" WHERE "blockerId" = 'your-user-id' OR "blockedId" = 'your-user-id';
```

---

## Browser DevTools Checks

### Console Tab
- Should have no red errors (warnings are OK)
- Check for Supabase Realtime connection status

### Network Tab
- Check API responses (should be 200, 201, or appropriate status codes)
- Verify rate limiting (429 responses when hitting limits)
- Check image uploads (should see POST to Supabase Storage)

### Application Tab
- Check Cookies: `ray_locale`, Supabase auth cookies
- Check Local Storage: `ray_sell_draft`
- Check Service Worker: Should be registered and active
- Check Cache Storage: Should see `ray-images`, `ray-fonts`, `ray-static`, `ray-pages`

### Lighthouse Tab (Chrome only)
- Run audit on listing detail page
- Target scores: Performance > 80, Accessibility > 90, Best Practices > 90, SEO > 90

---

## Mobile Testing (iOS Safari & Android Chrome)

- [ ] Install PWA (Add to Home Screen)
- [ ] Test touch gestures (swipe gallery, scroll)
- [ ] Test virtual keyboard behavior (doesn't break layout)
- [ ] Test camera access (upload photo from camera)
- [ ] Test location permission (geolocation API)
- [ ] Test offline mode (airplane mode, then browse cached pages)
- [ ] Test deep links (share listing URL, open in installed PWA)

---

## Notes

- **Prisma Client**: Already regenerated (`npm run prisma:generate` completed successfully)
- **Offer Fields**: `offerAmount` and `offerStatus` are now in the generated Prisma types
- **MVP Scope**: Ignoring payments, ratings/reviews, premium memberships, analytics as per instructions
- **All core features verified**: Authentication, listings, search, favorites, chat, reporting, moderation

---

## Sign-off

- [ ] All critical items (1-6) tested and working
- [ ] No blocking bugs found
- [ ] Performance is acceptable (< 3s page load on 3G)
- [ ] Security checks passed
- [ ] Ready for production launch

**Tested by:** _______________  
**Date:** _______________  
**Environment:** Production / Staging  
**Domain:** _______________
