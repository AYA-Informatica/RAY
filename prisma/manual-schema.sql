-- ============================================================================
-- RAY — Manual Schema Setup
-- ============================================================================
-- Run this in the Supabase SQL Editor to create the entire RAY database schema
-- from scratch. Use this when you cannot run Prisma migrations locally (e.g.
-- ISP-level PostgreSQL port blocking).
--
-- EXECUTION ORDER:
--   1. Run THIS FILE  →  creates all tables, enums, indexes, foreign keys
--   2. Run prisma/setup.sql  →  adds auth triggers + RLS policies
--   3. Run db:seed SQL below (Step 3 section)  →  seeds categories
--
-- IDEMPOTENT: Safe to re-run. All objects are created with IF NOT EXISTS /
-- OR REPLACE, and DROP ... IF EXISTS guards are used throughout.
--
-- Last updated to match prisma/schema.prisma (Prisma v5, RAY MVP).
-- ============================================================================


-- ----------------------------------------------------------------------------
-- STEP 0 — Clean slate (drop everything in dependency order)
-- Comment this block out if you want to preserve existing data.
-- ----------------------------------------------------------------------------

DROP TABLE IF EXISTS public."Report"                CASCADE;
DROP TABLE IF EXISTS public."Block"                 CASCADE;
DROP TABLE IF EXISTS public."Message"               CASCADE;
DROP TABLE IF EXISTS public."Conversation"          CASCADE;
DROP TABLE IF EXISTS public."Favorite"              CASCADE;
DROP TABLE IF EXISTS public."ListingAttributeValue" CASCADE;
DROP TABLE IF EXISTS public."ListingImage"          CASCADE;
DROP TABLE IF EXISTS public."Listing"               CASCADE;
DROP TABLE IF EXISTS public."CategoryAttribute"     CASCADE;
DROP TABLE IF EXISTS public."Category"              CASCADE;
DROP TABLE IF EXISTS public."User"                  CASCADE;

DROP TYPE IF EXISTS public."Condition"      CASCADE;
DROP TYPE IF EXISTS public."ListingStatus"  CASCADE;
DROP TYPE IF EXISTS public."ReportReason"   CASCADE;
DROP TYPE IF EXISTS public."UserRole"       CASCADE;
DROP TYPE IF EXISTS public."AttributeType"  CASCADE;


-- ----------------------------------------------------------------------------
-- STEP 1 — Enums
-- ----------------------------------------------------------------------------

CREATE TYPE public."Condition" AS ENUM (
  'NEW',
  'LIKE_NEW',
  'GOOD',
  'FAIR',
  'USED'
);

CREATE TYPE public."ListingStatus" AS ENUM (
  'ACTIVE',
  'SOLD',
  'EXPIRED',
  'REMOVED',
  'FLAGGED'
);

CREATE TYPE public."ReportReason" AS ENUM (
  'SPAM',
  'FAKE',
  'STOLEN',
  'HARASSMENT',
  'SCAM',
  'INAPPROPRIATE'
);

CREATE TYPE public."UserRole" AS ENUM (
  'USER',
  'MODERATOR',
  'ADMIN'
);

CREATE TYPE public."AttributeType" AS ENUM (
  'TEXT',
  'NUMBER',
  'SELECT',
  'BOOLEAN'
);


-- ----------------------------------------------------------------------------
-- STEP 2 — Core tables
-- ----------------------------------------------------------------------------

