# RAY

**The Operating System for Local Commerce in Rwanda & East Africa.**

A modern, mobile-first, hyperlocal marketplace where people buy, sell, rent, and discover trusted deals nearby — more structured than Facebook Marketplace, more local than Jiji, more modern than OLX.

This repository is the **MVP foundation**: user accounts (Google Sign-In), posting ads, search & filters, real-time chat, categories, hyperlocal location targeting, listing discovery, a basic moderation pipeline, and a trust-first UX — plus an admin dashboard.

---

## Tech stack (non-negotiable)

| Layer | Choice |
| --- | --- |
| Framework | Next.js 14 (App Router), React 18, TypeScript (strict) |
| Styling | Tailwind CSS — dark-mode native, fixed brand tokens |
| Motion | Framer Motion |
| State | Zustand |
| Forms / validation | React Hook Form + Zod |
| Backend | Supabase (Auth · PostgreSQL · Storage · Realtime · RLS) |
| ORM | Prisma |
| Rate limiting | Upstash Redis (`@upstash/ratelimit`) |
| Logging | Pino |
| Deploy | Vercel · PWA-first (Capacitor later) |

---

## What you need to provide (secrets)

The code is complete and runnable, but a few values can only come from **your** accounts. Nothing in this repo can fabricate them:

1. A **Supabase project** (URL + anon key + service-role key + database connection strings).
2. **Google OAuth** configured *inside* Supabase (Auth → Providers → Google).
3. (Optional in dev) an **Upstash Redis** instance for rate limiting. Without it, the limiter safely no-ops in development.

---

## Setup — step by step

### 1. Install

```bash
npm install
cp .env.example .env
```

### 2. Create the Supabase project

- Go to https://supabase.com → New project.
- **Project Settings → API**: copy `Project URL`, `anon public` key, and `service_role` key into `.env`
  (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).
- **Project Settings → Database → Connection string**: copy the pooled (port `6543`) string into `DATABASE_URL`
  and the direct (port `5432`) string into `DIRECT_URL`.

### 3. Configure Google Sign-In

- In Google Cloud Console, create an **OAuth 2.0 Client** (Web application).
- Authorized redirect URI: `https://<your-project-ref>.supabase.co/auth/v1/callback`.
- In Supabase: **Authentication → Providers → Google** → paste the Client ID & Secret, enable.
- In Supabase: **Authentication → URL Configuration** → add your site URL(s) and
  `http://localhost:3000/auth/callback` (and your production `/auth/callback`) to redirect URLs.

> Auth is **Google-only** by design. There is no phone OTP (removed per the v2.0 build spec).

### 4. Create the schema, triggers & RLS

```bash
npm run prisma:generate          # generate the Prisma client
npm run prisma:deploy            # apply migrations (creates tables)
```

Then open the **Supabase SQL Editor** and run the contents of [`prisma/setup.sql`](./prisma/setup.sql).
This installs:

- the `auth.users → public."User"` sync triggers (so Google sign-ups appear as marketplace users), and
- all **Row Level Security** policies (UUID ownership isolation, buyer/seller-only chat, private favorites, etc.).

### 5. Seed the launch categories

```bash
npm run db:seed
```

Seeds the 10 launch categories (Phones, Electronics, Cars, Bikes, Rentals, Furniture, Fashion, Jobs, Services, Kids) and their **dynamic attribute schemas** (e.g. Phones → Brand/Storage/RAM; Cars → Year/Mileage/Transmission; Rentals → Bedrooms/Furnished).

### 6. Create the Storage buckets

In Supabase **Storage**, create three **public** buckets:

```
listings
avatars
chat-images
```

Images are compressed client-side to WebP before upload (low-bandwidth optimization).

### 7. (Optional) Rate limiting

Create an Upstash Redis database and set `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`.
Skip in dev — the limiter logs a warning and allows all requests.

### 7b. Cron secret (for listing expiry)

Set `CRON_SECRET` to a long random string in your Vercel env vars. The daily
expiry job (`vercel.json`) only runs on Vercel; Vercel Cron sends the secret
automatically. In local dev you can omit it (the route then runs unauthenticated).

### 8. Run

```bash
npm run dev          # http://localhost:3000
```

