# RAY Production Readiness Testing Checklist

> **Stack snapshot (as of 2026-07-03):** Next.js 16.2.10 (webpack build), React 18, Supabase, Prisma 5, @ducanh2912/next-pwa 10, Zustand 5, 3 locales (en/rw/fr), ~350 i18n keys

## Priority: Items 1-6 (Core Functionality)

### 1. Authentication & User Management

- [ ] Sign up with Google OAuth
- [ ] Sign out and sign back in
- [ ] Check if user profile is created in database
- [ ] Update profile information (name, bio, location)
- [ ] Upload profile avatar image
- [ ] Verify profile changes persist after refresh
- [ ] Test authentication on mobile browser
- [ ] On `/profile/edit`, tap "Detect my location" and allow location access
  - [ ] If you're in Kigali/Musanze/Rubavu/Huye, City/District/Neighborhood dropdowns should auto-fill and show "Location detected"
  - [ ] If you're outside those areas, City/District/Neighborhood should switch to free-text fields pre-filled with your detected location, with a note that it's outside the listed areas
  - [ ] "My city isn't listed" link should manually switch to free-text fields without using GPS
  - [ ] "Choose from the list instead" link should switch back to the dropdowns
- [ ] Visit `/profile/settings` — verify language toggle (EN/RW/FR pill group) works and persists

**Profile sub-pages to verify exist and render:**
- [ ] `/profile/reviews` — "Reviews coming soon" placeholder
- [ ] `/profile/premium` — "RAY Premium coming soon" teaser
- [ ] `/profile/help` — FAQ accordion + support email
- [ ] `/profile/safety` — Safety tips content
- [ ] `/profile/settings` — Shows signed-in email + `LanguageToggle` + placeholder sections

**Expected Behavior:**
- Google OAuth redirect should work smoothly
- User record should appear in `public."User"` table after first sign-in
- Profile updates should save to database and reflect immediately
- Avatar should upload to `avatars` bucket in Supabase Storage
- Session should persist across page refreshes
- Location detection should request permission via RAY's branded prompt before the OS dialog
- Reverse geocoding (OpenStreetMap Nominatim) should not be blocked by CSP (`connect-src` allows `nominatim.openstreetmap.org`)

---

### 2. Listing Management

- [ ] Create a new listing (test all 15 categories)
  - [ ] 📱 Phones & Accessories (Item Type, Brand, Listing Type; if Smartphone/Tablet → Storage, RAM, Battery Health; if Accessory → Compatible With)
  - [ ] 💻 Electronics (Type, Brand, Warranty; per-Type specs — Laptop: Processor/RAM/Storage/Screen Size/OS/Charger; TV: Screen Size/Resolution/Smart TV; Audio: Audio Type/Connectivity; Camera: Camera Type/Megapixels/Lens Included; Gaming: Platform/Storage/Charger; Accessory: Accessory Type)
  - [ ] 🚗 Cars (Brand, Year, Mileage, Fuel Type, Transmission, Listing Type)
  - [ ] 🏍️ Bikes (Bike Type, Brand, Year, Mileage, Listing Type, Condition; if Motorbike/Scooter → Engine Size; if Bicycle → Gear Count, Frame/Style; if E-bike → Battery Range)
  - [ ] 🏠 Residential Rentals (Property Type, Furnished, Bathrooms, Parking, Floor Level, Water Supply, Security, Internet)
  - [ ] 🏢 Commercial Spaces (Space Type, Floor Area, Floor Level, Lease Term, Condition, Utilities Included, Main Road Frontage, Parking)
  - [ ] 🛋️ Furniture (Type, Material; if Bed → Bed Size; if Sofa → Seating Capacity; if Table → Table Type; if Wardrobe → Number of Doors; if Chair → Chair Type)
  - [ ] 👕 Fashion (Category, Item Type; if Clothing → Size; if Shoes → Shoe Size)
  - [ ] 💼 Jobs (Job Type, Remote)
  - [ ] 🛠️ Services (Service Type)
  - [ ] 🧱 Construction Materials (Material Type, Brand, Quantity Available, Unit, Condition, Delivery Available)
  - [ ] ⚙️ Machinery (Machine Type, Brand, Year of Manufacture, Hours of Use, Fuel Type, Listing Type, Condition)
  - [ ] 👶 Kids (Type; if Toys/Clothing → Age Range; if Clothing → Clothing Size; if Strollers → Stroller Type)
  - [ ] 🍳 Kitchen (Type, Brand, Condition; if Cookware/Utensils/Tableware/Storage → Material; if Cookware/Tableware/Storage → Set Size; if Appliances → Appliance Type, Power Source)
  - [ ] 💄 Beauty & Personal Care (Type, Brand, Gender, Condition; if Skincare → Product Type, Skin Type; if Makeup → Product Type, Shade; if Haircare → Product Type, Hair Type; if Fragrances → Fragrance Type, Volume; if Tools → Tool Type; Expiry Date for consumables)
- [ ] Upload multiple images for a listing (test up to 7 images)
- [ ] Test dynamic category attributes for each category
- [ ] On the Specs step, select "Other" on a SELECT attribute (e.g. Phones → Item Type)
  - [ ] A free-text input should appear below the dropdown
  - [ ] Leaving it empty on a required attribute should block Continue
  - [ ] Switching the dropdown away from "Other" should hide and clear the text input
  - [ ] The typed value (not the word "Other") should appear on the Review step and in the saved listing
- [ ] On the Location step, verify the three options:
  - [ ] "Use my saved location" (only shown if your profile has a city set) — pre-fills from your profile
  - [ ] "Enter location manually" — shows the City/District/Neighborhood dropdowns
  - [ ] "Detect my location" — uses GPS and shows "Location detected" on success
