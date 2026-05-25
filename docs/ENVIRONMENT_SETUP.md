# 🔐 RAY Environment Configuration Guide

This guide walks you through setting up all required environment variables for production deployment.

---

## 📋 Quick Start Checklist

### Step 1: Generate Secure Secrets ✅

Run this command to generate secure random strings:

```bash
node scripts/generate-secrets.js
```

**Generated Secrets:**
- **CRON_SECRET**: `262bf2b7a25e54ccd77413d305077efc605471e5e400bcc5f4060cf7042bece608386087ac727c3127b88235aeb5eeed`
- **NEXTAUTH_SECRET** (optional): `c8ccaf00ebfee709db1bd86dd363dd4ba513842909460ed699bd86826e6a68d0`

⚠️ **Save these securely!** You'll need them below.

---

### Step 2: Get Supabase Credentials

#### A. Project URL & API Keys
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Project Settings → API**
4. Copy these values:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: Starts with `eyJhbG...`
   - **service_role key**: Starts with `eyJhbG...` (KEEP SECRET!)

#### B. Database Connection Strings
1. In Supabase Dashboard, go to **Project Settings → Database**
2. Under "Connection string", select **URI** tab
3. Copy both connection strings:
   - **Transaction mode** (port 6543) → Use for `DATABASE_URL`
   - **Session mode** (port 5432) → Use for `DIRECT_URL`

**Example format:**
```
DATABASE_URL="postgresql://postgres.xxxxxxxxxxxx:YOUR_PASSWORD@aws-0-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1"

DIRECT_URL="postgresql://postgres.xxxxxxxxxxxx:YOUR_PASSWORD@aws-0-eu-west-1.pooler.supabase.com:5432/postgres"
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

### Step 4: Configure Google OAuth in Supabase

**Important:** Google OAuth is configured **inside Supabase**, not in environment variables.

#### A. Google Cloud Console Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Navigate to **APIs & Services → Credentials**
4. Click **"Create Credentials" → "OAuth client ID"**
5. Application type: **Web application**
6. Add authorized redirect URIs:
   ```
   http://localhost:3000/auth/callback              (development)
   https://ray.rw/auth/callback                      (production)
   ```
7. Copy:
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

### Step 5: Create Your .env File

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Then fill in the values:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Database
DATABASE_URL="postgresql://postgres.xxx:PASSWORD@aws-0-region.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.xxx:PASSWORD@aws-0-region.pooler.supabase.com:5432/postgres"

# Upstash Redis
UPSTASH_REDIS_REST_URL="https://your-app.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token-here"

# App
NEXT_PUBLIC_SITE_URL="http://localhost:3000"  # Change to https://ray.rw for production
ALLOWED_ORIGINS="http://localhost:3000"        # Change to https://ray.rw for production

# Security
CRON_SECRET="262bf2b7a25e54ccd77413d305077efc605471e5e400bcc5f4060cf7042bece608386087ac727c3127b88235aeb5eeed"
```

---

### Step 6: Test Locally

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:deploy

# Seed database with initial data
npm run db:seed

# Build and test production build
npm run build
npm start
```

**Test these critical flows:**
- ✅ Google Sign-In works
- ✅ Can create a listing
- ✅ Can search and filter
- ✅ Can send messages
- ✅ Rate limiting works (try rapid requests)

---

### Step 7: Deploy to Vercel

#### A. Push to GitHub
```bash
git add .
git commit -m "Production ready with env config"
git push origin main
```

#### B. Import to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Click **"New Project"**
3. Import your GitHub repository
4. Configure build settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `prisma generate && next build`
   - **Output Directory**: `.next`

#### C. Add Environment Variables in Vercel
Go to **Settings → Environment Variables** and add ALL variables from your `.env` file.

**Or use Vercel CLI:**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add DATABASE_URL
vercel env add DIRECT_URL
vercel env add UPSTASH_REDIS_REST_URL
vercel env add UPSTASH_REDIS_REST_TOKEN
vercel env add NEXT_PUBLIC_SITE_URL
vercel env add ALLOWED_ORIGINS
vercel env add CRON_SECRET
```

#### D. Deploy
```bash
vercel --prod
```

---

## 🔍 Verification Checklist

After deployment, verify these work:

- [ ] Visit production URL loads correctly
- [ ] Google OAuth sign-in works
- [ ] Can create a listing with images
- [ ] Search and filters work
- [ ] Real-time chat works
- [ ] Cron job runs (check Vercel Function logs)
- [ ] Rate limiting active (test rapid API calls)
- [ ] PWA installs on mobile
- [ ] Dark mode displays correctly
- [ ] Both English and Kinyarwanda languages work

---

## 🚨 Common Issues & Solutions

### Issue: "Invalid API key" error
**Solution:** Double-check Supabase keys are correct and not swapped (anon vs service_role)

### Issue: Database connection timeout
**Solution:** 
- Ensure `DATABASE_URL` uses port 6543 (pooled)
- Ensure `DIRECT_URL` uses port 5432 (direct)
- Check Supabase project isn't paused

### Issue: Google OAuth redirect mismatch
**Solution:** Verify redirect URI in both Google Cloud Console AND Supabase match exactly (including trailing slashes)

### Issue: Rate limiter not working
**Solution:** Ensure Upstash Redis credentials are correct and database is active

### Issue: Cron job not running
**Solution:** 
- Verify `CRON_SECRET` matches in both Vercel env vars and vercel.json
- Check Vercel Function logs for errors
- Ensure cron endpoint returns 200 status

---

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Upstash Redis Docs](https://docs.upstash.com/redis)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

---

## 🆘 Need Help?

If you encounter issues:
1. Check Vercel deployment logs
2. Review Supabase logs in dashboard
3. Test endpoints locally first
4. Verify all environment variables are set correctly
5. Check browser console for client-side errors

---

**Last Updated:** 2026-05-24  
**Status:** ✅ Ready for Production Deployment
