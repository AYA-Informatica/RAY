# RAY Platform — Production Deployment Guide

**Last Updated**: January 2025  
**Estimated Time**: 3-4 hours  
**Prerequisites**: Firebase account, MongoDB Atlas account, GitHub account

---

## 📋 Pre-Deployment Checklist

Before starting deployment, ensure you have:

- [ ] Firebase account (Blaze plan required for Cloud Functions)
- [ ] MongoDB Atlas account (free tier OK for testing)
- [ ] GitHub account (for CI/CD)
- [ ] Domain name (optional: ray.rw)
- [ ] Google Cloud account (for Maps API)
- [ ] Apple Developer account (for iOS builds)
- [ ] Google Play Console account (for Android builds)

---

## STEP 1: Firebase Project Setup (30 minutes)

### 1.1 Create Firebase Project

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click "Add project"
3. Project name: `ray-production`
4. Enable Google Analytics: Yes
5. Choose Analytics location: Rwanda
6. Click "Create project"

### 1.2 Upgrade to Blaze Plan

1. In Firebase Console → Settings → Usage and billing
2. Click "Modify plan"
3. Select "Blaze (Pay as you go)"
4. Add payment method
5. Set budget alert: $100/month

### 1.3 Enable Authentication

1. Go to Authentication → Sign-in method
2. Enable "Phone" provider
3. Add test phone numbers (optional):
   - +250788000001 → Code: 123456
   - +250788000002 → Code: 123456

### 1.4 Create Firestore Database

1. Go to Firestore Database
2. Click "Create database"
3. Start in **production mode**
4. Location: `europe-west1` (closest to Rwanda)
5. Click "Enable"

### 1.5 Enable Storage

1. Go to Storage
2. Click "Get started"
3. Start in **production mode**
4. Location: `europe-west1`
5. Click "Done"

### 1.6 Enable Cloud Messaging

1. Go to Cloud Messaging
2. Click "Get started"
3. Generate Web Push certificate
4. Save the key pair (needed for service worker)

### 1.7 Register Apps

**Web App:**
1. Project Overview → Add app → Web
2. App nickname: `RAY Web`
3. Check "Also set up Firebase Hosting"
4. Register app
5. Copy config values (save for later)

**Android App:**
1. Project Overview → Add app → Android
2. Package name: `rw.ray.app`
3. Register app
4. Download `google-services.json`
5. Save to `ray-mobile/` directory

**iOS App:**
1. Project Overview → Add app → iOS
2. Bundle ID: `rw.ray.app`
3. Register app
4. Download `GoogleService-Info.plist`
5. Save to `ray-mobile/ios/` directory

### 1.8 Deploy Security Rules

```bash
cd RAY_complete
firebase deploy --only firestore:rules
firebase deploy --only storage:rules
```

### 1.9 Deploy Firestore Indexes

```bash
firebase deploy --only firestore:indexes
```

---

## STEP 2: MongoDB Atlas Setup (20 minutes)

### 2.1 Create Cluster

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Click "Build a Database"
3. Choose **M10** (production tier)
4. Provider: AWS
5. Region: `eu-west-1` (Ireland — closest to Rwanda)
6. Cluster name: `ray-production`
7. Click "Create"

### 2.2 Create Database User

1. Security → Database Access
2. Click "Add New Database User"
3. Authentication: Password
4. Username: `ray-api`
5. Password: Generate secure password (save it!)
6. Database User Privileges: Read and write to any database
7. Click "Add User"

### 2.3 Configure Network Access

1. Security → Network Access
2. Click "Add IP Address"
3. Add `0.0.0.0/0` (allow from anywhere)
   - **Note**: Cloud Functions use dynamic IPs
4. Click "Confirm"

### 2.4 Get Connection String

1. Databases → Connect
2. Choose "Connect your application"
3. Driver: Node.js, Version: 5.5 or later
4. Copy connection string
5. Replace `<password>` with your database user password
6. Save for `.env` file

### 2.5 Deploy Indexes

```bash
cd ray-functions
npm install mongodb dotenv
node deploy-indexes.js
```