-- User — public marketplace identity, mirrored from Supabase auth.users
-- id == auth.uid() (UUID from Supabase Auth).
CREATE TABLE public."User" (
  id            UUID          PRIMARY KEY,              -- mirrors auth.users.id
  email         TEXT          NOT NULL UNIQUE,
  name          TEXT,
  "avatarUrl"   TEXT,
  bio           TEXT,
  city          TEXT,
  district      TEXT,
  neighborhood  TEXT,
  role          public."UserRole"  NOT NULL DEFAULT 'USER',
  "isBanned"    BOOLEAN       NOT NULL DEFAULT FALSE,
  "lastSeenAt"  TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_city     ON public."User" (city);
CREATE INDEX IF NOT EXISTS idx_user_district ON public."User" (district);


-- Block — user safety control (hide/mute another user in chat)
CREATE TABLE public."Block" (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "blockerId" UUID        NOT NULL REFERENCES public."User" (id) ON DELETE CASCADE,
  "blockedId" UUID        NOT NULL REFERENCES public."User" (id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("blockerId", "blockedId")
);

CREATE INDEX IF NOT EXISTS idx_block_blocker ON public."Block" ("blockerId");
CREATE INDEX IF NOT EXISTS idx_block_blocked ON public."Block" ("blockedId");


-- Category — listing categories (seeded; not user-created)
CREATE TABLE public."Category" (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  name        TEXT        NOT NULL,
  slug        TEXT        NOT NULL UNIQUE,
  icon        TEXT,                         -- emoji used in the category grid
  "order"     INTEGER     NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- CategoryAttribute — schema-driven listing fields per category
-- (Brand, Storage, Year, Bedrooms…) without needing new DB columns.
CREATE TABLE public."CategoryAttribute" (
  id            TEXT                   PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "categoryId"  TEXT                   NOT NULL REFERENCES public."Category" (id) ON DELETE CASCADE,
  label         TEXT                   NOT NULL,
  key           TEXT                   NOT NULL,
  type          public."AttributeType" NOT NULL,
  required      BOOLEAN                NOT NULL DEFAULT FALSE,
  placeholder   TEXT,
  options       JSONB,                  -- for SELECT: '["Apple","Samsung",...]'
  "order"       INTEGER                NOT NULL DEFAULT 0,
  "createdAt"   TIMESTAMPTZ            NOT NULL DEFAULT NOW(),
  UNIQUE ("categoryId", key)
);

CREATE INDEX IF NOT EXISTS idx_catattr_category ON public."CategoryAttribute" ("categoryId");


-- Listing — the heart of RAY
CREATE TABLE public."Listing" (
  id            TEXT                     PRIMARY KEY DEFAULT gen_random_uuid()::text,
  title         TEXT                     NOT NULL,
  description   TEXT                     NOT NULL,
  price         DOUBLE PRECISION         NOT NULL,
  negotiable    BOOLEAN                  NOT NULL DEFAULT TRUE,
  condition     public."Condition"       NOT NULL,
  city          TEXT                     NOT NULL,
  district      TEXT                     NOT NULL,
  neighborhood  TEXT,
  latitude      DOUBLE PRECISION,
  longitude     DOUBLE PRECISION,
  status        public."ListingStatus"   NOT NULL DEFAULT 'ACTIVE',
  views         INTEGER                  NOT NULL DEFAULT 0,
  "expiresAt"   TIMESTAMPTZ              NOT NULL,
  "createdAt"   TIMESTAMPTZ              NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ              NOT NULL DEFAULT NOW(),
  "userId"      UUID                     NOT NULL REFERENCES public."User" (id)     ON DELETE CASCADE,
  "categoryId"  TEXT                     NOT NULL REFERENCES public."Category" (id)
);

CREATE INDEX IF NOT EXISTS idx_listing_city       ON public."Listing" (city);
CREATE INDEX IF NOT EXISTS idx_listing_district   ON public."Listing" (district);
CREATE INDEX IF NOT EXISTS idx_listing_category   ON public."Listing" ("categoryId");
CREATE INDEX IF NOT EXISTS idx_listing_status     ON public."Listing" (status);
CREATE INDEX IF NOT EXISTS idx_listing_created    ON public."Listing" ("createdAt");


-- ListingImage — photos attached to a listing (max 7 per app logic)
CREATE TABLE public."ListingImage" (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  url         TEXT        NOT NULL,
  "order"     INTEGER     NOT NULL DEFAULT 0,
  "listingId" TEXT        NOT NULL REFERENCES public."Listing" (id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_listingimage_listing ON public."ListingImage" ("listingId");


-- ListingAttributeValue — filled-in dynamic fields for a specific listing
CREATE TABLE public."ListingAttributeValue" (
  id            TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "listingId"   TEXT        NOT NULL REFERENCES public."Listing" (id)           ON DELETE CASCADE,
  "attributeId" TEXT        NOT NULL REFERENCES public."CategoryAttribute" (id) ON DELETE CASCADE,
  value         TEXT        NOT NULL,
  UNIQUE ("listingId", "attributeId")
);

CREATE INDEX IF NOT EXISTS idx_attrval_listing   ON public."ListingAttributeValue" ("listingId");
CREATE INDEX IF NOT EXISTS idx_attrval_attribute ON public."ListingAttributeValue" ("attributeId");


-- Favorite — saved listings per user
CREATE TABLE public."Favorite" (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    UUID        NOT NULL REFERENCES public."User" (id)    ON DELETE CASCADE,
  "listingId" TEXT        NOT NULL REFERENCES public."Listing" (id) ON DELETE CASCADE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("userId", "listingId")
);

CREATE INDEX IF NOT EXISTS idx_favorite_user    ON public."Favorite" ("userId");
CREATE INDEX IF NOT EXISTS idx_favorite_listing ON public."Favorite" ("listingId");


-- Conversation — one thread per buyer per listing (enforced by unique constraint)
CREATE TABLE public."Conversation" (
  id          TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "listingId" TEXT        NOT NULL REFERENCES public."Listing" (id) ON DELETE CASCADE,
  "buyerId"   UUID        NOT NULL REFERENCES public."User" (id),
  "sellerId"  UUID        NOT NULL REFERENCES public."User" (id),
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("listingId", "buyerId")
);

CREATE INDEX IF NOT EXISTS idx_conv_buyer   ON public."Conversation" ("buyerId");
CREATE INDEX IF NOT EXISTS idx_conv_seller  ON public."Conversation" ("sellerId");
CREATE INDEX IF NOT EXISTS idx_conv_listing ON public."Conversation" ("listingId");


-- Message — individual chat messages; supports text, image, and location
CREATE TABLE public."Message" (
  id               TEXT        PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "conversationId" TEXT        NOT NULL REFERENCES public."Conversation" (id) ON DELETE CASCADE,
  "senderId"       UUID        NOT NULL REFERENCES public."User" (id),
  content          TEXT,
  "imageUrl"       TEXT,
  latitude         DOUBLE PRECISION,
  longitude        DOUBLE PRECISION,
  "isRead"         BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt"      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_message_conversation ON public."Message" ("conversationId");
CREATE INDEX IF NOT EXISTS idx_message_sender       ON public."Message" ("senderId");


-- Report — content moderation; auto-flagged at ≥3 open reports (see API)
CREATE TABLE public."Report" (
  id           TEXT                    PRIMARY KEY DEFAULT gen_random_uuid()::text,
  reason       public."ReportReason"   NOT NULL,
  details      TEXT,
  "reporterId" UUID                    NOT NULL REFERENCES public."User" (id),
  "listingId"  TEXT                    REFERENCES public."Listing" (id) ON DELETE CASCADE,
  resolved     BOOLEAN                 NOT NULL DEFAULT FALSE,
  "createdAt"  TIMESTAMPTZ             NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_report_listing  ON public."Report" ("listingId");
CREATE INDEX IF NOT EXISTS idx_report_reporter ON public."Report" ("reporterId");
CREATE INDEX IF NOT EXISTS idx_report_resolved ON public."Report" (resolved);


-- ----------------------------------------------------------------------------
-- STEP 3 — Seed: launch categories + dynamic attributes
-- Matches prisma/seed.ts exactly (10 Rwanda-optimised categories).
-- ----------------------------------------------------------------------------

INSERT INTO public."Category" (id, name, slug, icon, "order") VALUES
  ('cat_phones',       'Mobiles',      'phones',       '📱', 1),
  ('cat_electronics',  'Electronics',  'electronics',  '💻', 2),
  ('cat_cars',         'Cars',         'cars',         '🚗', 3),
  ('cat_bikes',        'Bikes',        'bikes',        '🚲', 4),
  ('cat_rentals',      'Rentals',      'rentals',      '🏠', 5),
  ('cat_furniture',    'Furniture',    'furniture',    '🛋️', 6),
  ('cat_fashion',      'Fashion',      'fashion',      '👕', 7),
  ('cat_jobs',         'Jobs',         'jobs',         '💼', 8),
  ('cat_services',     'Services',     'services',     '🔧', 9),
  ('cat_kids',         'Kids',         'kids',         '🧸', 10)
ON CONFLICT (slug) DO NOTHING;


-- Phones — brand, storage, RAM, condition
INSERT INTO public."CategoryAttribute" (id, "categoryId", label, key, type, required, placeholder, options, "order") VALUES
  ('attr_phones_brand',   'cat_phones', 'Brand',   'brand',   'TEXT',   TRUE,  'e.g. Apple, Samsung', NULL, 1),
  ('attr_phones_storage', 'cat_phones', 'Storage', 'storage', 'SELECT', FALSE, NULL,
    '["16GB","32GB","64GB","128GB","256GB","512GB"]'::jsonb, 2),
  ('attr_phones_ram',     'cat_phones', 'RAM',     'ram',     'SELECT', FALSE, NULL,
    '["2GB","3GB","4GB","6GB","8GB","12GB","16GB"]'::jsonb, 3)
ON CONFLICT ("categoryId", key) DO NOTHING;


-- Electronics — brand, model
INSERT INTO public."CategoryAttribute" (id, "categoryId", label, key, type, required, placeholder, options, "order") VALUES
  ('attr_elec_brand', 'cat_electronics', 'Brand', 'brand', 'TEXT', TRUE,  'e.g. Dell, HP, Sony', NULL, 1),
  ('attr_elec_model', 'cat_electronics', 'Model', 'model', 'TEXT', FALSE, 'e.g. XPS 13, MacBook Air', NULL, 2)
ON CONFLICT ("categoryId", key) DO NOTHING;


-- Cars — brand, year, mileage, transmission, fuel type
INSERT INTO public."CategoryAttribute" (id, "categoryId", label, key, type, required, placeholder, options, "order") VALUES
  ('attr_cars_brand',    'cat_cars', 'Brand',        'brand',    'TEXT',   TRUE,  'e.g. Toyota, Honda', NULL, 1),
  ('attr_cars_year',     'cat_cars', 'Year',         'year',     'NUMBER', TRUE,  'e.g. 2018', NULL, 2),
  ('attr_cars_mileage',  'cat_cars', 'Mileage (km)', 'mileage',  'NUMBER', FALSE, 'e.g. 80000', NULL, 3),
  ('attr_cars_trans',    'cat_cars', 'Transmission', 'transmission', 'SELECT', FALSE, NULL,
    '["Manual","Automatic","Semi-automatic"]'::jsonb, 4),
  ('attr_cars_fuel',     'cat_cars', 'Fuel',         'fuel',     'SELECT', FALSE, NULL,
    '["Petrol","Diesel","Hybrid","Electric"]'::jsonb, 5)
ON CONFLICT ("categoryId", key) DO NOTHING;


-- Bikes — brand, type
INSERT INTO public."CategoryAttribute" (id, "categoryId", label, key, type, required, placeholder, options, "order") VALUES
  ('attr_bikes_brand', 'cat_bikes', 'Brand', 'brand', 'TEXT',   FALSE, 'e.g. Trek, Giant', NULL, 1),
  ('attr_bikes_type',  'cat_bikes', 'Type',  'type',  'SELECT', FALSE, NULL,
    '["Mountain","Road","City","Electric","Other"]'::jsonb, 2)
ON CONFLICT ("categoryId", key) DO NOTHING;


-- Rentals — bedrooms, bathrooms, furnished
INSERT INTO public."CategoryAttribute" (id, "categoryId", label, key, type, required, placeholder, options, "order") VALUES
  ('attr_rent_beds',      'cat_rentals', 'Bedrooms',  'bedrooms',  'SELECT', TRUE,  NULL,
    '["Studio","1","2","3","4","5+"]'::jsonb, 1),
  ('attr_rent_baths',     'cat_rentals', 'Bathrooms', 'bathrooms', 'SELECT', FALSE, NULL,
    '["1","2","3","4+"]'::jsonb, 2),
  ('attr_rent_furnished', 'cat_rentals', 'Furnished', 'furnished', 'SELECT', FALSE, NULL,
    '["Furnished","Unfurnished","Partially furnished"]'::jsonb, 3)
ON CONFLICT ("categoryId", key) DO NOTHING;


-- (Furniture, Fashion, Jobs, Services, Kids have no required attributes — 
--  the sell wizard auto-skips the Specs step for these categories.)


-- ----------------------------------------------------------------------------
-- Done.
-- Next: run prisma/setup.sql in a NEW SQL Editor tab for triggers + RLS.
-- ----------------------------------------------------------------------------

SELECT 'Schema created successfully! Run prisma/setup.sql next.' AS status;

-- ============================================================================
-- Migration: Add offer fields to Message (run after initial setup)
-- ============================================================================
ALTER TABLE public."Message"
  ADD COLUMN IF NOT EXISTS "offerAmount" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "offerStatus" TEXT
  CHECK ("offerStatus" IN ('pending', 'accepted', 'declined'));
