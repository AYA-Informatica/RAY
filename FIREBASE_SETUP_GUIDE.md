# Firebase Project Setup Guide for RAY

**Time Required**: 30-40 minutes  
**Prerequisites**: Google account, Credit card (for Blaze plan)

---

## STEP 1: Create Firebase Project (5 minutes)

1. Open browser and go to: **https://console.firebase.google.com**

2. Click **"Add project"** (or **"Create a project"**)

3. **Project name**: `ray-production`
   - Click **Continue**

4. **Google Analytics**: Enable it
   - Click **Continue**

5. **Analytics account**: Choose existing or create new
   - Analytics location: **Rwanda** (or closest available)
   - Click **Create project**

6. Wait 30-60 seconds for project creation

7. Click **Continue** when ready

---

## STEP 2: Upgrade to Blaze Plan (3 minutes)

**Why?** Cloud Functions require Blaze (pay-as-you-go) plan.

1. In Firebase Console, bottom-left corner, click **"Spark"** (current plan)

2. Click **"Upgrade"**

3. Select **"Blaze - Pay as you go"**

4. Add payment method (credit/debit card)

5. Set budget alert:
   - Amount: **$100/month**
   - Email: Your email
   - Click **Set budget**

6. Click **"Purchase"** or **"Continue"**

---

## STEP 3: Enable Authentication (3 minutes)

1. Left sidebar → Click **"Authentication"**

2. Click **"Get started"**

3. Click **"Sign-in method"** tab

4. Click **"Phone"** provider

5. Click **"Enable"** toggle

6. **Test phone numbers** (optional for development):
   - Phone: `+250788000001` → Code: `123456`
   - Phone: `+250788000002` → Code: `123456`
   - Click **Add**

7. Click **"Save"**

---

## STEP 4: Create Firestore Database (4 minutes)

1. Left sidebar → Click **"Firestore Database"**

2. Click **"Create database"**

3. **Location**: Select **"europe-west1 (Belgium)"**
   - This is closest to Rwanda with good performance
   - Click **Next**

4. **Security rules**: Start in **production mode**
   - We'll deploy custom rules later
   - Click **Enable**

5. Wait 1-2 minutes for database creation

---

## STEP 5: Enable Storage (2 minutes)

1. Left sidebar → Click **"Storage"**

2. Click **"Get started"**

3. **Security rules**: Start in **production mode**
   - Click **Next**

4. **Location**: **europe-west1** (same as Firestore)
   - Click **Done**

---

## STEP 6: Enable Cloud Messaging (2 minutes)

1. Left sidebar → Click **"Cloud Messaging"**

2. Click **"Get started"** (if shown)

3. **Web Push certificates**:
   - Click **"Generate key pair"**
   - Copy the **Key pair** value (save for later)
   - Example: `BHx7Qy...` (long string)

---

## STEP 7: Register Web App (5 minutes)

1. Project Overview (home icon) → Click **"Add app"**

2. Select **Web** icon (`</>`)

3. **App nickname**: `RAY Web`

4. **Firebase Hosting**: ✅ Check this box

5. Click **"Register app"**

6. **Copy the Firebase config** — you'll see something like:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "ray-production.firebaseapp.com",
  projectId: "ray-production",
  storageBucket: "ray-production.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

7. **SAVE THESE VALUES** — you'll need them for `.env` files

8. Click **"Continue to console"**

---

## STEP 8: Register Android App (4 minutes)

1. Project Overview → Click **"Add app"**

2. Select **Android** icon

3. **Android package name**: `rw.ray.app`

4. **App nickname**: `RAY Mobile`

5. Click **"Register app"**

6. Click **"Download google-services.json"**

7. **Save this file** — you'll move it to `ray-mobile/` later

8. Click **"Next"** → **"Next"** → **"Continue to console"**

---

## STEP 9: Register iOS App (4 minutes)

1. Project Overview → Click **"Add app"**

2. Select **iOS** icon

3. **iOS bundle ID**: `rw.ray.app`

4. **App nickname**: `RAY Mobile iOS`

5. Click **"Register app"**

6. Click **"Download GoogleService-Info.plist"**

7. **Save this file** — you'll move it to `ray-mobile/ios/` later

8. Click **"Next"** → **"Next"** → **"Continue to console"**

---

## STEP 10: Get Service Account Key (for CI/CD) (3 minutes)