Expected output:
```
✅ Connected to MongoDB
📦 Creating indexes for listings collection...
  ✓ status + postedAt
  ✓ status + category + postedAt
  ...
✅ All indexes created successfully!
```

---

## STEP 3: Environment Variables (15 minutes)

### 3.1 Create `ray-web/.env`

```bash
cd ray-web
cp .env.example .env
```

Edit `.env`:
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=ray-production.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ray-production
VITE_FIREBASE_STORAGE_BUCKET=ray-production.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GOOGLE_MAPS_API_KEY=AIzaSy...
VITE_APP_URL=https://ray.rw
VITE_APP_ENV=production
```

### 3.2 Create `ray-admin/.env`

```bash
cd ../ray-admin
cp .env.example .env
```

Use same Firebase config as `ray-web/.env`

### 3.3 Create `ray-functions/.env`

```bash
cd ../ray-functions
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb+srv://ray-api:YOUR_PASSWORD@ray-production.xxxxx.mongodb.net/ray?retryWrites=true&w=majority
FIREBASE_STORAGE_BUCKET=ray-production.appspot.com
NODE_ENV=production
```

### 3.4 Create `ray-mobile/.env`

```bash
cd ../ray-mobile
cp .env.example .env
```

Edit `.env`:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSy...
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=ray-production.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=ray-production
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=ray-production.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:android:abc123
EXPO_PUBLIC_FUNCTIONS_URL=https://us-central1-ray-production.cloudfunctions.net
# Optional backward-compatible alias:
EXPO_PUBLIC_API_BASE_URL=https://us-central1-ray-production.cloudfunctions.net
```

---

## STEP 4: Deploy Cloud Functions (30 minutes)

### 4.1 Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 4.2 Initialize Firebase Project

```bash
cd RAY_complete
firebase use --add
# Select: ray-production
# Alias: production
```

### 4.3 Build Functions

```bash
cd ray-functions
npm install
npm run build
```

### 4.4 Deploy Functions

```bash
firebase deploy --only functions
```

Expected output:
```
✔  functions: Finished running predeploy script.
i  functions: preparing codebase default for deployment
i  functions: ensuring required API cloudfunctions.googleapis.com is enabled...
✔  functions: required API cloudfunctions.googleapis.com is enabled
i  functions: preparing functions directory for uploading...
✔  functions[api(us-central1)]: Successful create operation.
✔  Deploy complete!
```

### 4.5 Test API Endpoint

```bash
curl https://us-central1-ray-production.cloudfunctions.net/api/health
```

Expected response:
```json
{"status":"ok","ts":"2025-01-15T10:30:00.000Z"}
```

---

## STEP 5: Deploy Web App (20 minutes)

### 5.1 Build Web App

```bash
cd ray-web
npm install
npm run build
```

### 5.2 Deploy to Firebase Hosting

```bash
firebase deploy --only hosting
```

### 5.3 Test Web App

Open browser: `https://ray-production.web.app`

Expected: RAY homepage loads with categories

---

## STEP 6: Deploy Admin Dashboard (15 minutes)

### 6.1 Configure Firebase Hosting for Admin

Edit `firebase.json`:
```json
{
  "hosting": [
    {
      "target": "web",
      "public": "ray-web/dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    },
    {
      "target": "admin",
      "public": "ray-admin/dist",
      "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
      "rewrites": [{ "source": "**", "destination": "/index.html" }]
    }
  ]
}
```

### 6.2 Build Admin Dashboard

```bash
cd ray-admin
npm install
npm run build
```

### 6.3 Deploy Admin Dashboard

```bash
firebase target:apply hosting admin ray-production
firebase deploy --only hosting:admin
```

---

## STEP 7: Create Admin User (10 minutes)

### 7.1 Create User via Web App

1. Open `https://ray-production.web.app`
2. Click "Login"
3. Enter your phone number
4. Complete OTP verification
5. Set up profile

### 7.2 Set Admin Role

```bash
firebase functions:shell
```