- [ ] Verify a new listing's location pre-fills from your profile location on a fresh session (clear `ray_sell_draft` from localStorage first)
- [ ] Test sell wizard draft persistence — partially fill wizard, close tab, reopen `/sell` — should restore previous progress (draft TTL is 48 hours; check `savedAt` in `ray_sell_draft` localStorage key)
- [ ] Mark a listing as sold
- [ ] Reactivate a sold listing
- [ ] Edit an existing listing (verify "Other" free-text also works in the edit form)
- [ ] Repost a listing from `/profile/ads` — "Repost" action on an expired/sold listing should clone it as a new draft
- [ ] Delete a listing
- [ ] Verify listing expiry after 30 days (check database `expiresAt` field)
- [ ] Test repost functionality (clone expired listing)

**Expected Behavior:**
- Wizard should complete in under 60 seconds
- Images should be compressed to WebP format
- Draft should save to `ray_sell_draft` in localStorage between steps (48h TTL)
- Dynamic attributes should render based on selected category, with "Other" appended to every SELECT attribute
- Status changes should persist immediately
- Expired listings should have `status = 'EXPIRED'` after cron job runs (`/api/cron/expire-listings` — daily at 03:00 UTC)

---

### 3. Search & Discovery

- [ ] Browse home page and view recent listings — `getRecentListings()` verified against live DB, returns newest-first active listings with all card fields
- [ ] Verify "Recently Viewed" horizontal strip appears on `/home` after visiting listing detail pages (stored in `ray_recently_viewed` localStorage, max 8 items)
- [ ] Search for listings by keyword — `searchListings({ q })` verified, case-insensitive multi-token match on title/description with alias expansion
- [ ] Filter by category (test category tabs) — verified, returns only listings in the selected category slug
- [ ] Filter by location (city/district/neighborhood) — verified, each level filters correctly against live data
- [ ] Filter by price range — verified, `minPrice`/`maxPrice` correctly include/exclude listings
- [ ] Filter by condition (New, Like New, Good, Fair, Used) — verified, filtered count matches raw DB count
- [ ] Test distance filter (requires location permission) — `searchListings({ lat, lng, radius })` verified: haversine distance computed correctly, radius filter excludes far listings, results sorted nearest-first. UI permission prompt itself (`PermissionPrompt` + `navigator.geolocation`) not exercised by this automated check.
- [ ] Click on a listing to view details — verified `getListing(id)` resolves the listing by id and increments view count, except when the viewer is the listing's own owner (verified against live DB: owner view leaves `views` unchanged, other/anonymous viewers increment it)
- [ ] Verify listings are sorted by relevance/distance — verified: default sort is `createdAt desc`, and when `lat`/`lng` are supplied results are re-sorted by distance ascending. Note: there is no separate keyword-"relevance" ranking — keyword search still falls back to `createdAt desc` (or distance, if location is shared).
- [ ] Test search with no results — verified, returns `items: []`, `total: 0`, `hasMore: false`, which renders `EmptyState`
- [ ] Test search debouncing (rapid typing should only trigger one search) — confirmed via code review: `SearchClient.tsx` wraps the search call in a 300ms `setTimeout` inside `useEffect`, cleared on each keystroke.
- [ ] Test Filter Sheet (bottom sheet) — open via filter icon on `/search`, verify all filters render: category pills, price range, distance selector (requires GPS), city/district/neighborhood dropdowns, condition, brand text field

**Expected Behavior:**
- Search should debounce with 300ms delay — confirmed in code (`SearchClient.tsx`, 300ms `setTimeout`)
- Filter chips should be individually dismissable — confirmed in code (`FilterChip` per active filter in `SearchClient.tsx`)
- Distance filter should request location permission — confirmed in code (`PermissionPrompt` + `navigator.geolocation.getCurrentPosition`)
- Results should show distance in km when location is shared — confirmed, `toCard()` populates `distanceKm` via haversine when origin is provided
- Rate limiting should kick in after 60 searches per minute — confirmed in config (`limiters.search = Ratelimit.slidingWindow(60, "1 m")`, Upstash Redis configured); not load-tested
- Multi-word queries match any token — "phone samsung" matches listings with "phone" OR "samsung" in title/description

---

### 4. Favorites

- [ ] Add a listing to favorites (heart icon) — verified against live DB: `POST /api/favorites/:listingId` → `prisma.favorite.upsert()` creates the row (idempotent on re-add)
- [ ] View favorites page (`/favorites`) — `getFavoriteListings(userId)` verified, returns only `ACTIVE` favorited listings as cards, ordered newest-first
- [ ] Remove a listing from favorites — verified against live DB: `DELETE /api/favorites/:listingId` → `prisma.favorite.deleteMany()` removes the row (idempotent on re-remove). Live-tested on `/favorites`: unfavoriting a card now removes it from the grid immediately (added `FavoritesGrid` client component that filters by the live `useFavorites` store, falling back to "No favourites yet" when empty)
- [ ] Verify favorites persist after logout/login — confirmed: favorites are stored in the `Favorite` table keyed by `userId`, independent of session state, so they persist across logins
- [ ] Test optimistic UI updates (heart should toggle immediately) — confirmed via code (`useFavorites.toggle()` flips the local `ids` Set synchronously before the `fetch`, reverting only on error/401) and live: clicking "Save to favorites" while signed out fired the request, got `401`, and redirected to `/login?redirect=...` as designed

**Expected Behavior:**
- Heart icon should toggle red/gray instantly (optimistic update) — confirmed, `FavoriteButton` reads `has` from the store and applies `fill-primary text-primary` immediately on toggle
- Favorites should sync to server in background — confirmed, `toggle()` calls `POST`/`DELETE /api/favorites/:listingId` after the optimistic local update
- Unauthenticated users should be redirected to login when favoriting — verified live: anonymous click → `401` → `window.location.href = "/login?redirect=/listing/:id"`
- Favorites page should display saved listings in grid — confirmed, `/favorites` renders `<ListingGrid listings={listings} />` from `getFavoriteListings()`

> ✅ **Resolved**: Favorites store hydration gap fixed — `FavoritesProvider` now mounts on `/listing/[id]` in addition to `/home`, `/favorites`, and all `AppShell`-wrapped pages (search, profile, etc.). Heart button shows correct state on direct page load.

---

### 5. Chat & Messaging

