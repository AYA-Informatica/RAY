# RAY — The Operating System for Local Commerce in East Africa

> **Buy & Sell Anything Near You** — Kigali-first hyperlocal classifieds platform.

---

## Monorepo Structure

```
ray/
├── ray-web/          # User-facing web app (React + Vite + TypeScript)
├── ray-admin/        # Internal admin dashboard (React + Vite + TypeScript)
└── README.md
```

The **React Native mobile app** follows the same architecture and shares all types, constants, and service patterns from `ray-web/src/`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Web Frontend | React 18 + Vite + TypeScript (strict) |
| Admin Dashboard | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS (dark-first, RAY palette) |
| State | Zustand + TanStack Query |
| Forms | React Hook Form + Zod |
| Auth | Firebase Phone Auth (OTP) |
| Database | MongoDB via Firebase Cloud Functions |
| Realtime | Firebase Firestore (chat) |
| Storage | Firebase Storage (images) |
| Push | Firebase Cloud Messaging |
| Charts | Recharts |
| Tables | TanStack Table v8 |
| Animations | Framer Motion |
| SEO | React Helmet Async + JSON-LD |
| Fonts | DM Sans + Syne (Google Fonts) |

---

## Quick Start

### 1. Clone & install

```bash
# Web app
cd ray-web
npm install

# Admin dashboard
cd ../ray-admin
npm install
```

### 2. Configure environment

```bash
# ray-web/
cp .env.example .env
# Fill in your Firebase project values

# ray-admin/
cp .env.example .env
# Same Firebase project, same values
```

### 3. Firebase setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Phone Authentication** (Auth → Sign-in methods)
3. Enable **Firestore Database** (start in production mode)
4. Enable **Storage** (or use Cloudinary - see below)
5. Enable **Cloud Messaging** (for push notifications)
6. Deploy Cloud Functions (see `/functions/` — to be added)
7. Set custom claims for admin users:

```javascript
// In Firebase Admin SDK (Cloud Function or script)
admin.auth().setCustomUserClaims(uid, { role: 'admin' })
```

**Alternative: Use Cloudinary for Image Storage** (Recommended)

