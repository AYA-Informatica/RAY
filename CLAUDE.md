# CLAUDE.md — RAY (web)

RAY is a Rwanda-focused classifieds marketplace (OLX/Jiji-style). This repo
is the Next.js web app, live at raymarkets.co on Vercel. A companion React
Native/Expo mobile app (`RAY-Mobile`, separate repo) is a client of this
app's API — see "Cross-repo relationship" before touching anything
API-shaped, and read that repo's own `CLAUDE.md` if you're working across
both.

The stack table in `README.md` ("Tech stack — non-negotiable") is accurate
and authoritative — read it before assuming a library choice. This file
covers process and conventions the README doesn't.

## Schema changes — read this before touching `prisma/schema.prisma`

**There is no dev/shadow database and migrations are not applied via
`prisma migrate`.** `DATABASE_URL` is a pooled PgBouncer connection
(`aws-0-eu-west-1.pooler.supabase.com:6543`); `DIRECT_URL` is the direct
connection, used for migrations only and IPv6-only from most networks (plain
`ping`/DNS lookups for `db.*.supabase.co` may fail over IPv4 — that's
expected, not a sign the host is down).

The actual convention, used consistently across every existing schema
change (`prisma/add-*.sql`): write a hand-written, idempotent SQL file
(`CREATE TABLE IF NOT EXISTS`, `ADD COLUMN IF NOT EXISTS`, etc.), run it
directly against the live database via the Supabase SQL Editor (or a
one-off script through `DATABASE_URL` if you have DB credentials and
explicit permission to write to prod), *then* hand-edit `schema.prisma` to
match, then `npx prisma generate`.

**Adding a model/column to `schema.prisma` without a matching `.sql` file
is a live production outage waiting to happen** — every place that queries
the new table will throw as soon as it's hit, and if that code path sits
inside a broadly-shared server component (anything under `AppShell`, the
layout wrapping nearly every authenticated page), it takes down every
logged-in user's page load, not just one feature. This happened for real: a
`Notification` model shipped without its migration and broke the whole
site until a hotfix + the missing table were both applied. Never assume
"the schema change will get applied later" — write the `.sql` file as part
of the same piece of work that adds the Prisma model, before you write any
code that depends on the table existing.

## Auth

`getAuthUser()` (`src/lib/auth/session.ts`) supports two transports: the
Supabase cookie session (default, for web/browser traffic) and an
`Authorization: Bearer <token>` header (for the mobile app, which has no
cookie jar). Don't remove the bearer path — mobile depends on it for every
authenticated call.

## Error handling

Route handlers must not let an unawaited/unguarded call to a
DB-or-network-touching function throw uncaught inside a shared layout or
widely-used component — wrap it (`.catch(() => fallback)` or try/catch) so
one subsystem's failure can't take down pages that don't even use that
subsystem. This is the same class of bug as the schema-migration issue
above: fire-and-forget calls (`void someAsyncThing()`) especially need
their own internal try/catch, since nothing upstream is watching them.

Use `logger` (Pino) or `Sentry.captureException` in any catch block that
would otherwise make a real failure invisible — don't swallow silently.

## i18n

`src/i18n/dictionaries.ts` — English, Kinyarwanda, French. Every
user-visible string goes through the `t()` system in all three locales.
Mobile's `i18n/dictionaries.ts` is generally kept as the more complete
source when the two apps overlap on a feature — check it for existing key
names/copy before inventing new ones for a shared concept.

## Git safety — non-negotiable

- **Never `git commit` or `git push` without being explicitly asked** —
  including for hotfixes. If something looks urgent enough to fix
  immediately, say so and give the user a chance to stop you before running
  the command, don't just do it.
- Never force-push, `--no-verify`, or `git reset --hard` without an explicit
  request.
- Prefer new commits over `--amend` unless asked.
- Run `git status` before any destructive operation — don't discard
  uncommitted work without confirming it's safe to lose.

## Verification before calling something done

- `npm run typecheck` (or `npx tsc --noEmit`) must be clean.
- Typecheck passing is not the same as a change working — Prisma's
  generated client validates against `schema.prisma`, not against what
  actually exists in the live database, so a schema/migration mismatch
  compiles fine and only fails at runtime. For anything schema-adjacent,
  verify the table/column actually exists in the live DB (a read-only
  `information_schema` query via `DATABASE_URL` is safe) before considering
  the work done.
- This project deploys to Vercel with what behaves like auto-deploy from
  `main` — a push is not a staging step, it's effectively production.

## Cross-repo relationship

Mobile (`RAY-Mobile`) calls this app's API at `https://www.raymarkets.co`
in its normal dev workflow — there's no local web dev server in that loop
by default. A mobile-side change that depends on a new/changed API route
means that route needs to actually be deployed here first, not just
written locally.