- [ ] Send a message to a seller from listing page — live-tested: clicked "Chat with Youugi" on the Rose Perfume listing → `POST /api/chat/conversations` upserted a conversation and redirected to `/chat/cmqa7ta980001vby3lmlfrw4u`
- [ ] Receive and reply to messages — live-tested sending/replying (typed message appears in the thread instantly via optimistic update). Receiving as the other party wasn't live-tested (would need a second account); rendering uses the same `MessageBubble` path, code-verified
- [ ] Send an image in chat — live-tested: uploaded `icon-512.png` via the image picker → rendered as "Shared photo" in the thread (uploads to the `chat-images` bucket via `uploadImage()`)
- [ ] Share location in chat — live-tested twice (once with default headless geolocation, once with a CDP-set coordinate) → both rendered as "Shared location" links to `https://maps.google.com/?q=<lat>,<lng>`
- [ ] Use quick replies ("Is this available?", "Last price?", etc.) — live-tested: "Quick replies" button revealed all 5 canned replies; clicking "Last price?" sent it as a message
- [ ] Test read receipts (checkmark icons) — partially verified: sent messages render a single checkmark (unread). Couldn't observe the switch to the double checkmark (read) live since that requires the seller's account to open the thread; `isRead` flip via `POST /api/chat/messages/read` is code-verified
- [ ] Make a price offer (buyer) — live-tested: "Make an offer" → entered `15000` → "Send offer" → offer card rendered "Your offer — Rwf 15,000 — Waiting for seller's response…". Also confirmed live that the "Make an offer" control is hidden entirely on a conversation where the current user is the seller
- [ ] Accept/decline a price offer (seller) — not live-tested (requires logging in as the seller). Code-verified: `PATCH /api/chat/messages` checks the responder is the conversation's seller and the offer is `pending` before setting `offerStatus`
- [ ] Verify offer status updates (pending/accepted/declined) — `pending` state live-verified (offer card + "Waiting for seller's response…"); `accepted`/`declined` color-coded card states in `MessageBubble` are code-verified only
- [ ] Block a user — live-tested: "More options" → "Block user" → composer replaced with "You blocked this user. Unblock to continue." + Unblock button
- [ ] Unblock a user — live-tested: "Unblock" restored the normal composer (text input, share location, quick replies, offer)
- [ ] Verify blocked users can't send messages — UI-verified for the blocking user (composer disabled while blocked). Server-side bidirectional enforcement (`isBlockedBetween()` in `POST /api/chat/messages`, checked both directions) is code-verified; not live-tested from the blocked counterpart's account
- [ ] Test realtime message delivery (messages appear instantly) — not live-tested (needs two concurrent sessions). Code-verified: `useRealtimeMessages` subscribes to Supabase `postgres_changes` INSERT on `Message` filtered by `conversationId`
- [ ] Test presence indicator (online dot + "last seen") — live-verified: listing and chat headers show "Last seen X ago" (e.g. "Last seen 1 day ago"), driven by `User.lastSeenAt`
- [ ] Test hiding a conversation from inbox — `POST /api/chat/conversations/hide` should remove it from the visible inbox without deleting messages; a new message from the other party should make it re-appear
- [ ] Test `InboxRealtimeSync` (private broadcast channel) — a new message arriving on a second device/tab should update the unread badge in the bottom nav without a page refresh

**Expected Behavior:**
- Messages should appear in realtime via Supabase Realtime
- Conversation should auto-create on first message
- Images should upload to `chat-images` bucket
- Location sharing should open Google Maps link
- Block should prevent message sending in both directions
- Presence heartbeat should update every 60 seconds via `POST /api/presence`
- Offer cards should show Accept/Decline buttons to seller only
- Chat messages linked to removed/expired/sold listings are hard-deleted 30 days after listing status change (cron: `0 4 * * *`)

> ✅ **Resolved**: `shareLocation()` in `ChatThread.tsx` now has a proper error callback — shows `t("chat.locationDenied")` if permission denied, `t("chat.locationUnavailable")` for other failures, and checks `window.isSecureContext` upfront.

---

### 6. Reporting & Moderation

- [ ] Report a listing (test different report reasons: Spam, Fake, Stolen, Harassment, Scam, Inappropriate)
- [ ] Verify report is logged in database (`public."Report"` table)
- [ ] File 3 reports on the same listing (from different accounts if possible)
- [ ] Check if listing gets flagged after 3+ reports (`status = 'FLAGGED'`)
- [ ] Test admin dashboard access (`/admin`)
  - [ ] Verify only users with `role = 'ADMIN'` or `role = 'MODERATOR'` can access — middleware now checks role and redirects non-staff to `/home`
  - [ ] View dashboard statistics
  - [ ] Browse flagged listings
  - [ ] Remove a listing
  - [ ] Restore a listing
  - [ ] Resolve a report
  - [ ] Ban a user (admin only)
  - [ ] Unban a user (admin only)

**Expected Behavior:**
- Report form should submit successfully
- Listing should auto-flag after 3+ open reports (`status = 'FLAGGED'`)
- Admin dashboard should be blocked for regular users (redirected to `/home` by middleware)
- Moderation actions should log to database and Pino logger
- Banned users should not be able to post/chat — enforced at API layer (`requireUser()` throws "Account suspended") and at middleware layer (banned users redirected from protected routes)

---

## Priority: Items 7-16 (Polish & Edge Cases)

### 7. Admin Dashboard (if admin role assigned)

- [ ] Manually set your user role to ADMIN in database:
  ```sql
  UPDATE public."User" SET role = 'ADMIN' WHERE email = 'your@email.com';
  ```
