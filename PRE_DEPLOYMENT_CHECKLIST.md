# Pre-Deployment Checklist

Complete this checklist before deploying to production.

---

## ✅ Backend Ready

- [ ] Backend API deployed to Vercel
- [ ] MongoDB connected and working
- [ ] API health endpoint returns `{"status":"ok"}`
- [ ] Test endpoint works: `/api/listings/fresh`
- [ ] CORS configured for production domains

**Backend URL**: _________________________

---

## ✅ Environment Variables

### ray-web/.env
- [ ] `VITE_FIREBASE_API_KEY` set
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` set
- [ ] `VITE_FIREBASE_PROJECT_ID` set
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` set
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` set
- [ ] `VITE_FIREBASE_APP_ID` set
- [ ] `VITE_FUNCTIONS_BASE_URL` points to production API
- [ ] `VITE_CLOUDINARY_CLOUD_NAME` set (if using Cloudinary)
- [ ] `VITE_CLOUDINARY_UPLOAD_PRESET` set (if using Cloudinary)

### ray-admin/.env
- [ ] All Firebase variables set
- [ ] `VITE_FUNCTIONS_BASE_URL` points to production API

---

## ✅ Firebase Configuration

- [ ] Phone Authentication enabled
- [ ] Firestore Database created
- [ ] Storage bucket created (or Cloudinary configured)
- [ ] Cloud Messaging enabled
- [ ] Admin user created with custom claims
- [ ] Firestore security rules deployed
- [ ] Storage security rules deployed

---

## ✅ Build Tests

### Test Web App Build
```bash
cd ray-web
npm run build
```
- [ ] Build completes without errors
- [ ] `dist/` folder created
- [ ] `dist/index.html` exists
- [ ] `dist/assets/` contains JS and CSS files

### Test Admin App Build
```bash
cd ray-admin
npm run build
```
- [ ] Build completes without errors
- [ ] `dist/` folder created
- [ ] `dist/index.html` exists

---

## ✅ Local Testing

### Web App (http://localhost:5173)
- [ ] Home page loads
- [ ] Categories display
- [ ] Search works
- [ ] Can view listing details
- [ ] Phone OTP login works
- [ ] Can post a listing
- [ ] Images upload successfully
- [ ] Chat opens (when logged in)

### Admin App (http://localhost:5174)
- [ ] Login page loads
- [ ] Can login with admin account
- [ ] Dashboard shows stats
- [ ] Listings table loads
- [ ] Users table loads
- [ ] Can approve/reject listings
- [ ] Charts render correctly

---

## ✅ Content Ready

- [ ] At least 10 sample listings in database
- [ ] All 8 categories have listings
- [ ] Test user accounts created
- [ ] Admin account verified
- [ ] Sample images uploaded

---

## ✅ Deployment Platform

### Option A: Vercel (Recommended)
- [ ] Vercel account created
- [ ] Vercel CLI installed: `npm install -g vercel`
- [ ] Logged in: `vercel login`

### Option B: Firebase Hosting
- [ ] Firebase CLI installed: `npm install -g firebase-tools`
- [ ] Logged in: `firebase login`
- [ ] Hosting targets configured

---

## ✅ Domain & DNS (Optional)

- [ ] Domain purchased (e.g., ray.rw)
- [ ] DNS provider access
- [ ] SSL certificate (auto with Vercel/Firebase)

---

## ✅ Monitoring & Analytics

- [ ] Google Analytics ID (optional)
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Performance monitoring enabled

---

## ✅ Legal & Compliance

- [ ] Privacy Policy page created
- [ ] Terms of Service page created
- [ ] Cookie consent (if needed)
- [ ] GDPR compliance (if targeting EU)

---

## 🚀 Ready to Deploy?

If all checks pass:

1. Run `deploy.bat` (Windows)
2. Or follow [QUICK_DEPLOY.md](./QUICK_DEPLOY.md)
3. Or see [DEPLOY_WEB_APPS.md](./DEPLOY_WEB_APPS.md) for detailed guide

---

## Post-Deployment Verification

After deployment, test on production URLs:

### Web App
- [ ] Home page loads
- [ ] No console errors
- [ ] Images load
- [ ] Login works
- [ ] Can post listing
- [ ] Search works
- [ ] Mobile responsive

### Admin App
- [ ] Login works
- [ ] Dashboard loads
- [ ] Tables work
- [ ] Can moderate content
- [ ] Charts display

---

**Deployment Date**: _________________________

**Deployed By**: _________________________

**Production URLs**:
- Web: _________________________
- Admin: _________________________