> **Before any of the above is configured**, the app still boots and renders a set of demo listings so you can see the UI. Real data replaces them automatically once the database is reachable and seeded.

### 9. Make yourself an admin

After signing in once, promote your user in the Supabase SQL editor:

```sql
update public."User" set role = 'ADMIN' where email = 'you@example.com';
```

Then visit `/admin`.

---

## Scripts

```bash
npm run dev              # local dev server
npm run build            # prisma generate + next build
npm run start            # run the production build
npm run typecheck        # tsc --noEmit (strict)
npm run lint             # next lint
npm run prisma:deploy    # apply migrations
npm run db:seed          # seed categories + attributes
npm run prisma:studio    # browse the DB
```

---

## Project structure

```
src/
├── app/
│   ├── (auth)/login         Google Sign-In
│   ├── (admin)/admin        Role-gated dashboard (overview/listings/reports/users)
│   ├── auth/callback        OAuth code exchange
│   ├── home                 Marketplace feed
│   ├── listing/[id]         Listing detail (+ SEO metadata, JSON-LD)
│   ├── sell                 6-step posting wizard
│   ├── search               Search + filters
│   ├── chat, chat/[id]      Inbox + realtime thread
│   ├── profile, favorites   Account + saved listings
│   ├── api/                 Route handlers (listings, search, chat, favorites, reports, users, admin, categories)
│   ├── sitemap.ts           Dynamic sitemap
│   └── error/not-found/...  Custom error & loading states
├── components/  ui · listings · search · chat · profile · layout · admin · shared
├── features/    (reserved for feature modules)
├── lib/         prisma · supabase · auth · permissions · validations · sanitization · ratelimit · storage · utils
├── services/    server-side data access (graceful fallbacks)
├── store/       zustand (favorites, sell draft)
├── design/      design tokens (colors/typography/spacing/radius/shadows/motion)
├── constants/   theme · categories · locations
├── types/       shared TS types
└── middleware.ts  session refresh + route gating
prisma/          schema.prisma · setup.sql · seed.ts
```

---

## Security model

- **Auth**: Supabase Google OAuth. `middleware.ts` refreshes the session and gates `/sell`, `/chat`, `/favorites`, `/profile`, `/admin`.
- **UUID ownership isolation**: every mutating query is scoped to `auth.uid()`; RLS enforces it at the database layer too.
- **Input**: Zod validation + DOMPurify sanitization on all writes (titles, descriptions, bios, messages).
- **Rate limiting**: per-route Upstash limiters (listing creation, chat, reports, uploads, search).
- **Errors**: a standard envelope (`lib/utils/api.ts`) — clients never see stack traces or SQL.
- **Chat**: participant-checked on every read/write; blocked users (either direction) can't message; phone numbers are never exposed (shared manually in-message only).
- **CORS / headers**: security headers in `next.config.js`; lock `ALLOWED_ORIGINS` in production.

---

## Chat & trust features

- **Realtime messaging** via Supabase Realtime — text, image, and location sharing.
- **Presence**: online dot + "last seen" driven by a lightweight `/api/presence` heartbeat (`lastSeenAt`, online if seen within 2 minutes).
- **Quick replies** (transaction-oriented prompts) to speed up deals.
- **Block / unblock** a user (`/api/blocks/[userId]`) — enforced server-side on message send.
- **Report** with reactive moderation: 3+ open reports auto-flag a listing for review.
- **Delivery/read ticks** on messages.

## Seller tools

- **My Ads** (`/profile/ads`): manage your listings — edit, mark sold / reactivate, delete.
- **Edit listing** (`/profile/ads/[id]/edit`): full form including photos and dynamic category attributes; persists via `PATCH /api/listings/[id]`.
- Listings auto-expire after 30 days.

## Internationalization

English + Kinyarwanda, switchable in **Profile → Language** (or Settings). A typed dictionary (`src/i18n/dictionaries.ts`) with a cookie-backed `I18nProvider`; the server layout reads the cookie for SSR. French is a future expansion (add an `fr` dictionary and locale).

## Listing expiry (Vercel Cron)

Listings carry `expiresAt` (now + 30 days). A scheduled job enforces the lifecycle:

