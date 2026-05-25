# 🗄️ Manual Database Setup Guide

## Why Manual Setup?

Your network (both corporate WiFi and mobile hotspot) is blocking PostgreSQL database connections at the ISP level. This prevents Prisma migrations from running locally.

**Solution:** Run the SQL schema directly in Supabase's web-based SQL Editor.

---

## 📋 Step-by-Step Instructions

### **Step 1: Open Supabase SQL Editor**

1. Go to [Supabase Dashboard](https://app.supabase.com/project/paocrurwdkwxkbfizgfm)
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New Query"** button (top right)

---

### **Step 2: Copy & Paste the Schema**

1. Open the file: [`prisma/manual-schema.sql`](c:\Users\user\Documents\My Projects\RAY\prisma\manual-schema.sql)
2. **Select ALL** the content (Ctrl+A)
3. **Copy** it (Ctrl+C)
4. **Paste** into the SQL Editor

---

### **Step 3: Execute the SQL**

1. Click the **"Run"** button (or press Ctrl+Enter)
2. Wait for execution (should take 2-5 seconds)
3. You should see: **"Database schema created successfully!"**

If you see any errors, screenshot them and send to me.

---

### **Step 4: Run the Setup Triggers**

After the schema is created, run the triggers and RLS policies:

1. Open the file: [`prisma/setup.sql`](c:\Users\user\Documents\My Projects\RAY\prisma\setup.sql)
2. Copy ALL the content
3. Paste into a **NEW** SQL query in Supabase
4. Click **"Run"**
5. You should see multiple "Success" messages

This sets up:
- ✅ User sync triggers (auth.users → public.User)
- ✅ Row Level Security policies
- ✅ Access control rules

---

### **Step 5: Seed the Database**

Now we need to populate categories. Since we can't run `npm run db:seed` locally, let's do it manually:

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

### **Step 6: Verify Setup**

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

---

## 🎯 After Database Setup

Once the database is set up, you can:

1. **Generate Prisma Client** (still needed for TypeScript types):
   ```bash
   npm run prisma:generate
   ```

2. **Start Development Server**:
   ```bash
   npm run dev
   ```

3. **Test Google OAuth Login**

4. **Create Your First Listing**

---

## ⚠️ Important Notes

- **DO NOT** run `npm run prisma:deploy` or `npx prisma migrate dev` - these will fail due to network restrictions
- The database is now managed manually through Supabase SQL Editor
- For future schema changes, you'll need to write SQL ALTER TABLE statements
- OR deploy to Vercel and run migrations there (where network isn't restricted)

---

## 🚀 Next Steps

After completing manual setup:
1. Test local development with `npm run dev`
2. Push code to GitHub
3. Deploy to Vercel
4. On Vercel, you CAN run `prisma migrate deploy` since their network allows it

---

**Ready to proceed? Start with Step 1!** 🎉
