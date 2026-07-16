-- Rwanda-accurate location columns on Listing.
-- Run in Supabase SQL Editor (not via prisma migrate).
--
-- province: Rwanda province.
-- sector:   Rwanda sector -- mobile now collects this alongside/instead of
--           neighborhood; neighborhood stays for backwards compatibility.
-- village:  free-text cell/village, finer-grained than sector.

ALTER TABLE public."Listing"
  ADD COLUMN IF NOT EXISTS "province" TEXT,
  ADD COLUMN IF NOT EXISTS "sector" TEXT,
  ADD COLUMN IF NOT EXISTS "village" TEXT;

CREATE INDEX IF NOT EXISTS "Listing_province_idx"
  ON public."Listing" ("province");

CREATE INDEX IF NOT EXISTS "Listing_sector_idx"
  ON public."Listing" ("sector");
