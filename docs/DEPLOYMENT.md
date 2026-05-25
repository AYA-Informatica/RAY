# 🚀 RAY Deployment Guide

Complete guide for deploying RAY marketplace to production using Vercel and Supabase.

---

## 📋 Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deploying to Vercel](#deploying-to-vercel)
- [Post-Deployment Configuration](#post-deployment-configuration)
- [Verification & Testing](#verification--testing)
- [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

Before deploying, ensure you have:

- ✅ **Supabase project** set up (paocrurwdkwxkbfizgfm)
- ✅ **Database schema** created and seeded
- ✅ **Google OAuth** configured in Google Cloud Console
- ✅ **Code pushed** to GitHub repository
- ✅ **Upstash Redis** account (for rate limiting)

---

## 🔐 Environment Setup

### Step 1: Generate Secure Secrets

Run this command to generate secure random strings:

```bash
node scripts/generate-secrets.js
```

This generates:
- **CRON_SECRET**: Protects cron job endpoints
- **NEXTAUTH_SECRET**: Session encryption key (optional)

⚠️ **Save these securely!** You'll need them below.

---

### Step 2: Collect Supabase Credentials

#### A. Project URL & API Keys

1. Go to [Supabase Dashboard](https://app.supabase.com/project/paocrurwdkwxkbfizgfm)
2. Navigate to **Project Settings → API**
3. Copy these values:
   - **Project URL**: `https://paocrurwdkwxkbfizgfm.supabase.co`
   - **anon public key**: Starts with `eyJhbG...`
   - **service_role key**: Starts with `eyJhbG...` (**KEEP SECRET!**)

#### B. Database Connection Strings

1. In Supabase Dashboard, go to **Project Settings → Database**
2. Under "Connection string", select **URI** tab
3. Copy both connection strings:
   - **Transaction mode** (port 6543) → Use for `DATABASE_URL`
   - **Session mode** (port 5432) → Use for `DIRECT_URL`

**Example format:**
```env
DATABASE_URL="postgresql://postgres.paocrurwdkwxkbfizgfm:YOUR_PASSWORD@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require"

DIRECT_URL="postgresql://postgres.paocrurwdkwxkbfizgfm:YOUR_PASSWORD@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require"
```

---

### Step 3: Set Up Upstash Redis (Required for Production)

1. Create account at [Upstash Console](https://console.upstash.com)
2. Click **"Create Database"**
3. Choose region closest to your users (e.g., Frankfurt for Europe/Africa)
4. Copy the credentials:
   - **UPSTASH_REDIS_REST_URL**: `https://your-app-name.upstash.io`
   - **UPSTASH_REDIS_REST_TOKEN**: Your base64-encoded token

💡 **Free tier available** — sufficient for MVP launch

---

### Step 4: Configure Google OAuth

**Important:** Google OAuth is configured **inside Supabase**, not in environment variables.

#### A. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services → Credentials**
3. Find your OAuth client ID
4. Add authorized redirect URIs:
   ```
   http://localhost:3000/auth/callback              (development)
   https://your-app.vercel.app/auth/callback        (production - add after deployment)
   ```
5. Copy:
   - **Client ID**: `xxxxx.apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-xxxxx`

#### B. Supabase Configuration

1. In Supabase Dashboard, go to **Authentication → Providers**
2. Find **Google** and click to configure
3. Enable the provider
4. Paste your Google credentials:
   - **Client ID**: From Google Cloud Console
   - **Client Secret**: From Google Cloud Console
5. Click **Save**

✅ That's it! No env vars needed for Google OAuth.

---

### Step 5: Prepare Environment Variables

Create or update your `.env.production` file:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://paocrurwdkwxkbfizgfm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2NydXJ3ZGt3eGtiZml6Z2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NjczNDcsImV4cCI6MjA4NTI0MzM0N30.n0VmLnPhuf4vKFF573vt5ylQyxECJ3_GeYTyDM6u4Oo
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE

# Database URLs
DATABASE_URL=postgresql://postgres.paocrurwdkwxkbfizgfm:RizJtBVnwCMm7fpX@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require
DIRECT_URL=postgresql://postgres.paocrurwdkwxkbfizgfm:RizJtBVnwCMm7fpX@aws-1-eu-central-1.pooler.supabase.com:5432/postgres?sslmode=require

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://your-app.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-token-here

# Google OAuth (already configured in Supabase)
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production

# Security
CRON_SECRET=262bf2b7a25e54ccd77413d305077efc605471e5e400bcc5f4060cf7042bece608386087ac727c3127b88235aeb5eeed
ALLOWED_ORIGINS=https://your-app.vercel.app
```

---

## 🚀 Deploying to Vercel

### Option A: Via Vercel Dashboard (Recommended)

#### Step 1: Import Repository

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your GitHub repository: `AYA-Informatica/RAY`
4. Click **"Import"**

#### Step 2: Configure Build Settings

Vercel will auto-detect Next.js. Verify these settings:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build` (already includes `prisma generate`)
- **Output Directory**: `.next`
- **Install Command**: `npm install` (already includes `prisma generate` via postinstall)

#### Step 3: Add Environment Variables

In the Vercel dashboard, go to **Settings → Environment Variables** and add ALL variables from your `.env.production` file:

**Required Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXT_PUBLIC_APP_URL`
- `CRON_SECRET`
- `ALLOWED_ORIGINS`
- `NODE_ENV`

**Or use Vercel CLI:**
```bash
npm i -g vercel
vercel login
vercel link
vercel env pull .env.production.local
```

#### Step 4: Deploy

Click **"Deploy"** and wait for the build to complete (~2-5 minutes).

---

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

---

## ⚙️ Post-Deployment Configuration

### Step 1: Update Google OAuth Redirect URI

After deployment, Vercel provides your app URL (e.g., `https://ray-[hash].vercel.app`).

1. Go to **Google Cloud Console → APIs & Services → Credentials**
2. Edit your OAuth client
3. Add new redirect URI:
   ```
   https://your-app.vercel.app/auth/callback
   ```
4. Save changes

Also add it in **Supabase Dashboard → Authentication → URL Configuration**

---

### Step 2: Run Database Migrations on Vercel

Your database should already be set up via manual SQL execution. However, if you need to run migrations:

#### Option A: Automatic (Recommended)

The `package.json` already has:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && next build"
  }
}
```

This ensures Prisma Client is generated on every deployment.

#### Option B: Manual via Vercel CLI

```bash
# Link to your project
vercel link

# Pull environment variables
vercel env pull .env.production.local

# Run migrations
npx prisma migrate deploy --schema=./prisma/schema.prisma
```

---

### Step 3: Configure Cron Jobs

The `vercel.json` already includes cron job configuration:

```json
{
  "crons": [
    {
      "path": "/api/cron/expire-listings",
      "schedule": "0 3 * * *"
    }
  ]
}
```

This runs daily at 3 AM UTC to expire old listings.

**Verify it works:**
1. Go to Vercel Dashboard → **Functions**
2. Check logs for `/api/cron/expire-listings`
3. Ensure it returns 200 status

---

### Step 4: Set Custom Domain (Optional)

1. Go to Vercel Dashboard → **Settings → Domains**
2. Add your domain (e.g., `ray-marketplace.com`)
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_APP_URL` environment variable
5. Add new domain to Google OAuth redirect URIs

---

## ✅ Verification & Testing

### Post-Deployment Checklist

After deployment completes, verify these work:

- [ ] Site loads at Vercel URL
- [ ] Google OAuth login works
- [ ] Can browse categories
- [ ] Can create a listing with images
- [ ] Images upload to Supabase Storage
- [ ] Search and filters work
- [ ] Real-time chat works
- [ ] Favorites system works
- [ ] Admin panel accessible (with admin role)
- [ ] Mobile responsive design works
- [ ] Both English and Kinyarwanda languages work
- [ ] PWA installs on mobile
- [ ] Dark mode displays correctly
- [ ] Rate limiting active (test rapid API calls)
- [ ] Cron job runs (check Vercel Function logs)

---

### Testing Critical Flows

1. **Google Sign-In**
   - Click "Sign in with Google"
   - Complete authentication
   - Verify user appears in Supabase User table

2. **Create Listing**
   - Click "Sell" button
   - Fill in all fields
   - Upload images
   - Submit and verify listing appears

3. **Search & Filter**
   - Search by keyword
   - Filter by category
   - Filter by price range
   - Verify results are correct

4. **Chat Functionality**
   - Start conversation with seller
   - Send messages
   - Verify real-time updates
   - Check message persistence

5. **Rate Limiting**
   - Make rapid API requests
   - Verify 429 status after threshold
   - Check Upstash Redis logs

---

## 🚨 Troubleshooting

### Issue: Database connection fails on Vercel

**Symptoms:** Error P1001 or timeout errors

**Solution:**
- Verify `DATABASE_URL` uses pooler connection (port 6543)
- Ensure SSL mode is enabled: `?sslmode=require`
- Check Vercel logs for specific error messages
- Verify Supabase project is not paused

---

### Issue: Google OAuth callback fails

**Symptoms:** "Redirect URI mismatch" error

**Solution:**
- Add your Vercel URL to Google Cloud Console authorized redirect URIs:
  ```
  https://your-app.vercel.app/auth/callback
  ```
- Also add it in Supabase Dashboard → Authentication → URL Configuration
- Ensure exact match (no trailing slashes, correct protocol)

---

### Issue: Build fails with Prisma errors

**Symptoms:** "Cannot find module @prisma/client" or similar

**Solution:**
- Make sure `prisma generate` runs before build
- Verify `"postinstall": "prisma generate"` exists in package.json
- Check that `schema.prisma` is included in git (not in .gitignore)
- Review Vercel build logs for specific errors

---

### Issue: Rate limiter not working

**Symptoms:** No 429 responses despite rapid requests

**Solution:**
- Verify Upstash Redis credentials are correct
- Check Upstash database is active in console
- Test Redis connection manually
- Review API route logs for errors

---

### Issue: Cron job not running

**Symptoms:** Listings not expiring automatically

**Solution:**
- Verify `CRON_SECRET` matches in both Vercel env vars and endpoint
- Check Vercel Function logs for `/api/cron/expire-listings`
- Ensure cron endpoint returns 200 status
- Verify schedule syntax in `vercel.json`

---

### Issue: Images not uploading

**Symptoms:** Upload fails or images not displaying

**Solution:**
- Verify Supabase Storage bucket exists and is public
- Check storage policies in Supabase Dashboard
- Ensure `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Review browser console for CORS errors

---

## 📊 Monitoring & Maintenance

### Set Up Monitoring

1. **Vercel Analytics**
   - Enable in Vercel dashboard
   - Track page views and performance

2. **Supabase Logs**
   - Monitor in Supabase Dashboard → Logs
   - Watch for database errors

3. **Error Tracking** (Optional)
   - Consider adding Sentry or LogRocket
   - Track frontend errors

4. **Vercel Function Logs**
   - Monitor API route performance
   - Check cron job execution

---

### Regular Maintenance Tasks

- **Weekly**: Check Vercel analytics for traffic patterns
- **Monthly**: Review Supabase database size and optimize queries
- **Quarterly**: Update dependencies (`npm outdated`, `npm update`)
- **As needed**: Monitor and rotate secrets if compromised

---

## 🎯 Quick Reference

### Essential Commands

```bash
# Local development
npm run dev                    # Start dev server
npm run build                  # Build for production
npm run prisma:generate        # Generate Prisma client
npm run prisma:studio          # Open Prisma Studio

# Deployment
git push origin main           # Push to GitHub
vercel --prod                  # Deploy to production
vercel logs                    # View deployment logs

# Database
npx prisma migrate deploy      # Run migrations
npx prisma studio              # Visual DB browser
```

### Important URLs

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Supabase Dashboard**: https://app.supabase.com/project/paocrurwdkwxkbfizgfm
- **GitHub Repository**: https://github.com/AYA-Informatica/RAY
- **Google Cloud Console**: https://console.cloud.google.com
- **Upstash Console**: https://console.upstash.com

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
- [Upstash Redis Docs](https://docs.upstash.com/redis)

---

**Last Updated:** 2026-05-25  
**Status:** ✅ Production Ready
