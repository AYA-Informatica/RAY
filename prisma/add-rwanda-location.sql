-- Rwanda administrative hierarchy reference table
-- Run this in Supabase SQL editor, then run: npx prisma generate
-- Data is seeded separately via: npm run db:seed:location

CREATE TABLE IF NOT EXISTS "RwandaLocation" (
  "id"       SERIAL PRIMARY KEY,
  "province" TEXT NOT NULL,
  "district" TEXT NOT NULL,
  "sector"   TEXT NOT NULL,
  "cell"     TEXT NOT NULL,
  "village"  TEXT NOT NULL,
  CONSTRAINT "RwandaLocation_province_district_sector_cell_village_key"
    UNIQUE ("province", "district", "sector", "cell", "village")
);

CREATE INDEX IF NOT EXISTS "RwandaLocation_district_idx"
  ON "RwandaLocation"("district");

CREATE INDEX IF NOT EXISTS "RwandaLocation_district_sector_idx"
  ON "RwandaLocation"("district", "sector");

CREATE INDEX IF NOT EXISTS "RwandaLocation_district_sector_cell_idx"
  ON "RwandaLocation"("district", "sector", "cell");