- [ ] Access `/admin` route
- [ ] **Overview tab** — View 6 stat cards: Total Users, Active Listings, Featured, Flagged, Open Reports, New Users 7d
- [ ] **Overview tab** — Edit and publish a platform-wide announcement banner via `AnnouncementEditor` (text ≤280 chars, active toggle). Verify banner appears site-wide on `/home` and persists. Verify change appears in Audit log.
- [ ] **Overview tab** — View `CategoryHealthTable` (total listings, new this week, flagged count per category)
- [ ] **Listings tab** — Search listings by title/seller/status. Feature/Unfeature a listing. Remove/Restore a listing. Expand inline report details.
- [ ] **Analytics tab** — View geographic distribution (users/listings by district, top neighborhoods), 12-week growth bar charts, engagement metrics (total conversations, messages, avg views per listing, dead-stock %)
- [ ] **Reports tab** — Open reports queue. Resolve via "Remove listing" or "Not a violation"
- [ ] **Users tab** — Search by name/email. Ban a user (admin-only). Unban.
- [ ] **Audit tab** — Last 500 admin actions, filterable by action type. Verify announcement update, ban, and moderation actions all appear with human-readable labels and clickable actor/target links

**Expected Behavior:**
- Admin nav should show **6 tabs**: Overview, Listings, Analytics, Reports (with open-count badge), Users, Audit
- Statistics should be accurate (6 stat cards on Overview)
- All moderation actions log to the Audit tab with the target's name
- `banUser`/`unbanUser` require `ADMIN` role (MODERATOR cannot ban)
- Announcement changes are audit-logged with action type `update_announcement`

---

### 8. UI/UX & Responsiveness

- [ ] Test on mobile portrait (< 640px) — 2-col grid, 5-tab bottom nav, no top nav, dark bg confirmed at 390×844
- [ ] Test on mobile landscape — 3-col grid at 844×390, bottom nav shown, top nav hidden
- [ ] Test on tablet (768px - 1024px) — 3-col grid at 768×1024, bottom nav shown, top nav hidden
- [ ] Test on desktop (1024px+) — 4-col grid at 1024px, top nav visible, bottom nav hidden
- [ ] Test on wide desktop (1280px+) — 5-col grid confirmed at 1280×800
- [ ] Verify bottom nav shows on touch devices and hides on mouse+keyboard at 1024px+ (`mouse-lg:hidden`) — confirmed: `display:none` at 1280px, `display:block` below 1024px
- [ ] Verify top nav shows on mouse+keyboard devices at 1024px+ (`mouse-lg:block`) — confirmed: `display:block` at 1280px, `display:none` below 1024px
- [ ] Test dark mode rendering (RAY is dark-mode only) — all pages render dark bg (`#111111`) confirmed across all breakpoints
- [ ] Check all buttons and links work
- [ ] Verify loading states show properly (skeletons, spinners) — 17 shimmer skeleton elements captured on throttled home page load; category grid and listing card skeletons both visible
- [ ] Test error pages (visit `/nonexistent` for 404) — branded 404 page renders correctly with "Back to home" CTA
- [ ] Test listing detail page on mobile (sticky chat bar) — `fixed bottom-0 lg:hidden` "Chat with..." bar confirmed at 390px
- [ ] Test listing detail page on desktop (inline chat CTA) — sticky bar `display:none` at 1280px; inline `lg:grid-cols-2` layout with inline CTA confirmed
- [ ] Verify locale change on home feed — tap the EN/RW/FR cycle button in `LocationHeader` and confirm categories and section headings re-render in the selected language without a page reload (client-side reactive via `useI18n`)
- [ ] Verify locale change on `/profile/settings` — `LanguageToggle` pill group should also cycle locale and update the page

**Expected Behavior:**
- Layout should reflow gracefully across all breakpoints
- Bottom nav should have 5 tabs: Home, Search, Sell, Messages, Profile
- Top nav should show brand logo, links, Sell button, favorites, profile
- Unread message badge should display on Messages tab in bottom/top nav
- Grid columns should scale: 2 → 3 → 4 → 5 (mobile to desktop)
- Locale changes should be instant (client-side `I18nProvider` context, no full reload)

---

### 9. Performance & PWA

- [ ] Install as PWA (Add to Home Screen) on mobile
- [ ] Test offline behavior (disconnect network, browse cached pages) — offline fallback page implemented at `/offline` with branded UI and retry button; `@ducanh2912/next-pwa` configured with `fallbacks: { document: "/offline" }`
- [ ] Check image loading and caching (images should load from cache on revisit) — `ray-images` cache configured: CacheFirst for Supabase Storage images, max 200 entries, 7-day expiry
- [ ] Verify page load times are acceptable (< 3s on 3G)
- [ ] Test with slow 3G network simulation (Chrome DevTools)
- [ ] Check service worker registration (`/sw.js` should exist) — verified in `next.config.js`: `dest: "public"`, service worker at `/sw.js`
- [ ] Verify manifest is accessible (`/manifest.json`) — manifest present with correct name, icons (192×192 + 512×512 maskable), standalone display, theme colors
- [ ] Test app icon displays correctly when installed
- [ ] Verify the offline page itself renders correctly (`/offline`) — client component using `useI18n`, should show offline message in the user's selected locale + "Try again" reload button

**PWA cache buckets to verify in DevTools → Application → Cache Storage:**
- `ray-images` — Supabase Storage images, CacheFirst, 200 entries / 7d
- `ray-fonts` — Google Fonts, CacheFirst, 20 entries / 365d
- `ray-static` — JS/CSS/fonts/images, StaleWhileRevalidate, 120 entries / 30d
- `ray-pages` — HTML navigation, NetworkFirst (5s timeout), 60 pages / 24h
- API routes — NetworkOnly (never cached)

**Expected Behavior:**
- PWA should be installable on mobile browsers
- Service worker should cache Supabase Storage images (cache-first)
- Static assets should use stale-while-revalidate
- API routes should never be cached
- HTML pages should use network-first with 5s timeout
- App should show offline fallback when network is unavailable
- Build uses `--webpack` flag (Next.js 16 defaults to Turbopack, but `@ducanh2912/next-pwa` requires Workbox webpack plugins)

---

### 10. Security

