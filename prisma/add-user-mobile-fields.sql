-- Mobile-parity columns on User.
-- Run in Supabase SQL Editor (not via prisma migrate).
--
-- province:  Rwanda province, mirrors the existing city/district/neighborhood.
-- pushToken: Expo push token registered by the mobile app after sign-in.
--            One token per user (last-wins) -- multi-device support would
--            need a separate PushToken table; out of scope for now.
-- deletedAt: set when an account is deleted (anonymize-in-place). NULL means
--            active. requireUser() must reject any session where this is set.

ALTER TABLE public."User"
  ADD COLUMN IF NOT EXISTS "province" TEXT,
  ADD COLUMN IF NOT EXISTS "pushToken" TEXT,
  ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3);

CREATE INDEX IF NOT EXISTS "User_province_idx"
  ON public."User" ("province");

CREATE INDEX IF NOT EXISTS "User_deletedAt_idx"
  ON public."User" ("deletedAt");