1. Click **⚙️ Settings** (gear icon) → **"Project settings"**

2. Click **"Service accounts"** tab

3. Click **"Generate new private key"**

4. Click **"Generate key"**

5. A JSON file downloads — **SAVE IT SECURELY**
   - Filename: `ray-production-firebase-adminsdk-xxxxx.json`
   - This is sensitive — never commit to Git

---

## STEP 11: Create Environment Files

Now create `.env` files in all 4 packages using the values from Step 7.

### `ray-web/.env`

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=ray-production.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ray-production
VITE_FIREBASE_STORAGE_BUCKET=ray-production.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_FIREBASE_VAPID_KEY=BHx7Qy...
VITE_APP_URL=https://ray-production.web.app
VITE_APP_ENV=production
```

### `ray-admin/.env`

```env
VITE_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
VITE_FIREBASE_AUTH_DOMAIN=ray-production.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ray-production
VITE_FIREBASE_STORAGE_BUCKET=ray-production.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### `ray-functions/.env`

```env
FIREBASE_STORAGE_BUCKET=ray-production.appspot.com
NODE_ENV=production
MONGODB_URI=mongodb+srv://ray-api:PASSWORD@cluster.xxxxx.mongodb.net/ray?retryWrites=true&w=majority
```

(You'll fill in `MONGODB_URI` after creating MongoDB cluster)

### `ray-mobile/.env`

```env
EXPO_PUBLIC_FIREBASE_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=ray-production.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=ray-production
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=ray-production.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789012:android:abcdef123456
EXPO_PUBLIC_FUNCTIONS_URL=https://us-central1-ray-production.cloudfunctions.net
EXPO_PUBLIC_API_BASE_URL=https://us-central1-ray-production.cloudfunctions.net
```

---

## STEP 12: Initialize Firebase in Project (2 minutes)

Open terminal in your RAY project folder:

```bash
cd "c:\Users\user\Documents\My Projects\RAY"

# Login to Firebase
firebase login

# Select the project
firebase use --add
# Choose: ray-production
# Alias: production
```

---

## STEP 13: Deploy Security Rules & Indexes (2 minutes)

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

Expected output:
```
✔  Deploy complete!
```

---

## ✅ VERIFICATION CHECKLIST

After completing all steps, verify:

- [ ] Firebase project `ray-production` exists
- [ ] Blaze plan is active
- [ ] Phone Authentication is enabled
- [ ] Firestore Database is created (europe-west1)
- [ ] Storage is enabled (europe-west1)
- [ ] Cloud Messaging is enabled
- [ ] Web app is registered
- [ ] Android app is registered (`google-services.json` downloaded)
- [ ] iOS app is registered (`GoogleService-Info.plist` downloaded)
- [ ] Service account key is downloaded
- [ ] All 4 `.env` files are created with real values
- [ ] `firebase use production` works
- [ ] Security rules are deployed
- [ ] Firestore indexes are deployed

---

## 🎯 WHAT YOU'LL HAVE

After this setup:

1. **Firebase Project**: `ray-production`
2. **Project ID**: `ray-production`
3. **Firestore Database**: Ready for chat, notifications
4. **Storage**: Ready for images
5. **Authentication**: Phone OTP ready
6. **Cloud Messaging**: Push notifications ready
7. **Environment Files**: All 4 packages configured

---

## 📝 IMPORTANT FILES TO SAVE

Keep these files secure and NEVER commit to Git:

1. `ray-production-firebase-adminsdk-xxxxx.json` (service account)
2. `google-services.json` (Android)
3. `GoogleService-Info.plist` (iOS)
4. All `.env` files

Add to `.gitignore`:
```
.env
.env.local
.env.production
*.json
!package.json
!tsconfig.json
!firebase.json
GoogleService-Info.plist
google-services.json
*-adminsdk-*.json
```

---

## 🚀 NEXT STEPS

After Firebase setup is complete:

1. ✅ Firebase Project (DONE)
2. ⏭️ Create MongoDB Atlas cluster
3. ⏭️ Deploy Cloud Functions
4. ⏭️ Deploy Web & Admin apps
5. ⏭️ Build Mobile app
6. ⏭️ Test end-to-end

---

**Estimated monthly cost**: $50-150 for first 3 months (scales with usage)

**Support**: If you get stuck, check Firebase Console → ⚙️ → Usage and billing to verify Blaze plan is active.
