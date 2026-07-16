-- Localised display names on Category.
-- Run in Supabase SQL Editor (not via prisma migrate).
-- Values are seeded separately by: npm run db:seed

ALTER TABLE public."Category"
  ADD COLUMN IF NOT EXISTS "nameRw" TEXT,
  ADD COLUMN IF NOT EXISTS "nameFr" TEXT;