In shell:
```javascript
const admin = require('firebase-admin')
admin.initializeApp()

// Replace with your Firebase UID
const uid = 'YOUR_FIREBASE_UID'
admin.auth().setCustomUserClaims(uid, { role: 'admin' })
  .then(() => console.log('✅ Admin role set'))
```

### 7.3 Test Admin Access

1. Open `https://admin.ray.rw` (or Firebase URL)
2. Login with admin account
3. Verify dashboard loads

---

## STEP 8: Build Mobile App (45 minutes)

### 8.1 Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 8.2 Configure EAS Project

```bash
cd ray-mobile
eas init --id YOUR_EAS_PROJECT_ID
```

### 8.3 Build Android APK (Preview)

```bash
eas build --platform android --profile preview
```

Wait 10-15 minutes for build to complete.

### 8.4 Download and Test APK

1. Download APK from EAS dashboard
2. Install on Android device
3. Test login, post ad, chat

### 8.5 Build Production Bundle (Optional)

```bash
eas build --platform android --profile production
```

---

## STEP 9: Set Up CI/CD (30 minutes)

### 9.1 Create GitHub Repository

```bash
cd RAY_complete
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/ray-platform.git
git push -u origin main
```

### 9.2 Add GitHub Secrets

Go to GitHub → Settings → Secrets and variables → Actions

Add secrets:
- `FIREBASE_SERVICE_ACCOUNT`: JSON from Firebase Console → Project Settings → Service Accounts
- `FIREBASE_TOKEN`: Run `firebase login:ci` and copy token
- `FIREBASE_PROJECT_ID`: `ray-production`
- `VITE_FIREBASE_API_KEY`: From Firebase config
- `VITE_FIREBASE_AUTH_DOMAIN`: From Firebase config
- `VITE_FIREBASE_PROJECT_ID`: From Firebase config
- `VITE_FIREBASE_STORAGE_BUCKET`: From Firebase config
- `VITE_FIREBASE_MESSAGING_SENDER_ID`: From Firebase config
- `VITE_FIREBASE_APP_ID`: From Firebase config

### 9.3 Test CI/CD

```bash
git commit --allow-empty -m "Test CI/CD"
git push
```

Check GitHub Actions tab for deployment status.

---

## STEP 10: Post-Deployment Verification (20 minutes)

### 10.1 Smoke Tests

- [ ] Web app loads at production URL
- [ ] User can login with phone OTP
- [ ] User can post a listing with images
- [ ] User can search listings
- [ ] User can send chat message
- [ ] Admin can login to dashboard
- [ ] Admin can approve/reject listings
- [ ] Mobile app connects to production API

### 10.2 Performance Tests

```bash
# Install k6
brew install k6  # macOS
choco install k6  # Windows

# Run load test
k6 run load-test.js
```

Target: 100 concurrent users, <500ms response time

### 10.3 Security Audit

- [ ] Firestore rules tested (no unauthorized access)
- [ ] Storage rules tested (no unauthorized uploads)
- [ ] Rate limiting working (429 errors after limit)
- [ ] Admin routes protected (401 for non-admins)
- [ ] HTTPS enforced (no HTTP access)

---

## 🎉 Launch Complete!

Your RAY platform is now live in production.

**Next Steps**:
1. Monitor Firebase Console for errors
2. Check MongoDB Atlas for query performance
3. Set up Sentry for error tracking
4. Create 50 seed listings for testing
5. Invite 100 beta users
6. Collect feedback and iterate

---

## 📞 Support

If you encounter issues:
1. Check Firebase Console → Functions → Logs
2. Check MongoDB Atlas → Metrics
3. Check GitHub Actions → Workflow runs
4. Review `LAUNCH_READINESS_ANALYSIS.md`

**Common Issues**:
- **Functions timeout**: Increase memory in `index.ts` (512MB → 1GB)
- **Firestore permission denied**: Check `firestore.rules`
- **MongoDB connection failed**: Check network access whitelist
- **Build failed**: Check Node.js version (must be 20)

---

*Built for East Africa. Kigali-first. Speed, trust, and local relevance.* 🇷🇼
