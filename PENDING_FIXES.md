# RAY — Pending Fixes & Next Steps

> Last updated: 2026-07-03

---

## ~~1. Prisma Connection Pool~~ ✅ DONE (2026-07-03)

`.env` updated:
- `DATABASE_URL` → Transaction Pooler `aws-0-eu-west-1.pooler.supabase.com:6543` with `?pgbouncer=true&connection_limit=1`
- `DIRECT_URL` → Direct connection `db.afipvqridgcfauinbqnr.supabase.co:5432` (migrations only)

**Still required — set the same values in Vercel before redeploying to production:**
- `DATABASE_URL` = `postgresql://postgres.afipvqridgcfauinbqnr:<password>@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&connect_timeout=30`
- `DIRECT_URL` = `postgresql://postgres:<password>@db.afipvqridgcfauinbqnr.supabase.co:5432/postgres`

---

## 2. Fix `NEXT_PUBLIC_SITE_URL` (HIGH — OG/Twitter metadata broken)

**Symptom:** `metadataBase` resolves to `http://localhost:3000`. Open Graph / Twitter card images and canonical URLs point to localhost when shared on social media.

**Fix:** In **Vercel Dashboard → Project → Settings → Environment Variables**:

```
NEXT_PUBLIC_SITE_URL = https://www.raymarkets.co
```

Redeploy after setting.

---

## 3. Refresh E2E Test Snapshots (after fixes 1 & 2 are deployed)

Visual regression baselines were captured before recent UI changes (locale-reactive headings, new client components). They will fail if run against the current UI.

```bash
# Regenerate baselines against the running dev server
npm run test:e2e:update

# Then verify all tests pass
npm run test:e2e
```

---

## 4. Manual Production Testing

Work through [`PRODUCTION_TESTING_CHECKLIST.md`](./PRODUCTION_TESTING_CHECKLIST.md) on `raymarkets.co`. Highest-priority untested flows:

- [ ] Google OAuth sign-up end-to-end
- [ ] Create a listing in at least 3 different categories
- [ ] Accept / decline a price offer (needs 2 accounts — buyer + seller)
- [ ] Report a listing × 3 from different accounts → verify `status = 'FLAGGED'`
- [ ] Verify cron jobs respond correctly:

```bash
curl -H "Authorization: Bearer $CRON_SECRET" https://www.raymarkets.co/api/cron/expire-listings
curl -H "Authorization: Bearer $CRON_SECRET" https://www.raymarkets.co/api/cron/purge-messages
```

---

## 5. DNS & Domain (before public launch)

**Task:** Point `raymarkets.co` to Vercel.

1. In your domain registrar, add/update DNS:
   - `A` record → `76.76.21.21` (Vercel's IP)
   - or `CNAME` `www` → `cname.vercel-dns.com`
2. In **Vercel Dashboard → Project → Settings → Domains** — add `raymarkets.co` and `www.raymarkets.co`
3. Vercel provisions the SSL cert automatically

---

## 6. Enable Fluid Compute (1 click, reduces cold starts)

In **Vercel Dashboard → Project → Settings → Functions → Fluid Compute** — toggle on.

Reduces cold-start latency for East African users hitting the `jnb1` (Johannesburg) region.

---

## ~~7. OAuth Consent Screen Branding~~ ✅ DONE (2026-07-03)

- Supabase Site URL set to `https://www.raymarkets.co`
- Redirect URLs updated (www + bare domain)
- Google consent screen: app name "RAY", logo, authorized domain `raymarkets.co`
- Submitted for Google verification

---

## ~~8. `price` Column: Float → Int~~ ✅ DONE (2026-07-03)

- SQL run in Supabase: `ALTER TABLE "Listing" ALTER COLUMN "price" TYPE INTEGER USING ROUND("price")::INTEGER`
- `prisma/schema.prisma` updated to `price Int`
- Prisma client regenerated, production build verified

---

## ~~9. Cron Secret: `crypto.timingSafeEqual()`~~ ✅ DONE (2026-07-03)

Applied to both `/api/cron/expire-listings` and `/api/cron/purge-messages`.

---

## 10. Deferred (post-launch)

| Item | Notes |
|---|---|
| ESLint 8 → 9 + `eslint-config-next@16` | Blocked on peer dep — ESLint 9 has breaking config format changes |
| Replace `console.error` with `pino` logger in API routes | ~15 routes still use `console.error` directly |
| Error tracking (Sentry / LogRocket) | Add `@sentry/nextjs` after launch |
| Automated functional tests (Playwright) | Auth flow, listing creation, search, chat |
| Lighthouse audit (target > 90 across all metrics) | Run after DNS + CDN settle |