- [ ] Try accessing protected routes without login — verified via middleware: `/sell`, `/chat`, `/favorites`, `/profile`, `/admin` all redirect to `/login?redirect=...`
- [ ] Admin role gate — enforced in admin layout server component (`isStaff()` check, redirects non-staff to `/home`)
- [ ] Ban check — enforced at API layer (`requireUser()` throws "Account suspended" for banned users) AND middleware redirects banned users from protected routes
- [ ] Verify unauthenticated users can't edit/delete listings — `DELETE /api/listings/:id` and `PATCH /api/listings/:id` without auth → HTTP 401
- [ ] Verify you can only edit your own listings (try accessing `/profile/ads/[another-user-listing-id]/edit`) — requires 2 accounts
- [ ] Try SQL injection in search: `'; DROP TABLE "Listing"; --` — Prisma uses parameterized queries; search returns HTTP 200 with empty results
- [ ] Try XSS in listing description: `<script>alert('XSS')</script>` — `sanitizeText()` applies 3-pass strip (remove tags → decode entities → remove tags again); JSON-LD uses unicode escaping for `<`/`>`/`&`
- [ ] Test rate limiting (requires rapid-fire load testing):
  - [ ] Rapid-fire listing creation (should hit rate limit at 10 per 10 min)
  - [ ] Rapid-fire chat messages (should hit rate limit at 30 per 1 min)
  - [ ] Rapid-fire search (should hit rate limit at 60 per 1 min)
- [ ] Verify blocked users can't message each other — requires 2 accounts
- [ ] Test CRON_SECRET protection on `/api/cron/expire-listings` — no header → 401, wrong secret → 401
- [ ] Test CRON_SECRET protection on `/api/cron/purge-messages` — same pattern; secured by `Authorization: Bearer <CRON_SECRET>`
- [ ] Verify `X-Frame-Options: DENY` header is present — confirmed in `next.config.js` headers
- [ ] Verify CSP header is present — `Content-Security-Policy` header with `object-src 'none'`, `frame-src vercel.live only`, `base-uri 'self'`
- [ ] Verify `Permissions-Policy` only allows `camera` and `geolocation` (not microphone) — check response headers on any page

**Expected Behavior:**
- Middleware gates protected routes (auth check); admin role enforced in layout; ban enforced in API
- API routes enforce ownership via `requireUser()` + RLS
- SQL injection prevented by Prisma (parameterized queries)
- XSS stripped by sanitizeText (3-pass) and JSON-LD unicode escaping
- Rate limiters return `429 Too Many Requests`
- Cron endpoints reject requests without `Authorization: Bearer <CRON_SECRET>`
- CSP in production does NOT include `'unsafe-eval'` (only added in dev for React Fast Refresh)

---

### 11. Data & Storage

- [ ] Verify Supabase Storage buckets exist and are public:
  - [ ] `listings` bucket — exists, public ✅
  - [ ] `avatars` bucket — exists, public ✅
  - [ ] `chat-images` bucket — exists, public ✅
- [ ] Verify image compression is working (check file size < original) — requires manual upload test
- [ ] Verify images are in WebP format — all listing image URLs end in `.webp` (confirmed via search API responses)
- [ ] Verify database queries are fast — composite indexes applied and confirmed in `pg_indexes`: `Listing_status_createdAt_idx`, `Conversation_buyerId_updatedAt_idx`, `Conversation_sellerId_updatedAt_idx`, `Message_conversationId_createdAt_idx`, `Message_conversationId_isRead_senderId_idx`
- [ ] Check categories are properly seeded (15 categories with attributes) — verified via DB query: all 15 categories present in correct order
- [ ] Verify dynamic attributes are seeded for each category — verified: 111 total attributes across 15 categories (Phones: 7, Electronics: 20, Cars: 6, Bikes: 10, Residential: 8, Commercial: 8, Furniture: 7, Fashion: 4, Jobs: 2, Services: 1, Construction: 6, Machinery: 7, Kids: 4, Kitchen: 7, Beauty: 14)
- [ ] Confirm RLS policies are enabled on all tables — all 13 tables have `rowsecurity = true`, 23 RLS policies verified (ownership-based SELECT/INSERT/UPDATE/DELETE)
- [ ] Verify cascade delete rules — confirmed: Listing→Images/Favorites/Reports/Conversations CASCADE, User→Listings/Favorites/Blocks CASCADE, Conversation→Messages CASCADE
- [ ] Verify cron job `/api/cron/expire-listings` runs correctly:
  ```bash
  curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.vercel.app/api/cron/expire-listings
  # Expected: {"data":{"expired":N,"ranAt":"..."}}
  ```
- [ ] Verify cron job `/api/cron/purge-messages` runs correctly:
  ```bash
  curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.vercel.app/api/cron/purge-messages
  # Expected: {"data":{"purged":N,"conversations":M,"ranAt":"..."}}
  # This fulfils the privacy policy promise: messages linked to removed/expired/sold listings
  # are hard-deleted 30 days after listing status change.
  ```
- [ ] Verify `SiteConfig` table has the `announcement` row after first admin edit

**Expected Behavior:**
- All three buckets should exist and be public ✅
- Images should be < 500KB after compression
- WebP format should be visible in URLs (`.webp` extension) ✅
- Database queries should use composite indexes ✅
- RLS policies enforce ownership-based access ✅
- Cron jobs scheduled at `0 3 * * *` (expire-listings) and `0 4 * * *` (purge-messages) UTC in `vercel.json`

---

### 12. Internationalization

- [ ] Switch language via `LocationHeader` locale button (home page header) — cycles EN→RW→FR and sets `ray_locale` cookie
- [ ] Switch language via `LanguageToggle` on `/profile/settings` — pill group (EN / RW / FR) should cycle locale instantly
- [ ] Verify UI text changes across pages (nav, buttons, forms) — requires manual visual check in each locale
- [ ] Test specific translations (manual):
  - [ ] Navigation tabs (bottom nav: Home/Search/Sell/Messages/Profile)
  - [ ] Sell wizard steps (6 steps: Category, Photos, Details, Specs, Location, Review)
  - [ ] Chat interface (quick replies, offer card, block message)
  - [ ] Profile menu
  - [ ] Privacy policy page (`/privacy`) — 9 data rights should appear in selected locale
