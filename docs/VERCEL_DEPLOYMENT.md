# 🚀 Deploying RAY to Vercel

## Prerequisites

- ✅ Supabase project set up (paocrurwdkwxkbfizgfm)
- ✅ Database schema created and seeded
- ✅ Google OAuth configured
- ✅ Code pushed to GitHub

---

## Step 1: Connect to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository: `AYA-Informatica/RAY`
4. Click **"Import"**

### Option B: Via CLI

```bash
npm i -g vercel
vercel login
vercel
```

---

## Step 2: Configure Environment Variables

In the Vercel dashboard, go to **Settings → Environment Variables** and add:

### **Required Variables:**

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://paocrurwdkwxkbfizgfm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2NydXJ3ZGt3eGtiZml6Z2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NjczNDcsImV4cCI6MjA4NTI0MzM0N30.n0VmLnPhuf4vKFF573vt5ylQyxECJ3_GeYTyDM6u4Oo
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# Database URLs (Vercel can connect to Supabase)
DATABASE_URL=postgresql://postgres.paocrurwdkwxkbfizgfm:RizJtBVnwCMm7fpX@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
DIRECT_URL=postgresql://postgres.paocrurwdkwxkbfizgfm:RizJtBVnwCMm7fpX@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production
```

### **How to Get Missing Values:**

1. **SUPABASE_SERVICE_ROLE_KEY**:
   - Go to Supabase Dashboard → Project Settings → API
   - Copy the "service_role" key (keep this secret!)

2. **GOOGLE_CLIENT_ID & GOOGLE_CLIENT_SECRET**:
   - Already configured in Google Cloud Console
   - Use the same credentials as local development

3. **NEXT_PUBLIC_APP_URL**:
   - Will be provided by Vercel after first deployment
   - Update it later if you use a custom domain

---

## Step 3: Build & Deploy Settings

In Vercel dashboard → **Settings → Build & Development**:

### **Build Command:**
```bash
npm run build
```

### **Output Directory:**
```
.next
```

### **Install Command:**
```bash
npm install
```

---

## Step 4: Add Post-Deploy Script

Create a file `vercel.json` in the root (if not exists):

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "nextjs",
  "regions": ["fra1"]
}
```

This ensures deployment to Frankfurt region (closest to your Supabase EU database).

---

## Step 5: Run Database Migrations on Vercel

After the first deployment succeeds:

### **Option A: Via Vercel Dashboard (Easy)**

1. Go to your Vercel project
2. Click **"Settings" → "Environment Variables"**
3. Make sure DATABASE_URL and DIRECT_URL are set
4. The migrations will run automatically during build if configured

### **Option B: Via Vercel CLI (Manual Control)**

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link to your project
vercel link

# Run migrations in production
vercel env pull .env.production.local
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

### **Option C: Add to package.json Scripts**

Add this to your `package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma migrate deploy && next build"
  }
}
```

Then update `vercel.json`:

```json
{
  "buildCommand": "npm run vercel-build"
}
```

---

## Step 6: Verify Deployment

After deployment completes:

1. Visit your Vercel URL (e.g., `https://ray-[hash].vercel.app`)
2. Test Google OAuth login
3. Create a test listing
4. Check Supabase Table Editor to verify data was saved

---

## 🔧 Troubleshooting

### **Issue: Database connection fails on Vercel**

**Solution:**
- Verify DATABASE_URL uses the pooler connection (port 6543)
- Ensure SSL mode is enabled: `?sslmode=require`
- Check Vercel logs for specific error messages

### **Issue: Google OAuth callback fails**

**Solution:**
- Add your Vercel URL to Google Cloud Console authorized redirect URIs:
  ```
  https://your-app.vercel.app/auth/callback
  ```
- Also add it in Supabase Dashboard → Authentication → URL Configuration

### **Issue: Build fails with Prisma errors**

**Solution:**
- Make sure `prisma generate` runs before build
- Add `"postinstall": "prisma generate"` to package.json scripts
- Check that schema.prisma is included in git (not in .gitignore)

---

## 🎯 Post-Deployment Checklist

- ✅ Site loads at Vercel URL
- ✅ Google OAuth login works
- ✅ Can create listings
- ✅ Images upload to Supabase Storage
- ✅ Chat functionality works
- ✅ Admin panel accessible (with admin role)
- ✅ Mobile responsive design works
- ✅ All environment variables set correctly

---

## 🌐 Custom Domain (Optional)

To add a custom domain:

1. Go to Vercel Dashboard → **Settings → Domains**
2. Add your domain (e.g., `ray-marketplace.com`)
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable
5. Add new domain to Google OAuth redirect URIs

---

## 📊 Monitoring

Set up monitoring:

1. **Vercel Analytics**: Enable in Vercel dashboard
2. **Supabase Logs**: Monitor in Supabase Dashboard → Logs
3. **Error Tracking**: Consider adding Sentry or LogRocket

---

**Ready to deploy? Start with Step 1!** 🚀
