# 🗄️ RAY Database Setup Guide

Complete guide for setting up and managing the RAY marketplace database with Supabase PostgreSQL.

---

## 📋 Table of Contents
- [Overview](#overview)
- [Database Architecture](#database-architecture)
- [Setup Methods](#setup-methods)
- [Manual Setup (Web Dashboard)](#manual-setup-web-dashboard)
- [Automated Setup (Prisma Migrations)](#automated-setup-prisma-migrations)
- [Database Schema Reference](#database-schema-reference)
- [Maintenance & Operations](#maintenance--operations)
- [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

RAY uses **Supabase PostgreSQL** as its database, managed through **Prisma ORM**. The database includes:

- **11 tables** for users, listings, categories, chat, and more
- **Row Level Security (RLS)** policies for data isolation
- **Authentication triggers** to sync auth.users with public.User table
- **Dynamic category attributes** for flexible listing schemas

---

## 🏗️ Database Architecture

### Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| **User** | User profiles (synced from auth.users) | id, email, name, role |
| **Category** | Listing categories | id, name, slug, icon |
| **Listing** | Product listings | id, title, price, status |
| **ListingImage** | Listing photos | id, url, listingId |
| **CategoryAttribute** | Dynamic category fields | id, label, key, type |
| **ListingAttributeValue** | Custom field values | id, listingId, value |
| **Favorite** | User favorites | id, userId, listingId |
| **Conversation** | Chat threads | id, buyerId, sellerId |
| **Message** | Chat messages | id, content, isRead |
| **Report** | Content reports | id, reason, resolved |
| **Block** | User blocks | id, blockerId, blockedId |

### Relationships

```
User (1) ────── (N) Listing
User (1) ────── (N) Favorite
User (1) ────── (N) Conversation (as buyer or seller)
User (1) ────── (N) Message (as sender)

Category (1) ─── (N) CategoryAttribute
Category (1) ─── (N) Listing

Listing (1) ─── (N) ListingImage
Listing (1) ─── (N) ListingAttributeValue
Listing (1) ─── (N) Favorite
Listing (1) ─── (N) Conversation
Listing (1) ─── (N) Report

Conversation (1) ─ (N) Message
CategoryAttribute (1) ─ (N) ListingAttributeValue
```

---

## 🔧 Setup Methods

There are **two ways** to set up the database:

### **Method 1: Manual Setup (Web Dashboard)** ⭐ Recommended for Network Issues

**Use this if:**
- Your network blocks PostgreSQL connections
- You're behind a corporate firewall
- Prisma migrations fail locally

**Pros:**
- ✅ Works from any network
- ✅ Visual feedback in Supabase Dashboard
- ✅ No command-line tools needed

**Cons:**
- ❌ Manual process (no automation)
- ❌ Harder to track schema changes
- ❌ Must repeat if database reset needed

---

### **Method 2: Automated Setup (Prisma Migrations)** ⭐ Recommended for Production

**Use this if:**
- You have unrestricted internet access
- Deploying to Vercel/Render/Railway
- Want automated schema management

**Pros:**
- ✅ Fully automated
- ✅ Version-controlled migrations
- ✅ Easy to replicate

**Cons:**
- ❌ Requires direct database connection
- ❌ May fail on restricted networks

---

## 📝 Manual Setup (Web Dashboard)

This method runs SQL directly in Supabase's web-based SQL Editor.

### Step 1: Open Supabase SQL Editor

1. Go to [Supabase Dashboard](https://app.supabase.com/project/paocrurwdkwxkbfizgfm)
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"** button (top right)

---

### Step 2: Create Database Schema

1. Open the file: [`prisma/manual-schema.sql`](c:\Users\user\Documents\My Projects\RAY\prisma\manual-schema.sql)
2. **Select ALL** the content (Ctrl+A)
3. **Copy** it (Ctrl+C)
4. **Paste** into the SQL Editor
5. Click the **"Run"** button (or press Ctrl+Enter)
6. Wait for execution (should take 2-5 seconds)
7. You should see: **"Database schema created successfully!"**

**What this creates:**
- All 11 database tables
- Enums (Condition, ListingStatus, etc.)
- Indexes for performance
- Foreign key constraints

---

### Step 3: Set Up Triggers & RLS Policies

After the schema is created, run the triggers and Row Level Security policies:

1. Open the file: [`prisma/setup.sql`](c:\Users\user\Documents\My Projects\RAY\prisma\setup.sql)
2. Copy ALL the content
3. Paste into a **NEW** SQL query in Supabase
4. Click **"Run"**
5. You should see multiple "Success" messages

**What this sets up:**
- ✅ User sync triggers (auth.users → public.User)
- ✅ Row Level Security policies
- ✅ Access control rules for all tables

---

### Step 4: Seed the Database

Now populate the database with initial data (categories and attributes):

1. In SQL Editor, create a **NEW** query
2. Copy this SQL:

```sql
-- Insert Categories
INSERT INTO "Category" (id, name, slug, icon, "order") VALUES
('cat_electronics', 'Electronics', 'electronics', 'smartphone', 1),
('cat_vehicles', 'Vehicles', 'vehicles', 'car', 2),
('cat_fashion', 'Fashion', 'fashion', 'shirt', 3),
('cat_home', 'Home & Garden', 'home-garden', 'home', 4),
('cat_sports', 'Sports', 'sports', 'basketball', 5),
('cat_books', 'Books', 'books', 'book-open', 6),
('cat_services', 'Services', 'services', 'briefcase', 7),
('cat_animals', 'Animals', 'animals', 'paw-print', 8);

-- Insert Category Attributes for Electronics
INSERT INTO "CategoryAttribute" (id, "categoryId", label, key, type, required, "order") VALUES
('attr_brand', 'cat_electronics', 'Brand', 'brand', 'TEXT', true, 1),
('attr_model', 'cat_electronics', 'Model', 'model', 'TEXT', false, 2),
('attr_storage', 'cat_electronics', 'Storage', 'storage', 'SELECT', false, 3);

-- Add storage options
UPDATE "CategoryAttribute" 
SET options = '["32GB", "64GB", "128GB", "256GB", "512GB", "1TB"]'::jsonb
WHERE id = 'attr_storage';

-- Insert Category Attributes for Vehicles
INSERT INTO "CategoryAttribute" (id, "categoryId", label, key, type, required, "order") VALUES
('attr_make', 'cat_vehicles', 'Make', 'make', 'TEXT', true, 1),
('attr_year', 'cat_vehicles', 'Year', 'year', 'NUMBER', true, 2),
('attr_mileage', 'cat_vehicles', 'Mileage (km)', 'mileage', 'NUMBER', false, 3);
```

3. Click **"Run"**

---

### Step 5: Verify Setup

1. Go to **Table Editor** in Supabase (left sidebar)
2. You should see these tables:
   - ✅ User
   - ✅ Category
   - ✅ Listing
   - ✅ ListingImage
   - ✅ CategoryAttribute
   - ✅ ListingAttributeValue
   - ✅ Favorite
   - ✅ Conversation
   - ✅ Message
   - ✅ Report
   - ✅ Block

3. Click on **"Category"** table
4. You should see 8 categories populated

5. Click on **"CategoryAttribute"** table
6. You should see 6 attributes (3 for Electronics, 3 for Vehicles)

---

## 🤖 Automated Setup (Prisma Migrations)

This method uses Prisma CLI to automatically create and manage the database schema.

### Prerequisites

- Node.js installed
- Direct database connection available
- Environment variables configured

---

### Step 1: Configure Environment Variables

Ensure your `.env` file has correct database URLs:

```env
DATABASE_URL="postgresql://postgres.paocrurwdkwxkbfizgfm:YOUR_PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"

DIRECT_URL="postgresql://postgres.paocrurwdkwxkbfizgfm:YOUR_PASSWORD@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

**Get these from:**
- Supabase Dashboard → Project Settings → Database → Connection string

---

### Step 2: Generate Prisma Client

```bash
npm run prisma:generate
```

This generates TypeScript types from your schema.

---

### Step 3: Run Database Migrations

```bash
npm run prisma:deploy
```

Expected output:
```
✔ Migration complete
```

**What this does:**
- Creates all database tables
- Sets up indexes
- Configures foreign keys
- Applies enum types

---

### Step 4: Run SQL Setup Script

After migrations succeed, set up triggers and RLS:

1. Go to **Supabase Dashboard → SQL Editor**
2. Click **"New Query"**
3. Copy entire contents of [`prisma/setup.sql`](c:\Users\user\Documents\My Projects\RAY\prisma\setup.sql)
4. Paste and click **"Run"**
5. You should see: **"Success. No rows returned"**

---

### Step 5: Seed Database

```bash
npm run db:seed
```

This populates:
- Categories (Electronics, Vehicles, Fashion, etc.)
- Category attributes (Brand, Model, Year, etc.)
- Sample data

---

### Step 6: Verify Setup

```bash
npx prisma studio
```

This opens a visual database browser. You should see all tables populated.

---

## 📊 Database Schema Reference

### Enum Types

```sql
CREATE TYPE "Condition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'USED');
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'SOLD', 'EXPIRED', 'REMOVED', 'FLAGGED');
CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'FAKE', 'STOLEN', 'HARASSMENT', 'SCAM', 'INAPPROPRIATE');
CREATE TYPE "UserRole" AS ENUM ('USER', 'MODERATOR', 'ADMIN');
CREATE TYPE "AttributeType" AS ENUM ('TEXT', 'NUMBER', 'SELECT', 'BOOLEAN');
```

### Key Tables

#### User Table
```sql
CREATE TABLE "User" (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  "avatarUrl" TEXT,
  bio TEXT,
  city VARCHAR(255),
  district VARCHAR(255),
  neighborhood VARCHAR(255),
  role "UserRole" NOT NULL DEFAULT 'USER',
  "isBanned" BOOLEAN NOT NULL DEFAULT false,
  "lastSeenAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### Listing Table
```sql
CREATE TABLE "Listing" (
  id VARCHAR(255) PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  negotiable BOOLEAN NOT NULL DEFAULT true,
  condition "Condition" NOT NULL,
  city VARCHAR(255) NOT NULL,
  district VARCHAR(255) NOT NULL,
  neighborhood VARCHAR(255),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
  views INTEGER NOT NULL DEFAULT 0,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "userId" UUID NOT NULL,
  "categoryId" VARCHAR(255) NOT NULL
);
```

---

## 🛠️ Maintenance & Operations

### Common Operations

#### View Database Statistics
```sql
-- Count records by table
SELECT 'User' as table_name, COUNT(*) FROM "User"
UNION ALL
SELECT 'Listing', COUNT(*) FROM "Listing"
UNION ALL
SELECT 'Category', COUNT(*) FROM "Category";
```

#### Find Expired Listings
```sql
SELECT id, title, "expiresAt", status
FROM "Listing"
WHERE "expiresAt" < NOW() AND status = 'ACTIVE';
```

#### Update User Role to Admin
```sql
UPDATE "User"
SET role = 'ADMIN'
WHERE email = 'admin@example.com';
```

#### Delete Test Data
```sql
-- WARNING: This deletes all test data!
DELETE FROM "Message";
DELETE FROM "Conversation";
DELETE FROM "ListingImage";
DELETE FROM "ListingAttributeValue";
DELETE FROM "Listing";
DELETE FROM "Favorite";
```

---

### Backup Strategy

#### Automatic Backups (Supabase)
Supabase provides automatic daily backups:
1. Go to **Supabase Dashboard → Database → Backups**
2. Enable automatic backups
3. Retention period: 7 days (free tier) or 30 days (Pro)

#### Manual Backup
```bash
# Export database using pg_dump
pg_dump "postgresql://postgres:PASSWORD@db.project.supabase.co:5432/postgres" > backup.sql
```

#### Restore from Backup
1. Go to **Supabase Dashboard → Database → Backups**
2. Select backup to restore
3. Click **"Restore"**

---

### Schema Changes

#### Adding a New Column (Manual)
```sql
ALTER TABLE "Listing" ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false;
```

#### Adding a New Column (Prisma)
1. Edit `prisma/schema.prisma`:
   ```prisma
   model Listing {
     // ... existing fields
     featured Boolean @default(false)
   }
   ```

2. Generate migration:
   ```bash
   npx prisma migrate dev --name add_featured_to_listing
   ```

3. Deploy:
   ```bash
   npm run prisma:deploy
   ```

---

## 🚨 Troubleshooting

### Issue: Can't connect to database (P1001 error)

**Symptoms:**
```
Error: P1001: Can't reach database server at `db.xxx.supabase.co:5432`
```

**Causes:**
- Network blocking PostgreSQL protocol
- Firewall restrictions
- ISP-level filtering

**Solutions:**

**Option 1: Use Mobile Hotspot**
1. Disconnect from current WiFi
2. Connect to phone's mobile hotspot
3. Try migration again

**Option 2: Use Manual Setup**
- Follow the "Manual Setup" section above
- Run SQL directly in Supabase Dashboard

**Option 3: Deploy to Vercel First**
- Push code to GitHub
- Deploy to Vercel
- Run migrations on Vercel (no network restrictions)

---

### Issue: Database is paused

**Symptoms:**
- Connection timeout errors
- "Project paused" banner in Supabase Dashboard

**Solution:**
1. Go to Supabase Dashboard
2. Click **"Resume"** button
3. Wait 2-3 minutes for database to start
4. Retry connection

---

### Issue: Relation "User" does not exist

**Cause:** Migrations haven't been run yet

**Solution:**
```bash
npm run prisma:deploy
```

Or use manual setup method.

---

### Issue: Policy already exists / Trigger already exists

**Cause:** SQL setup script was run multiple times

**Solution:** This is harmless. The `DROP TRIGGER IF EXISTS` statements handle this. Continue.

---

### Issue: Foreign key constraint violation

**Cause:** Trying to insert data that references non-existent records

**Solution:**
- Ensure referenced records exist first
- Check order of INSERT statements
- Verify IDs are correct

---

### Issue: Slow queries

**Symptoms:** Queries taking >1 second

**Solutions:**
1. Check if indexes exist:
   ```sql
   SELECT indexname, tablename 
   FROM pg_indexes 
   WHERE schemaname = 'public';
   ```

2. Add missing indexes:
   ```sql
   CREATE INDEX idx_listing_city ON "Listing"(city);
   ```

3. Analyze query performance:
   ```sql
   EXPLAIN ANALYZE SELECT * FROM "Listing" WHERE city = 'Kigali';
   ```

---

### Issue: Data not appearing after insert

**Cause:** Transaction not committed or RLS policy blocking access

**Solution:**
1. Check RLS policies:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'Listing';
   ```

2. Temporarily disable RLS for testing:
   ```sql
   ALTER TABLE "Listing" DISABLE ROW LEVEL SECURITY;
   ```

3. Re-enable after testing:
   ```sql
   ALTER TABLE "Listing" ENABLE ROW LEVEL SECURITY;
   ```

---

## 📚 Additional Resources

- [Supabase Database Documentation](https://supabase.com/docs/guides/database)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated:** 2026-05-25  
**Database Status:** ✅ Active and Seeded