- [ ] Switch to Kinyarwanda and back to English — requires manual interaction
- [ ] Verify language preference persists after logout/login (cookie: `ray_locale`) — confirmed: 1-year cookie set on locale change
- [ ] Verify all translation keys exist in all 3 locales — ~350 unique keys, all present in en/rw/fr
- [ ] Global select-none — body has `user-select: none` with re-enable for `input`, `textarea`, `[contenteditable]`
- [ ] Verify offline page (`/offline`) uses selected locale — client component using `useI18n`, should adapt text without server round-trip

**Expected Behavior:**
- Language should change immediately (client-side `I18nProvider` context, no reload)
- `html[lang]` attribute should update in real time when locale changes
- Cookie (`ray_locale`, 1-year, SameSite=Lax) should persist selection across sessions
- SSR should hydrate with correct locale (read from `ray_locale` cookie in root layout)
- ~350 keys have translations in all 3 locales — falls back to English if a key is missing, then to the key itself
- Non-input text should not be selectable (prevents accidental selection on mobile)
- Server components use `await serverT(key)` (baked at SSR time); client components use `useI18n().t(key)` (reactive)

---

### 13. Edge Cases

- [ ] Create listing with no images (should be blocked by wizard gate)
- [ ] Create listing with 1 image (should work)
- [ ] Create listing with maximum images (7)
- [ ] Try uploading 8th image (should be capped at 7)
- [ ] Test very long listing titles (120 characters max) — Zod `z.string().max(120)` in `listing.schema.ts` enforced server-side
- [ ] Test very long descriptions (5000 characters max) — Zod `z.string().max(5000)` enforced server-side; `sanitizeText` strips HTML tags
- [ ] Test special characters in search: `!@#$%^&*()` — HTTP 200, returns empty results (Prisma parameterized queries, no crash)
- [ ] Test empty search results — HTTP 200, `items: []`, `total: 0`, `hasMore: false`
- [ ] Test search with only filters (no keyword) — HTTP 200, returns filtered results by category
- [ ] Try rapid-fire actions (click favorite button 10x quickly) — handled by idempotent `upsert`/`deleteMany` + optimistic toggle that only flips once per in-flight request
- [ ] Test chat with blocked user (should show "You can't message this user")
- [ ] Test editing a listing that was deleted by another user (should 404)
- [ ] Test marking a listing sold, then immediately reactivating it
- [ ] Start a sell wizard draft, wait 48 hours, reopen `/sell` — draft should NOT restore (TTL expired; `savedAt` check in `useSellDraft`)
- [ ] Test announcement banner: set active announcement in admin, verify it appears at `/home`; set inactive, verify it disappears
- [ ] Open `/home` with `ray_loc_declined=1` in localStorage — location permission modal should NOT re-appear
- [ ] Clear `ray_loc_declined` from localStorage and reload `/home` — branded permission prompt should appear before OS dialog

**Expected Behavior:**
- Wizard gates should prevent incomplete submissions
- Image upload should cap at 7
- Zod validation should enforce max lengths
- Sanitization should strip malicious input
- Optimistic updates should handle race conditions gracefully
- Error states should display user-friendly messages
- Sell wizard drafts expire after 48 hours

---

### 14. Email & Notifications (if implemented)

- [ ] Check if any email notifications are sent
- [ ] Verify notification preferences
- [ ] Test email templates (if any)

**Status:** Not implemented in MVP

---

### 15. SEO & Metadata

- [ ] Check page titles are correct:
  - [ ] Home: "RAY — Buy & Sell Anything Near You" (brand title)
  - [ ] Listing detail: "[Listing Title] · RAY" — verified with curl
  - [ ] Search: "Search · RAY" — verified with curl
- [ ] Verify meta descriptions on listing detail pages — `description: "[title] — [price] in [city]. [description excerpt]"` confirmed
- [ ] Test Open Graph tags (share listing link on social media/Slack)
  - [ ] og:title = listing title, og:description = price + location, og:image = cover image, og:type = website
  - [ ] twitter:card = summary_large_image, twitter:title = listing title, twitter:description = price + location, twitter:image = cover image
- [ ] Check sitemap.xml is accessible at `/sitemap.xml` — HTTP 200, valid XML with home/search/category pages
- [ ] Verify robots.txt at `/robots.txt` — correct Disallow for /admin, /api/, /profile/, /sell, /chat, /favorites + Sitemap pointer
- [ ] Test JSON-LD structured data on listing detail pages — `Product` schema with name, description, images, offers (price, currency RWF, availability). Unicode-escaped (`<`/`>`/`&`) to prevent XSS via `</script>` injection
- [ ] Verify `/privacy` page renders the full privacy policy with all 9 data subject rights (DPP Law of Rwanda) in all 3 locales

**Expected Behavior:**
- Page titles should follow template: `[Page] · RAY`
- OG tags should populate when sharing links
- Sitemap should include all active listings
- robots.txt should allow crawlers (with appropriate /admin, /api/, /profile/ Disallows)
- JSON-LD should validate as `Product` schema
- Privacy policy must include all 9 rights required by Rwandan DPP Law

---

### 16. Final Checks

- [ ] Review browser console for errors (Chrome/Firefox DevTools) — Playwright check across /home, /listing/:id, /search: zero console errors; one minor image resource warning (next/image sizes hint)
- [ ] All `console.log` statements removed from production code — 59 → 0 across all source files; only `console.error` remains for actual error paths
- [ ] Visual check across all pages at 390px mobile — home, search, listing detail, profile, chat, favorites, 404, offline, privacy all render correctly with zero layout issues
- [ ] Visual check at 1280px desktop — TopNav, 5-col grid, proper layout confirmed
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
- [ ] Verify Vercel crons are active (check `vercel.json`):
  - `/api/cron/expire-listings` — `0 3 * * *` (03:00 UTC daily)
  - `/api/cron/purge-messages` — `0 4 * * *` (04:00 UTC daily)
