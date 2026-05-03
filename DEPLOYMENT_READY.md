# 🎉 RAY Web Apps - Deployment Ready!

Your RAY platform is ready to deploy. Here's everything you need.

---

## 📦 What's Been Configured

### ✅ Firebase Hosting
- `firebase.json` - Hosting config for both apps
- `.firebaserc` - Project targets configured
- SPA routing enabled
- Cache headers optimized

### ✅ Vercel Deployment
- `ray-web/vercel.json` - Web app config
- `ray-admin/vercel.json` - Admin app config
- SPA routing enabled
- Asset caching optimized

### ✅ Automation
- `deploy.bat` - Interactive deployment script (Windows)
- `.github/workflows/deploy-web.yml` - CI/CD pipeline

### ✅ Documentation
- `DEPLOY_WEB_APPS.md` - Complete deployment guide
- `QUICK_DEPLOY.md` - 5-minute quick start
- `PRE_DEPLOYMENT_CHECKLIST.md` - Pre-flight checks

---

## 🚀 Deploy Now (Choose One)

### Option 1: Vercel (Recommended) ⚡

**Why Vercel?**
- Faster global CDN
- Zero configuration
- Automatic HTTPS
- Better for React apps
- Free tier: 100GB bandwidth/month

**Deploy in 5 minutes:**
```bash
# Install CLI
npm install -g vercel

# Deploy web app
cd ray-web
npm run build
vercel --prod

# Deploy admin app
cd ../ray-admin
npm run build
vercel --prod
```

**Done!** You'll get URLs like:
- Web: `https://ray-web.vercel.app`
- Admin: `https://ray-admin.vercel.app`

---

### Option 2: Firebase Hosting 🔥

**Why Firebase?**
- Integrated with Firebase services
- Good for testing
- Simple if already using Firebase

**Deploy:**
```bash
# Install CLI
npm install -g firebase-tools

# Login
firebase login

# Build both apps
cd ray-web && npm run build
cd ../ray-admin && npm run build

# Deploy
cd ..
firebase deploy --only hosting
```

---

### Option 3: Automated Script (Windows)

**Easiest way:**
```bash
deploy.bat
```

Choose option 3 to deploy both apps to Vercel.

---

## 📋 Before You Deploy

Complete the [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md):

**Critical items:**
- [ ] Backend API is live and working
- [ ] Environment variables configured
- [ ] Firebase services enabled
- [ ] Local builds succeed
- [ ] Apps tested locally

---

## 🔧 Environment Variables

After first deployment, add these in your platform dashboard:

### Web App Variables
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FUNCTIONS_BASE_URL=https://your-api.vercel.app
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

### Admin App Variables
```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FUNCTIONS_BASE_URL=https://your-api.vercel.app
```

**Copy from your `.env` files!**

---

## ✅ Post-Deployment Testing

After deployment, verify:

### Web App
- [ ] Home page loads
- [ ] Categories display
- [ ] Search works
- [ ] Login with phone OTP
- [ ] Can post listing
- [ ] Images upload
- [ ] Chat works
- [ ] Mobile responsive

### Admin App
- [ ] Login works
- [ ] Dashboard shows stats
- [ ] Tables load data
- [ ] Can moderate listings
- [ ] Charts display

---

## 🌐 Custom Domains (Optional)

### Vercel
1. Go to project Settings → Domains
2. Add: `ray.rw` (web) and `admin.ray.rw` (admin)
3. Update DNS records as shown

### Firebase
1. Go to Hosting in Firebase Console
2. Click "Add custom domain"
3. Follow DNS setup

---

## 🔄 Continuous Deployment

### GitHub Actions (Automated)

Already configured in `.github/workflows/deploy-web.yml`

**Setup:**
1. Push code to GitHub
2. Add secrets in repo Settings → Secrets:
   - `VERCEL_TOKEN`
   - `VERCEL_ORG_ID`
   - `VERCEL_WEB_PROJECT_ID`
   - `VERCEL_ADMIN_PROJECT_ID`
   - All `VITE_*` variables

**Usage:**
```bash
# Deploy web app only
git commit -m "[web] Update homepage"

# Deploy admin app only
git commit -m "[admin] Fix dashboard"

# Deploy both
git commit -m "[all] Update API integration"
```

---

## 📊 What You'll Have

After deployment:

- ✅ **Web App**: Live for users to browse and post
- ✅ **Admin Dashboard**: Manage platform remotely
- ✅ **Global CDN**: Fast loading worldwide
- ✅ **HTTPS**: Secure by default
- ✅ **Auto-scaling**: Handles traffic spikes
- ✅ **Zero cost**: Free tier for both platforms

---

## 🎯 Deployment Comparison

| Feature | Vercel | Firebase |
|---|---|---|
| **Speed** | ⚡⚡⚡ Fastest | ⚡⚡ Fast |
| **Setup** | 5 min | 10 min |
| **CDN** | Global edge | Global |
| **Bandwidth** | 100GB/mo | 10GB/mo |
| **Custom domain** | Free | Free |
| **Analytics** | Built-in | Via Firebase |
| **Best for** | Production | Testing |

**Recommendation**: Use Vercel for production, Firebase for staging.

---

## 📚 Documentation

- **Quick Start**: [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)
- **Full Guide**: [DEPLOY_WEB_APPS.md](./DEPLOY_WEB_APPS.md)
- **Checklist**: [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)
- **Backend**: [VERCEL_DEPLOYMENT_GUIDE.md](./VERCEL_DEPLOYMENT_GUIDE.md)

---

## 🆘 Troubleshooting

### Build fails
```bash
rm -rf dist node_modules
npm install
npm run build
```

### Environment variables not working
- Must start with `VITE_`
- Add in platform dashboard
- Redeploy after adding

### 404 on page refresh
- Already fixed in `vercel.json` and `firebase.json`
- Redeploy if still happening

### Images not loading
- Check Firebase Storage rules
- Verify Cloudinary config
- Check CORS settings

---

## 🎉 Ready to Launch!

**Estimated time**: 10-15 minutes  
**Cost**: $0/month (free tier)

Choose your deployment method above and follow the steps.

**Questions?** Check the documentation or deployment logs.

---

**Built for East Africa. Kigali-first. 🇷🇼**
