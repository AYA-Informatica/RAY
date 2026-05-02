# Deploy RAY Backend to Vercel (Free Tier)

**Time Required**: 15-20 minutes  
**Cost**: $0/month (Free forever)

---

## ✅ PREPARATION COMPLETE

I've already adapted your Cloud Functions code for Vercel:

- ✅ Created `vercel.json` configuration
- ✅ Created `api/index.js` entry point
- ✅ Created `src/index-vercel.ts` (Vercel-compatible Express app)
- ✅ Added Vercel build script to `package.json`
- ✅ Built successfully with `npm run build:vercel`

---

## STEP 1: Create Vercel Account (2 minutes)

1. Go to: **https://vercel.com/signup**

2. Click **"Continue with GitHub"** (recommended)
   - OR use email signup

3. Authorize Vercel to access your GitHub

4. You'll be redirected to Vercel dashboard

---

## STEP 2: Push Code to GitHub (5 minutes)

### Option A: If you already have a GitHub repo

```bash
cd "c:\Users\user\Documents\My Projects\RAY"
git add .
git commit -m "Adapt backend for Vercel deployment"
git push
```

### Option B: If you don't have a GitHub repo yet

1. Go to: **https://github.com/new**

2. Repository name: `ray-platform`

3. Visibility: **Private** (recommended)

4. Click **"Create repository"**

5. In your terminal:

```bash
cd "c:\Users\user\Documents\My Projects\RAY"

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - RAY platform"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/ray-platform.git

# Push
git branch -M main
git push -u origin main
```

---

## STEP 3: Import Project to Vercel (3 minutes)

1. In Vercel dashboard, click **"Add New..."** → **"Project"**

2. Click **"Import Git Repository"**

3. Find your `ray-platform` repository

4. Click **"Import"**

5. **Configure Project**:
   - **Framework Preset**: Other
   - **Root Directory**: `ray-functions`
   - **Build Command**: `npm run build:vercel`
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