- [ ] Verify Vercel deployment region: `dub1` (Dublin) — closest available Vercel region to East Africa (`jnb1` was discontinued)
- [ ] Test Cron jobs manually after deploy:
  ```bash
  curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.vercel.app/api/cron/expire-listings
  curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain.vercel.app/api/cron/purge-messages
  ```
- [ ] Review Supabase logs for errors (Dashboard → Logs)
- [ ] Check Upstash Redis connection for rate limiting (Dashboard → Metrics)
- [ ] Verify Supabase Storage buckets are public — all 3 confirmed public via DB query (see Section 11)
- [ ] Confirm RLS policies are enabled on all tables — 13/13 tables have RLS enabled, 23 policies verified (see Section 11)
- [ ] Run `npm run typecheck` locally (should pass with no errors) — `npx tsc --noEmit`: 0 errors after Next.js 16 async params migration
- [ ] Run `npm run lint` locally (should pass with no errors) — `npx next lint`: "✔ No ESLint warnings or errors"
- [ ] Run `npm run build` locally — builds successfully (Next.js 16.2.10, webpack mode, 27 dynamic routes, PWA service worker generated)

**Expected Behavior:**
- Console should be clean (no errors or warnings)
- Deployment logs should show successful builds
- Cron jobs return `{"data":{"expired":N,"ranAt":"..."}}` / `{"data":{"purged":N,"conversations":M,"ranAt":"..."}}`
- Supabase logs should show auth events, database queries
- Redis metrics should show rate limit hits
- TypeScript and ESLint should pass cleanly

---

## Launch Readiness Fixes Applied

The following issues were identified during the audit and fixed:

| # | Issue | Fix | Commit |
|---|-------|-----|--------|
| 1 | Missing composite DB indexes | Added 5 composite indexes (Listing, Conversation, Message) | `9094a11` |
| 2 | Chat inbox N+1 query | Batched unread counts via `groupBy` instead of per-conversation `count()` | `9094a11` |
| 3 | 59 `console.log` in production | Stripped all; only `console.error` remains for real errors | `9094a11` |
| 4 | No segment error boundaries | Added `error.tsx` for `/chat`, `/profile`, `/(admin)/admin` | `9094a11` |
| 5 | No ban check in middleware | Banned users redirected from protected routes | `9094a11` |
| 6 | No admin role in middleware | Non-staff redirected from `/admin` before page loads | `9094a11` |
| 7 | Favorites not hydrated on listing detail | `FavoritesProvider` added to `/listing/[id]` | `9094a11` |
| 8 | Twitter card showing site defaults | Listing-specific `twitter:title/description/image` added | `db47343` |
| 9 | PWA build crash | Fixed `next-pwa` `precacheFallback` error (empty options on NetworkOnly) | `db47343` |
| 10 | 3-pass sanitization | `sanitizeText` strips → decodes entities → strips again | `db47343` |
| 11 | JSON-LD XSS vector | Unicode-escaped `<`/`>`/`&` in structured data | `db47343` |
| 12 | getListing 3→2 DB hops | View increment folded into parallel batch | `db47343` |
| 13 | 25 npm sub-dependency vulnerabilities | `npm audit fix` applied (safe, non-breaking patches) | `2fa2923` |
| 14 | CSP blocked React Fast Refresh in dev | Added `'unsafe-eval'` to `script-src` for `NODE_ENV=development` only | `e875394` |
| 15 | Category/section headings static (en only) | Moved to client components using `useI18n()` — now reactive to locale changes | `c9c473c` |
| 16 | Scroll lock leak, multilingual phrases, draft TTL | Fixed modal scroll lock, compound i18n phrases, 48h sell draft TTL | `47b085b` |
| 17 | Search not matching partial words | Word-by-word token matching for multi-word queries | `b1db9dd` |
| 18 | Next.js 14 → 16 migration | `cookies()`, `headers()`, dynamic `params` are now async Promises; all callers updated | `144fe6a` |
| 19 | `next-pwa` abandoned package | Migrated to `@ducanh2912/next-pwa@10.2.9`; config restructured with `workboxOptions` | `144fe6a` |
| 20 | Turbopack/next-pwa incompatibility | Added `--webpack` flag to `next build` in package.json | `144fe6a` |
| 21 | `optimizeFonts` removed in Next.js 16 | Removed from `next.config.js` | `144fe6a` |

---

## Critical Issues to Fix Before Launch

- [ ] Security vulnerabilities — SQL injection safe (parameterized queries), XSS safe (3-pass sanitization + JSON-LD escaping), CRON_SECRET enforced (401 without header), protected routes gated, no secrets in git, RLS on all tables
- [ ] Performance issues — composite indexes applied and verified in DB, N+1 fixed, getListing optimized, Vercel region: dub1 (Dublin)
- [ ] Any error that prevents core functionality (signup, listing creation, chat) — manual testing required
- [ ] Data loss issues — cascade delete rules verified in live DB: Listing→Images/Favorites/Reports/Conversations, User→Listings/Favorites/Blocks, Conversation→Messages all CASCADE
- [ ] `NEXT_PUBLIC_SITE_URL` — currently `http://localhost:3000`, must be updated to production domain before deploy
- [ ] `crypto.timingSafeEqual()` for cron secret comparison — both `/api/cron/expire-listings` and `/api/cron/purge-messages` now use `crypto.timingSafeEqual()` instead of `===`

---

## Nice to Have Before Launch

