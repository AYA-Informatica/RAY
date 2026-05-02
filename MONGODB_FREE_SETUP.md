# MongoDB Atlas FREE Tier Setup for RAY

**Time Required**: 15 minutes  
**Cost**: $0/month (forever)  
**Storage**: 512MB (enough for 10,000+ listings)  
**No credit card required**

---

## Why M0 Free Tier is Perfect for Launch

- **Completely free** - No credit card, no trial period
- **512MB storage** = 10,000 listings + 5,000 users
- **Shared CPU** - Slower but acceptable for MVP
- **Upgrade anytime** - Switch to M10 when you have revenue

---

## STEP 1: Create Account (2 minutes)

1. Go to: **https://www.mongodb.com/cloud/atlas/register**

2. Sign up with **Google** (fastest) or email

3. Verify email if needed

---

## STEP 2: Create FREE Cluster (3 minutes)

1. Click **"Build a Database"**

2. Choose **"M0 FREE"** (the first option)
   - ✅ 512MB storage
   - ✅ Shared RAM
   - ✅ No credit card required

3. **Cloud Provider**: AWS

4. **Region**: **eu-west-1 (Ireland)**
   - Closest to Rwanda

5. **Cluster Name**: `ray-production`

6. Click **"Create Deployment"**

7. Wait 2-3 minutes

---

## STEP 3: Create Database User (2 minutes)

A popup appears: **"Security Quickstart"**

1. **Username**: `ray-api`

2. **Password**: Click **"Autogenerate Secure Password"**
   - **COPY THIS PASSWORD** immediately
   - Example: `xK9mP2nQ7vL4wR8s`
   - Save it in Notepad

3. Click **"Create User"**

---

## STEP 4: Allow Network Access (1 minute)

Still in the popup:

1. **IP Address**: Enter `0.0.0.0/0`
   - This allows Cloud Functions to connect

2. Click **"Add Entry"**

3. Click **"Finish and Close"**

---

## STEP 5: Get Connection String (3 minutes)

1. Click **"Connect"** button on your cluster

2. Choose **"Connect your application"**

3. **Driver**: Node.js

4. **Copy the connection string**:
   ```
   mongodb+srv://ray-api:<password>@ray-production.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

5. **Replace `<password>`** with your actual password from Step 3

6. **Add `/ray?`** before the query parameters:
   ```
   mongodb+srv://ray-api:xK9mP2nQ7vL4wR8s@ray-production.ab1cd.mongodb.net/ray?retryWrites=true&w=majority
   ```

7. **Save this complete string**

---

## STEP 6: Update .env File (2 minutes)

Open `ray-functions/.env` and add:

```env
MONGODB_URI=mongodb+srv://ray-api:YOUR_PASSWORD@ray-production.xxxxx.mongodb.net/ray?retryWrites=true&w=majority
FIREBASE_STORAGE_BUCKET=ray-production.appspot.com
NODE_ENV=production
```

**Replace**:
- `YOUR_PASSWORD` with your actual password
- `xxxxx` with your actual cluster ID

---

## STEP 7: Deploy Indexes (3 minutes)

Open terminal:

```bash
cd "c:\Users\user\Documents\My Projects\RAY\ray-functions"

npm install mongodb dotenv

node deploy-indexes.js
```

**Expected output**:
```
✅ Connected to MongoDB
📦 Creating indexes for listings collection...
  ✓ status + postedAt
  ✓ status + category + postedAt
  ...
✅ All indexes created successfully!
```

---

## ✅ DONE!

You now have:
- ✅ Free MongoDB cluster (512MB)
- ✅ Database user created
- ✅ Connection string in `.env`
- ✅ All indexes deployed
- ✅ Ready for Cloud Functions

---

## Storage Capacity

With 512MB, you can store:

| Data Type | Size per Item | Total Items |
|---|---|---|
| Listings | ~30KB | 10,000+ |
| Users | ~10KB | 5,000+ |
| Reports | ~5KB | 20,000+ |
| Boosts | ~2KB | 50,000+ |

**You're good for your first 10,000 listings!**

---

## When to Upgrade to M10 ($57/month)

Upgrade when you hit:
- 8,000+ active listings
- 400MB+ storage used
- Slow query performance

By then, you'll have revenue from featured listings to cover the cost.

---

## Cost Comparison

| Tier | Cost | Storage | When to Use |
|---|---|---|---|
| **M0** | $0 | 512MB | Launch → 10K listings |
| **M10** | $57/mo | 10GB | 10K+ listings |
| **M20** | $140/mo | 20GB | 50K+ listings |

---

## Monitoring Storage Usage

1. Atlas Dashboard → Click your cluster

2. Click **"Metrics"** tab

3. Check **"Data Size"** graph

4. Upgrade when you reach 400MB (80% full)

---

## 🚀 NEXT STEPS

1. ✅ Firebase Project (DONE)
2. ✅ MongoDB Free Cluster (DONE)
3. ⏭️ Deploy Cloud Functions
4. ⏭️ Deploy Web & Admin apps

---

**No credit card. No trial. Free forever (up to 512MB).**
