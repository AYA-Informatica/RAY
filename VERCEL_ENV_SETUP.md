# Fix Vercel Environment Variables

## Critical Issue
The 500 errors are caused by missing/corrupted environment variables in Vercel. Add these exact values:

## Required Environment Variables for Vercel

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

**Add these variables for PRODUCTION:**

```
NEXT_PUBLIC_SUPABASE_URL=https://paocrurwdkwxkbfizgfm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2NydXJ3ZGt3eGtiZml6Z2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NjczNDcsImV4cCI6MjA5NTI0MzM0N30.n0VmLnPhuf4vKFF573vt5ylQyxECJ3_GeYTyDM6u4Oo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBhb2NydXJ3ZGt3eGtiZml6Z2ZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTY2NzM0NywiZXhwIjoyMDk1MjQzMzQ3fQ.QhCovYFn4JKbAdN2W0AxM2Mu5a0TEpzwaqjPwzK4VgE
DATABASE_URL=postgresql://postgres.paocrurwdkwxkbfizgfm:RizJtBVnwCMm7fpX@aws-1-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
DIRECT_URL=postgresql://postgres.paocrurwdkwxkbfizgfm:RizJtBVnwCMm7fpX@aws-1-eu-central-1.pooler.supabase.com:5432/postgres
UPSTASH_REDIS_REST_URL=https://stable-titmouse-66362.upstash.io
UPSTASH_REDIS_REST_TOKEN=gQAAAAAAAQM6AAIgcDE4ZDZjODIyYTc1Zjg0MWRmYjAxZjc2MmQxNzIxNzg5MA
NEXT_PUBLIC_SITE_URL=https://ray-production.vercel.app
NEXT_PUBLIC_SITE_NAME=Ray
ALLOWED_ORIGINS=https://ray-production.vercel.app,https://ray-production-git-main.vercel.app
NODE_ENV=production
CRON_SECRET=262bf2b7a25e54ccd77413d305077efc605471e5e400bcc5f4060cf7042bece608386087ac727c3127b88235aeb5eeed
```

## Steps to Fix:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Find your RAY project** and click on it
3. **Go to Settings** → **Environment Variables**
4. **Add each variable** above (copy-paste each name and value exactly)
5. **Set Environment** to "Production" for each
6. **Redeploy** your site after adding all variables

## Quick Fix Command:
After adding the variables, trigger a new deployment:
```bash
git commit --allow-empty -m "trigger redeploy with env vars"
git push
```

The site should work immediately after the new deployment completes.