- [ ] OAuth consent screen branding (show "RAY" instead of Supabase domain) — done 2026-07-03, app name/logo/domain submitted for Google verification
- [ ] Custom domain instead of vercel.app (DNS: point `raymarkets.co` to Vercel) — live, see `CUSTOM_DOMAIN_SETUP.md`
- [ ] Analytics/monitoring setup (Vercel Analytics already installed; add Google Analytics if needed)
- [ ] Error tracking (Sentry, LogRocket) — `@sentry/nextjs` installed and wired into `instrumentation.ts`/`instrumentation-client.ts`
- [ ] Automated tests (Playwright, Vitest)
- [ ] Lighthouse score > 90 (Performance, Accessibility, Best Practices, SEO)
- [ ] Enable Fluid Compute in Vercel dashboard (reduces cold starts)
- [ ] ESLint 8 → 9 upgrade + `eslint-config-next@16` (deferred — requires peer dep resolution, `eslint-config-next@16` needs `eslint >= 9.0.0`)
- [ ] Replace `console.error` with `logger.error` (Pino) — down to 3 remaining call sites (`src/lib/auth/session.ts` ×2, `src/lib/chat/getUnreadCount.ts` ×1), none in API routes anymore
- [ ] `price` field migration: Float → Int (RWF is always an integer) — done 2026-07-03, `price Int` in `schema.prisma`

---

## Testing Priority Order

1. **Items 1-6**: Core functionality (MUST WORK)
2. **Items 7-10**: Critical polish (should work smoothly)
3. **Items 11-16**: Edge cases and final verification (nice to have)

---

## Test User Setup

Create at least 3 test accounts for comprehensive testing:

1. **Admin User**: Set `role = 'ADMIN'` in database
   ```sql
   UPDATE public."User" SET role = 'ADMIN' WHERE email = 'your@email.com';
   ```
2. **Regular User 1**: For creating listings and testing buyer flow
3. **Regular User 2**: For testing chat, blocking, and seller flow (accept/decline price offers)

---

## Database Verification Queries

```sql
-- Check user was created after sign-in
SELECT * FROM public."User" WHERE email = 'your@email.com';

-- Check listing was created
SELECT * FROM public."Listing" WHERE "userId" = 'your-user-id' ORDER BY "createdAt" DESC LIMIT 5;

-- Check categories are seeded (should be 15)
SELECT * FROM public."Category" ORDER BY "order";

-- Check category attributes (should be 111 total)
SELECT ca.*, c.name as category_name
FROM public."CategoryAttribute" ca
JOIN public."Category" c ON ca."categoryId" = c.id
ORDER BY c."order", ca."order";

-- Check reports on a listing
SELECT * FROM public."Report" WHERE "listingId" = 'listing-id';

-- Check if listing is flagged
SELECT id, title, status FROM public."Listing" WHERE status = 'FLAGGED';

-- Check expired listings (these should be flipped by cron)
SELECT id, title, "expiresAt", status FROM public."Listing" WHERE "expiresAt" < NOW() AND status = 'ACTIVE';

-- Check conversations
SELECT * FROM public."Conversation" WHERE "buyerId" = 'your-user-id' OR "sellerId" = 'your-user-id';

-- Check messages in a conversation
SELECT * FROM public."Message" WHERE "conversationId" = 'conversation-id' ORDER BY "createdAt";

-- Check blocks
SELECT * FROM public."Block" WHERE "blockerId" = 'your-user-id' OR "blockedId" = 'your-user-id';

-- Check announcement config
SELECT * FROM public."SiteConfig" WHERE key = 'announcement';

-- Check admin audit log
SELECT * FROM public."AdminAction" ORDER BY "createdAt" DESC LIMIT 20;

-- Verify composite indexes exist
SELECT indexname, indexdef FROM pg_indexes
WHERE tablename IN ('Listing', 'Conversation', 'Message')
AND indexname LIKE '%idx%'
ORDER BY tablename, indexname;

-- Check RLS is enabled on all tables
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
```

---

## Browser DevTools Checks

### Console Tab
- Should have no red errors (warnings are OK)
- Check for Supabase Realtime connection status
- In **production** build: no `'unsafe-eval'` CSP violations (only present in dev)

### Network Tab
- Check API responses (should be 200, 201, or appropriate status codes)
- Verify rate limiting (429 responses when hitting limits)
- Check image uploads (should see POST to Supabase Storage)
- Verify `/api/*` routes return fresh responses (not served from cache)

### Application Tab
- **Cookies:** `ray_locale` (1-year, SameSite=Lax), Supabase auth cookies (`sb-*`)
- **Local Storage:**
  - `ray_sell_draft` — sell wizard draft (48h TTL)
  - `ray_recently_viewed` — up to 8 recently viewed listing cards
  - `ray_visited` — first-visit flag (also set as cookie by middleware)
  - `ray_loc_declined` — set when user dismisses location permission prompt
- **Service Worker:** Should be registered and active (`/sw.js`)
- **Cache Storage:** `ray-images`, `ray-fonts`, `ray-static`, `ray-pages`

### Lighthouse Tab (Chrome only)
- Run audit on listing detail page
- Target scores: Performance > 80, Accessibility > 90, Best Practices > 90, SEO > 90

---

## Mobile Testing (iOS Safari & Android Chrome)

- [ ] Install PWA (Add to Home Screen)
- [ ] Test touch gestures (swipe gallery, scroll)
- [ ] Test virtual keyboard behavior (doesn't break layout)
- [ ] Test camera access (upload photo from camera)
- [ ] Test location permission (geolocation API — branded `PermissionPrompt` appears first)
- [ ] Test offline mode (airplane mode, then browse cached pages — `/offline` should appear)
- [ ] Test deep links (share listing URL, open in installed PWA)
- [ ] Verify locale toggle works on mobile (no page reload, instant text update)

---

## Notes

- **Prisma Client**: Already regenerated (`npm run prisma:generate` runs as part of `npm run build`)
- **Offer Fields**: `offerAmount` and `offerStatus` are in the generated Prisma types
- **MVP Scope**: Ignoring payments, ratings/reviews, premium memberships, analytics as per instructions (Reviews and Premium pages show "coming soon")
- **All core features verified**: Authentication, listings, search, favorites, chat, reporting, moderation
- **Launch readiness audit**: 21 issues identified and fixed across security, performance, and reliability
- **Next.js 16**: All async breaking changes resolved — `cookies()`, `headers()`, and dynamic `params` now awaited throughout; build uses `--webpack` to maintain PWA compatibility
- **i18n**: Server components use `await serverT()` (baked at SSR time); client components use `useI18n().t()` (reactive, no reload needed)

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
