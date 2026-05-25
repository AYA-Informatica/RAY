# 🎯 RAY Database Setup Instructions

## Current Status
✅ Environment variables configured  
✅ Dependencies installed  
✅ Prisma client generated  
⏳ **Database connection pending**

---

## 🔧 Fix Database Connection Issue

The error indicates Supabase can't be reached at `db.paocrurwdkwxkbfizgfm.supabase.co:5432`. This is usually because:

### Option 1: Check if Database is Paused (Most Common)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **paocrurwdkwxkbfizgfm**
3. Look for a **"Resume"** button if the project is paused
4. If paused, click **Resume** and wait 2-3 minutes
5. Try the migration command again

### Option 2: Verify Connection String Format

Your current connection strings:
```
DATABASE_URL="postgresql://postgres.paocrurwdkwxkbfizgfm:RizJtBVnwCMm7fpX@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:RizJtBVnwCMm7fpX@db.paocrurwdkwxkbfizgfm.supabase.co:5432/postgres"
```

**Check these in Supabase:**
1. Go to **Project Settings → Database**
2. Under "Connection string", verify the format matches exactly
3. Make sure you're using the correct password: `RizJtBVnwCMm7fpX`

### Option 3: Use Session Mode Instead of Direct

If direct connection still fails, temporarily use session mode for migrations:

**Temporarily change DIRECT_URL to:**
```env
DIRECT_URL="postgresql://postgres.paocrurwdkwxkbfizgfm:RizJtBVnwCMm7fpX@aws-1-eu-central-1.pooler.supabase.com:5432/postgres"
```

Note: Changed from `postgres:` to `postgres.paocrurwdkwxkbfizgfm:` and port from `db.xxx.supabase.co:5432` to `aws-1-eu-central-1.pooler.supabase.com:5432`

---

## 📋 Complete Setup Steps

### Step 1: Ensure Database is Active
- Check Supabase dashboard - project should NOT be paused
- If paused, resume it and wait 2-3 minutes

### Step 2: Run Database Migrations
```bash
npm run prisma:deploy
```

Expected output:
```
✔ Migration complete
```

### Step 3: Run SQL Setup in Supabase
After migrations succeed:

1. Go to **Supabase Dashboard → SQL Editor**
2. Click **"New Query"**
3. Copy entire contents of [`prisma/setup.sql`](c:\Users\user\Documents\My Projects\RAY\prisma\setup.sql)
4. Paste and click **"Run"**
5. You should see: **"Success. No rows returned"**

This sets up:
- ✅ User sync triggers (auth.users → public.User)
- ✅ Row Level Security policies
- ✅ Access control rules

### Step 4: Seed Database
```bash
npm run db:seed
```

This populates:
- Categories (Electronics, Vehicles, Fashion, etc.)
- Category attributes (Brand, Model, Year, etc.)
- Sample data

### Step 5: Verify Setup
```bash
npx prisma studio
```

This opens a visual database browser. You should see all tables populated.

---

## 🚨 Troubleshooting

### Error: "Can't reach database server"
**Solutions:**
1. Check if Supabase project is paused → Resume it
2. Verify password is correct: `RizJtBVnwCMm7fpX`
3. Check your firewall isn't blocking port 5432
4. Try from a different network

### Error: "relation 'User' does not exist"
**Solution:** Run migrations first:
```bash
npm run prisma:deploy
```

### Error: "policy already exists"
**Solution:** This is fine - just means SQL was run before. Continue.

### Error: "trigger already exists"
**Solution:** Also fine - skip and continue.

---

## ✅ Verification Checklist

After completing setup, verify:

- [ ] Database migrations ran successfully
- [ ] SQL setup executed in Supabase
- [ ] Database seeded with initial data
- [ ] Can access Prisma Studio
- [ ] Tables visible: User, Listing, Category, etc.
- [ ] Categories populated in Category table

---

## 🎯 Next Steps After Database Setup

Once database is working:

1. **Test Google OAuth** - Try signing in
2. **Create test listing** - Post your first ad
3. **Test search** - Search for listings
4. **Test chat** - Send a message
5. **Deploy to Vercel** - Push to production

---

**Need Help?** 
- Check Supabase logs: Dashboard → Logs → Database
- Verify connection strings match Supabase settings exactly
- Ensure project is not paused
