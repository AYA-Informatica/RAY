# Deployment Commands - Quick Reference

## 🚀 Deploy to Vercel (Recommended)

### First Time Setup
```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login
```

### Deploy Web App
```bash
cd ray-web
npm run build
vercel --prod
```

### Deploy Admin App
```bash
cd ray-admin
npm run build
vercel --prod
```

### Deploy Both (One Command Each)
```bash
# From project root
cd ray-web && npm run build && vercel --prod && cd ../ray-admin && npm run build && vercel --prod && cd ..
```

---

## 🔥 Deploy to Firebase Hosting

### First Time Setup
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Set hosting targets (only needed once)
firebase target:apply hosting web ray-production
firebase target:apply hosting admin ray-admin-production
```

### Deploy Web App Only
```bash
cd ray-web
npm run build
cd ..
firebase deploy --only hosting:web
```

### Deploy Admin App Only
```bash
cd ray-admin
npm run build
cd ..
firebase deploy --only hosting:admin
```

### Deploy Both Apps
```bash
# Build both
cd ray-web && npm run build && cd ../ray-admin && npm run build && cd ..

# Deploy both
firebase deploy --only hosting
```

---

## 🤖 Automated Deployment (Windows)

### Interactive Menu
```bash
deploy.bat
```

Options:
1. Deploy Web App to Vercel
2. Deploy Admin App to Vercel
3. Deploy Both to Vercel ⭐ (Recommended)
4. Deploy Web App to Firebase
5. Deploy Admin App to Firebase
6. Deploy Both to Firebase
7. Build Only (no deploy)

---

## 🔧 Build Commands

### Build Web App
```bash
cd ray-web
npm run build
```
Output: `ray-web/dist/`

### Build Admin App
```bash
cd ray-admin
npm run build
```
Output: `ray-admin/dist/`

### Build Both
```bash
cd ray-web && npm run build && cd ../ray-admin && npm run build && cd ..
```

---

## 🧪 Test Builds Locally

### Preview Web App Build
```bash
cd ray-web
npm run build
npm run preview
```
Opens at: http://localhost:4173

### Preview Admin App Build
```bash
cd ray-admin
npm run build
npm run preview
```
Opens at: http://localhost:4173

---

## 🔄 Update & Redeploy

### After Code Changes (Vercel)
```bash
# Web app
cd ray-web
npm run build
vercel --prod

# Admin app
cd ray-admin
npm run build
vercel --prod
```

### After Code Changes (Firebase)
```bash
# Build both
cd ray-web && npm run build && cd ../ray-admin && npm run build && cd ..

# Deploy both
firebase deploy --only hosting
```

---

## 🌐 Check Deployment Status

### Vercel
```bash
# List all deployments
vercel ls

# Check specific project
vercel ls ray-web
vercel ls ray-admin
```

### Firebase
```bash
# List hosting sites
firebase hosting:sites:list

# View deployment history
firebase hosting:channel:list
```

---

## 🔐 Environment Variables

### Add to Vercel (via CLI)
```bash
cd ray-web
vercel env add VITE_FIREBASE_API_KEY

cd ../ray-admin
vercel env add VITE_FIREBASE_API_KEY
```

### Add to Vercel (via Dashboard)
1. Go to https://vercel.com/dashboard
2. Select project (ray-web or ray-admin)
3. Settings → Environment Variables
4. Add each variable
5. Redeploy from Deployments tab

---

## 🧹 Clean & Rebuild

### Clean Web App
```bash
cd ray-web
rm -rf dist node_modules
npm install
npm run build
```

### Clean Admin App
```bash
cd ray-admin
rm -rf dist node_modules
npm install
npm run build
```

### Clean Both
```bash
# Windows
cd ray-web && rmdir /s /q dist node_modules && npm install && npm run build && cd ../ray-admin && rmdir /s /q dist node_modules && npm install && npm run build && cd ..

# Unix/Mac
cd ray-web && rm -rf dist node_modules && npm install && npm run build && cd ../ray-admin && rm -rf dist node_modules && npm install && npm run build && cd ..
```

---

## 📊 Verify Deployment

### Check Web App
```bash
# Replace with your actual URL
curl https://ray-web.vercel.app
curl https://ray-production.web.app
```

### Check Admin App
```bash
# Replace with your actual URL
curl https://ray-admin.vercel.app
curl https://ray-admin-production.web.app
```

### Check API Connection
```bash
# Test from deployed web app
curl https://ray-steel.vercel.app/health
```

---

## 🔧 Troubleshooting Commands

### View Vercel Logs
```bash
vercel logs ray-web
vercel logs ray-admin
```

### View Firebase Logs
```bash
firebase hosting:channel:list
```

### Test Build Locally
```bash
cd ray-web
npm run build
npm run preview
# Open http://localhost:4173 and test
```

### Check Environment Variables
```bash
# Vercel
vercel env ls

# Local
cat ray-web/.env
cat ray-admin/.env
```

---

## 🎯 Production Deployment Checklist

```bash
# 1. Ensure backend is live
curl https://ray-steel.vercel.app/health

# 2. Build both apps
cd ray-web && npm run build && cd ../ray-admin && npm run build && cd ..

# 3. Deploy both to Vercel
cd ray-web && vercel --prod && cd ../ray-admin && vercel --prod && cd ..

# 4. Verify deployments
curl https://ray-web.vercel.app
curl https://ray-admin.vercel.app

# 5. Test functionality
# Open URLs in browser and test all features
```

---

## 📱 Mobile App Deployment (Future)

### Build for Android
```bash
cd ray-mobile
eas build --platform android
```

### Build for iOS
```bash
cd ray-mobile
eas build --platform ios
```

---

## 🔗 Useful Links

- **Vercel Dashboard**: https://vercel.com/dashboard
- **Firebase Console**: https://console.firebase.google.com
- **MongoDB Atlas**: https://cloud.mongodb.com
- **Cloudinary Dashboard**: https://cloudinary.com/console

---

## 💡 Pro Tips

### Faster Deployments
```bash
# Skip build cache
vercel --prod --force

# Deploy specific branch
vercel --prod --branch main
```

### Preview Deployments (Vercel)
```bash
# Deploy to preview URL (not production)
cd ray-web
vercel
```

### Rollback (Vercel)
1. Go to Vercel Dashboard
2. Deployments tab
3. Find previous working deployment
4. Click "Promote to Production"

---

## 🎉 Success Indicators

After deployment, you should see:

✅ Vercel: "Production deployment ready"
✅ Firebase: "Deploy complete!"
✅ Web app loads at production URL
✅ Admin app loads at production URL
✅ No console errors in browser
✅ API calls work (check Network tab)
✅ Login works
✅ Images load

---

**Need help?** See [DEPLOY_WEB_APPS.md](./DEPLOY_WEB_APPS.md) for detailed guide.