6. Click **"Deploy"** (don't add environment variables yet)

7. Wait 2-3 minutes for initial deployment (it will fail - that's expected)

---

## STEP 4: Add Environment Variables (5 minutes)

1. After deployment fails, click **"Settings"** tab

2. Click **"Environment Variables"** in left sidebar

3. Add these variables one by one:

### Required Variables

| Name | Value | Source |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://ray-api:h50MaWj3j1CgHV3l@ray-production.nparrsr.mongodb.net/ray?retryWrites=true&w=majority&appName=ray-production` | From `ray-functions/.env` |
| `FIREBASE_STORAGE_BUCKET` | `ray-production.firebasestorage.app` | From `ray-functions/.env` |
| `NODE_ENV` | `production` | Set to production |

**How to add each variable**:
1. Click **"Add New"**
2. Name: (from table above)
3. Value: (from table above)
4. Environment: Select **All** (Production, Preview, Development)
5. Click **"Save"**

---

## STEP 5: Redeploy (2 minutes)

1. Go to **"Deployments"** tab

2. Click the **three dots** (•••) on the latest deployment

3. Click **"Redeploy"**

4. Check **"Use existing Build Cache"**

5. Click **"Redeploy"**

6. Wait 2-3 minutes

7. You should see **"Deployment Successful"** ✅

---

## STEP 6: Get Your API URL (1 minute)

1. After successful deployment, click **"Visit"** button

2. You'll see a JSON response:
   ```json
   {
     "name": "RAY API",
     "version": "1.0.0",
     "status": "running",
     "endpoints": [...]
   }
   ```

3. **Copy the URL** from your browser address bar
   - Example: `https://ray-platform-abc123.vercel.app`

4. **Save this URL** - you'll need it for the frontend

---

## STEP 7: Test Your API (2 minutes)

Test the health endpoint:

```bash
# Replace with your actual Vercel URL
curl https://ray-platform-abc123.vercel.app/health
```

Expected response:
```json
{
  "status": "ok",
  "ts": "2025-01-15T10:30:00.000Z"
}
```

Test MongoDB connection:

```bash
curl https://ray-platform-abc123.vercel.app/api/listings/fresh
```

Expected: Empty array `[]` (no listings yet) or error if MongoDB not connected

---

## STEP 8: Update Frontend URLs (5 minutes)

Now update all your frontend apps to use the Vercel API URL.

### Update `ray-web/.env`

```env
VITE_FUNCTIONS_BASE_URL=https://ray-platform-abc123.vercel.app
VITE_API_BASE_URL=https://ray-platform-abc123.vercel.app
```

### Update `ray-admin/.env`

```env
VITE_FUNCTIONS_BASE_URL=https://ray-platform-abc123.vercel.app
VITE_API_BASE_URL=https://ray-platform-abc123.vercel.app
```

### Update `ray-mobile/.env`

```env
EXPO_PUBLIC_FUNCTIONS_URL=https://ray-platform-abc123.vercel.app
EXPO_PUBLIC_API_BASE_URL=https://ray-platform-abc123.vercel.app
```

---

## ✅ VERIFICATION CHECKLIST

After deployment, verify:

- [ ] Vercel deployment shows "Ready" status
- [ ] Health endpoint returns `{"status":"ok"}`
- [ ] API root returns RAY API info
- [ ] MongoDB connection works (test with `/api/listings/fresh`)
- [ ] All 3 frontend `.env` files updated with Vercel URL
- [ ] CORS allows your domains (localhost + production)

---

## 🎯 WHAT YOU'LL HAVE

After completing these steps:

- ✅ **Backend API**: Running on Vercel (free)
- ✅ **MongoDB**: Connected and working
- ✅ **All endpoints**: Available at `https://your-app.vercel.app/api/*`
- ✅ **Automatic deployments**: Every git push deploys automatically
- ✅ **HTTPS**: Automatic SSL certificate
- ✅ **Custom domain**: Can add later (e.g., `api.ray.rw`)

---

## 🚀 NEXT STEPS AFTER BACKEND IS LIVE

1. **Deploy Web App** to Firebase Hosting
   ```bash
   cd ray-web
   npm run build
   firebase deploy --only hosting
   ```

2. **Deploy Admin App** to Firebase Hosting
   ```bash
   cd ray-admin
   npm run build
   firebase deploy --only hosting
   ```

3. **Test End-to-End**
   - Open web app
   - Try to login with phone OTP
   - Try to post a listing
   - Verify data appears in MongoDB

---

## 💡 VERCEL FREE TIER LIMITS

| Resource | Free Tier Limit |
|---|---|
| **Bandwidth** | 100 GB/month |
| **Function Executions** | 100 GB-hours/month |
| **Function Duration** | 10 seconds max |
| **Deployments** | Unlimited |
| **Team Members** | 1 (just you) |

**For RAY platform**: These limits are generous. You can handle ~100K API requests/month easily.

---

## 🔧 TROUBLESHOOTING

### Deployment fails with "Module not found"

**Solution**: Make sure `ray-functions` is set as Root Directory in Vercel project settings.

### API returns 500 error

**Solution**: Check Vercel logs:
1. Go to Vercel dashboard
2. Click your project
3. Click "Functions" tab
4. Click on a function to see logs

### MongoDB connection timeout

**Solution**: 
1. Verify `MONGODB_URI` environment variable is correct
2. Check MongoDB Atlas Network Access allows `0.0.0.0/0`

### CORS errors in browser

**Solution**: Vercel URL is already added to CORS whitelist in `index-vercel.ts`. If you use a custom domain, add it there.

---

## 📞 SUPPORT

If you get stuck:

1. **Check Vercel logs**: Dashboard → Functions → Click function → View logs
2. **Check MongoDB Atlas**: Verify cluster is running
3. **Test locally**: Run `npm run dev` in `ray-functions` to test locally

---

## 🎉 SUCCESS CRITERIA

You'll know it's working when:

1. ✅ Vercel deployment shows "Ready"
2. ✅ `https://your-app.vercel.app/health` returns `{"status":"ok"}`
3. ✅ Web app can make API calls without CORS errors
4. ✅ You can create a listing and it saves to MongoDB

---

**Estimated Total Time**: 15-20 minutes

**Cost**: $0/month (Free forever)

**Next**: After backend is live, deploy the frontend apps to Firebase Hosting.