- Route: `GET /api/cron/expire-listings` — flips `ACTIVE` listings past `expiresAt` to `EXPIRED`.
- Schedule: daily at 03:00 UTC, configured in `vercel.json`.
- Security: guarded by `CRON_SECRET`. Vercel Cron automatically sends `Authorization: Bearer <CRON_SECRET>`; requests without it are rejected. Set `CRON_SECRET` in your Vercel env vars.

To test locally: `curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/cron/expire-listings`.

## PWA (installable + offline-aware)

Wired up with `next-pwa`. The build generates a service worker (`public/sw.js`, gitignored) with runtime caching tuned for low bandwidth:

- Supabase Storage images → cache-first (200 entries, 7 days).
- Google Fonts → cache-first (1 year).
- Static JS/CSS/assets → stale-while-revalidate.
- HTML navigations → network-first with a 5s timeout (offline-aware).
- `/api/*` → never cached (auth, chat, search stay fresh).

PWA is disabled in development to avoid stale-cache friction; it activates on `next build`. The manifest + icons were already in place, so the app is installable from the browser ("Add to Home Screen").

---

## Design system

Dark-mode native. The palette is fixed — components consume only these tokens:

`primary #E8390E` · `primary-dark #C42E08` · `background #111111` · `surface-card #242424` · `surface-modal #2C2C2C` · `navy #1B2B5E` (premium only) · `success #22C55E` · `warning #F59E0B` · `danger #EF4444` · text `#FFFFFF / #A0A0A0 / #666666` · `border #2E2E2E`.

Fonts: **Syne** (display/headings) + **DM Sans** (body), via `next/font`.

> The provided wireframes are light-themed; per the (newer) Brand & Design System, RAY ships **dark**. Layout, hierarchy, spacing and component priority follow the wireframes; color follows the design tokens.

### Responsive layout (mobile → tablet → laptop)

> **Accessibility deviation:** `text-muted` ships as **#8A8A8A** rather than the spec's #666666. The spec value yields a 3.2:1 contrast ratio on the #111 background, which fails WCAG AA for body text. #8A8A8A reaches ~5.4:1 (AA pass). Every other token matches the spec exactly.

RAY is mobile-first but fully responsive on every screen size:

- **Navigation** — a fixed bottom tab bar on phones/tablets (`< lg`); at `lg+` it is replaced by a sticky top navigation bar (brand, links, Sell button, favourites, profile).
- **Feed & search grids** — listing cards reflow `2 → 3 → 4 → 5` columns from mobile to wide desktop. The home "Recent Listings" rail shows wireframe-style wide rows on phones and a card grid from `sm` up.
- **Listing detail** — single stacked column on mobile (with a sticky "Chat with Seller" bar); a two-column gallery + details layout with an inline CTA on `lg+`.
- **Content width** — account/inbox/settings screens use a comfortable reading width (`max-w-2xl`); feed/search/favourites use a wider canvas (`max-w-6xl`). Forms (sell, edit) and the chat thread center themselves on large screens.

Tailwind breakpoints used: `sm 640 · md 768 · lg 1024 · xl 1280`.

> **Note on the Prisma client:** `prisma generate` runs automatically as part of `npm run build`. After a fresh `npm install`, run `npm run prisma:generate` before `tsc` to generate the client types. This requires network access to `binaries.prisma.sh` to download the query engine — on a standard machine this is automatic.

---

## Not in this MVP (future phases, architecture-ready)

Payments, escrow, delivery, **ratings/reviews**, subscriptions, AI recommendations, advanced analytics, seller monetization, **premium memberships**, auctions/bidding. The schema and UI leave room for these (e.g. the navy "Go Premium" surfaces, and the `/profile/reviews` and `/profile/premium` placeholder screens) without a rebuild. Block-user and basic moderation **are** implemented; ratings are not.

---

## Deploy (Vercel)

1. Push to GitHub, import into Vercel.
2. Add all `.env` values to Vercel project env vars (set `NEXT_PUBLIC_SITE_URL` and `ALLOWED_ORIGINS` to your domain).
3. Add your production `/auth/callback` URL to Supabase redirect URLs.
4. Deploy. Vercel runs `prisma generate && next build`. Use preview deploys for feature branches; promote to production via `main`.