Cloudinary offers better performance and automatic image optimization:
- 25GB free storage (vs Firebase's 5GB)
- Automatic WebP conversion (40% smaller images)
- On-the-fly image resizing
- No credit card required

See [CLOUDINARY_SETUP_GUIDE.md](./CLOUDINARY_SETUP_GUIDE.md) for setup instructions.

### 4. Run dev servers

```bash
# Web app → http://localhost:5173
cd ray-web && npm run dev

# Admin dashboard → http://localhost:5174
cd ray-admin && npm run dev
```

---

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#E8390E` | Brand orange-red, CTAs, prices |
| `primary-dark` | `#C42E08` | Hover/active states |
| `surface-card` | `#242424` | Listing cards, panels |
| `surface-modal` | `#2C2C2C` | Inputs, modals |
| `background` | `#111111` | Page background |
| `navy` | `#1B2B5E` | Premium banners |
| `success` | `#22C55E` | Verified badges, availability |
| `warning` | `#F59E0B` | Pending states, fast reply |
| `danger` | `#EF4444` | Errors, scam alerts |
| `text-primary` | `#FFFFFF` | Main body text |
| `text-secondary` | `#A0A0A0` | Labels, captions |

---

## Project Architecture

### `ray-web/src/`

```
components/
  atoms/         Button, Input, Badge, Avatar, Skeleton
  molecules/     ListingCard, FilterChip, UserRow, ChatBubble
  organisms/     Navbar, CategoryNav, ListingGrid
  Layout.tsx     Sticky nav + footer + mobile tab bar
  ProtectedRoute.tsx

pages/
  HomePage.tsx           Categories + 3 listing sections
  SearchResultsPage.tsx  Sidebar filters + sortable grid
  ListingDetailPage.tsx  Image gallery + seller card + chat CTA
  PostAdPage.tsx         6-step posting flow (<60s target)
  AuthPage.tsx           Phone OTP login
  ChatPages.tsx          ChatList + ChatDetail (real-time)
  AccountPage.tsx        Profile + stats + menu
  SellerProfilePage.tsx  Public seller view
  CategoryPage.tsx       Browse by category
  misc.tsx               NotFoundPage + ProfileSetupPage

hooks/
  useListings.ts   useHomeListings, useSearch, useListing, useSimilarListings
  useAuth.ts       Firebase auth state
  useChat.ts       useConversations, useChatMessages (Firestore real-time)

store/
  authStore.ts     User auth + OTP flow
  listingsStore.ts Search filters + results + home sections

services/
  firebase.ts      App, Auth, Firestore, Storage, FCM
  api.ts           All MongoDB endpoints via Cloud Functions

constants/
  categories.ts    8 categories + subcategories
  locations.ts     All Kigali neighborhoods by district
  strings.ts       All UI text (i18n-ready: EN/KIN/FR)

types/
  index.ts         User, Listing, Chat, Search, Notification types
```

### `ray-admin/src/`

```
pages/
  AdminLoginPage.tsx     Email + password login (role-checked)
  DashboardPage.tsx      Stats + Area/Bar/Pie charts (Recharts)
  AdminListingsPage.tsx  Full CRUD table (TanStack Table)
  AdminUsersPage.tsx     User management + ban/verify
  AdminReportsPage.tsx   Moderation queue + action workflow
  AdminAnalyticsPage.tsx Revenue charts + platform health

guards/
  AdminGuard.tsx   Firebase custom claims role check

components/
  organisms/AdminLayout.tsx  Sidebar + PageHeader
  atoms/index.tsx            Shared UI atoms
```

---

## Screens Built

### Web App
- ✅ Home — categories + 3 feed sections + premium banner
- ✅ Search results — filters sidebar + sort + pagination
- ✅ Listing detail — gallery + sticky seller card + chat CTA + JSON-LD SEO
- ✅ Post Ad — 6-step flow with photo upload + featured upsell
- ✅ Auth — phone OTP (Firebase Phone Auth)
- ✅ Profile setup — new user onboarding
- ✅ Chat list — real-time conversations
- ✅ Chat detail — real-time messages + quick replies + safety banner
- ✅ Account — stats + menu + my listings tabs
- ✅ Seller profile — public view + ratings + listings grid
- ✅ Category browse — subcategory chips + listings
- ✅ 404 page

### Admin Dashboard
- ✅ Login — email/password + role validation
- ✅ Dashboard — 4 stat cards + activity charts + category pie
- ✅ Listings — searchable/filterable table + approve/reject/feature/delete
- ✅ Users — searchable table + ban/unban/verify
- ✅ Reports — moderation queue + expand/resolve/dismiss workflow
- ✅ Analytics — revenue line chart + monetisation breakdown + health metrics

---

## Monetisation (Implemented)

| Feature | Status |
|---|---|
| Free listing (core) | ✅ default |
| Featured listing upsell (Rwf 499) | ✅ PostAdPage step 6 |
| Premium seller banner | ✅ Home + Account |
| Boost listings | 🔜 Phase 2 |
| Business subscriptions | 🔜 Phase 2 |
| Banner ads | 🔜 Phase 3 |

---

## Localisation

All user-facing strings are centralised in `src/constants/strings.ts`.
Three languages are stubbed: **English**, **Kinyarwanda**, **French**.
Currency: **Rwf (Rwandan Franc)** — formatted via `STRINGS.currency.format()`.
Default phone prefix: **+250 (Rwanda)**.

---

## Next Steps

- [ ] Firebase Cloud Functions backend (`/functions/`)
- [ ] MongoDB schemas + indexes
- [ ] React Native mobile app
- [ ] Push notification service worker (`/public/firebase-messaging-sw.js`)
- [ ] Vite SSR / prerender plugin for listing SEO
- [ ] Sitemap generation
- [ ] i18n — Kinyarwanda + French translations
- [ ] Payment integration (MoMo API)
- [ ] Dealer dashboard (Phase 2)
- [ ] In-app boost purchasing flow

---

*Built for East Africa. Kigali-first. Speed, trust, and local relevance.*
