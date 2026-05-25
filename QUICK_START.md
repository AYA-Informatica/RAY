# 🚀 RAY Quick Start - Environment Setup

## ⚡ 5-Minute Setup

### 1. Copy the template
```bash
cp .env.example .env
```

### 2. Fill in these 7 values in `.env`:

```env
NEXT_PUBLIC_SUPABASE_URL="https://xxx.supabase.co"          # From Supabase Dashboard
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."                       # From Supabase Dashboard  
SUPABASE_SERVICE_ROLE_KEY="eyJ..."                           # From Supabase Dashboard (SECRET!)
DATABASE_URL="postgresql://..."                              # From Supabase (port 6543)
DIRECT_URL="postgresql://..."                                # From Supabase (port 5432)
UPSTASH_REDIS_REST_URL="https://xxx.upstash.io"             # From Upstash Console
UPSTASH_REDIS_REST_TOKEN="your-token"                        # From Upstash Console
```

**Already configured for you:** ✅
- `CRON_SECRET` - Secure random string generated
- `NEXT_PUBLIC_SITE_URL` - Set to localhost for dev
- `ALLOWED_ORIGINS` - Set to localhost for dev

### 3. Configure Google OAuth (in Supabase, not .env)
- Go to Supabase → Authentication → Providers → Google
- Enable it and add your Google Cloud credentials

### 4. Test it
```bash
npm install
npm run prisma:deploy
npm run db:seed
npm run dev
```

---

## 📍 Where to Get Credentials

| Credential | Location |
|------------|----------|
| Supabase URL & Keys | Supabase Dashboard → Settings → API |
| Database URLs | Supabase Dashboard → Settings → Database |
| Upstash Redis | [Upstash Console](https://console.upstash.com) |
| Google OAuth | [Google Cloud Console](https://console.cloud.google.com/) |

---

## 🎯 Production Deployment to Vercel

1. **Push to GitHub**
   ```bash
   git add . && git commit -m "Ready for production" && git push
   ```

2. **Import to Vercel** at [vercel.com](https://vercel.com)

3. **Add environment variables** in Vercel Dashboard → Settings → Environment Variables
   - Copy all values from your `.env` file

4. **Deploy**
   ```bash
   vercel --prod
   ```

---

## 🔧 Common Commands

```bash
# Generate new secrets if needed
node scripts/generate-secrets.js

# Test database connection
npx prisma db pull

# Run migrations
npm run prisma:deploy

# Seed database
npm run db:seed

# Build for production
npm run build

# Start production server
npm start
```

---

## 📖 Full Documentation

- **Complete Guide**: [`docs/ENVIRONMENT_SETUP.md`](docs/ENVIRONMENT_SETUP.md)
- **Checklist**: [`docs/ENVIRONMENT_CHECKLIST.md`](docs/ENVIRONMENT_CHECKLIST.md)

---

## 🆘 Need Help?

1. Check that all env vars are set correctly
2. Verify Supabase project is active (not paused)
3. Test Google OAuth redirect URIs match exactly
4. Check Vercel deployment logs for errors
5. Review browser console for client-side errors

---

**That's it!** Fill in the 7 values above and you're ready to go. 🎉
