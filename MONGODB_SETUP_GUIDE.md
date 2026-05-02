# MongoDB Atlas Setup Guide for RAY

**Time Required**: 20-25 minutes  
**Prerequisites**: Email address, Credit card (optional - free tier available)

---

## STEP 1: Create MongoDB Atlas Account (3 minutes)

1. Open browser and go to: **https://www.mongodb.com/cloud/atlas/register**

2. **Sign up** with:
   - Email address
   - Password
   - OR use **Google Sign-In** (faster)

3. Click **"Create your Atlas account"**

4. Verify your email (check inbox)

5. Click the verification link

6. You'll be redirected to MongoDB Atlas dashboard

---

## STEP 2: Create a New Cluster (5 minutes)

1. You'll see **"Welcome to Atlas"** screen

2. Click **"Build a Database"** (or **"Create"** button)

3. **Choose deployment type**:
   - Select **"M10"** (Dedicated cluster)
   - Why? Production-ready, better performance, 10GB storage
   - Cost: ~$57/month (scales with usage)

   **Alternative for testing**: Select **"M0"** (Free tier)
   - 512MB storage, shared CPU
   - Good for initial testing, upgrade later

4. **Cloud Provider & Region**:
   - Provider: **AWS**
   - Region: **eu-west-1 (Ireland)**
   - Why? Closest to Rwanda with good connectivity
   - Click the region to select it

5. **Cluster Name**: `ray-production`

6. **Additional Settings** (optional):
   - MongoDB Version: **7.0** (latest stable)
   - Backup: **Enabled** (recommended for production)

7. Click **"Create Deployment"** (or **"Create Cluster"**)

8. **Wait 3-5 minutes** for cluster creation
   - You'll see a progress bar
   - Don't close the browser

---

## STEP 3: Create Database User (2 minutes)

While cluster is creating, you'll see a popup: **"Security Quickstart"**

### Option A: If popup appears

1. **Username**: `ray-api`

2. **Password**: Click **"Autogenerate Secure Password"**
   - **COPY THIS PASSWORD** — you'll need it for `.env` file
   - Example: `xK9mP2nQ7vL4wR8s`
   - Save it in a secure place

3. Click **"Create User"**

### Option B: If popup doesn't appear

1. Left sidebar → Click **"Database Access"**

2. Click **"Add New Database User"**

3. **Authentication Method**: Password

4. **Username**: `ray-api`

5. **Password**: Click **"Autogenerate Secure Password"**
   - **COPY THIS PASSWORD**
   - Save it securely

6. **Database User Privileges**: 
   - Select **"Read and write to any database"**

7. **Restrict Access to Specific Clusters**: (leave default)

8. Click **"Add User"**

---

## STEP 4: Configure Network Access (2 minutes)

### Option A: If in Security Quickstart popup

1. **Where would you like to connect from?**
   - Select **"My Local Environment"**

2. **IP Address**: 
   - Enter: `0.0.0.0/0`
   - Description: `Allow from anywhere`
   - Why? Cloud Functions use dynamic IPs

3. Click **"Add Entry"**

4. Click **"Finish and Close"**

### Option B: Manual configuration

1. Left sidebar → Click **"Network Access"**

2. Click **"Add IP Address"**

3. Click **"Allow Access from Anywhere"**
   - This automatically adds `0.0.0.0/0`

4. Description: `Cloud Functions & Development`

5. Click **"Confirm"**

---

## STEP 5: Get Connection String (3 minutes)

1. Left sidebar → Click **"Database"** (or **"Clusters"**)

2. Find your cluster: `ray-production`

3. Click **"Connect"** button

4. Choose connection method: **"Connect your application"**

5. **Driver**: Node.js

6. **Version**: 5.5 or later

7. **Copy the connection string**:
   ```
   mongodb+srv://ray-api:<password>@ray-production.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

8. **IMPORTANT**: Replace `<password>` with the actual password you copied in Step 3

9. **Add database name** to the connection string:
   ```
   mongodb+srv://ray-api:xK9mP2nQ7vL4wR8s@ray-production.xxxxx.mongodb.net/ray?retryWrites=true&w=majority
   ```
   - Notice `/ray?` added before the query parameters

10. **Save this complete connection string** — you'll use it in `.env` files

---

## STEP 6: Create Database & Collections (2 minutes)

1. In Atlas dashboard, click **"Browse Collections"**

2. Click **"Add My Own Data"**

3. **Database Name**: `ray`

4. **Collection Name**: `listings`

5. Click **"Create"**

6. **Add more collections** (click "+ Create Collection"):
   - `users`
   - `reports`
   - `boosts`

7. You should now see 4 collections under the `ray` database

---

## STEP 7: Update Environment Files (3 minutes)

Now update the `MONGODB_URI` in your environment files.

### Update `ray-functions/.env`

Open `ray-functions/.env` and add/update:

```env
MONGODB_URI=mongodb+srv://ray-api:YOUR_PASSWORD_HERE@ray-production.xxxxx.mongodb.net/ray?retryWrites=true&w=majority
FIREBASE_STORAGE_BUCKET=ray-production.appspot.com
NODE_ENV=production
```

**Replace**:
- `YOUR_PASSWORD_HERE` with your actual database password
- `ray-production.xxxxx.mongodb.net` with your actual cluster URL

**Example**:
```env
MONGODB_URI=mongodb+srv://ray-api:xK9mP2nQ7vL4wR8s@ray-production.ab1cd.mongodb.net/ray?retryWrites=true&w=majority
FIREBASE_STORAGE_BUCKET=ray-production.appspot.com
NODE_ENV=production
```

---

## STEP 8: Deploy Database Indexes (5 minutes)

Indexes are critical for query performance. Let's deploy them now.

### 8.1 Install MongoDB driver

Open terminal in your project:

```bash
cd "c:\Users\user\Documents\My Projects\RAY\ray-functions"

npm install mongodb dotenv
```

### 8.2 Run the index deployment script

```bash
node deploy-indexes.js
```

**Expected output**:
```
✅ Connected to MongoDB

📦 Creating indexes for listings collection...
  ✓ status + postedAt
  ✓ status + category + postedAt
  ✓ status + location.district + postedAt
  ✓ status + price
  ✓ seller.id + status
  ✓ isFeatured + status + postedAt
  ✓ text search (title + description + tags)
  ✓ TTL index on expiresAt

👤 Creating indexes for users collection...
  ✓ firebaseUid (unique)
  ✓ phone (unique)
  ✓ location.district
  ✓ location.neighborhood
  ✓ text search (displayName)
  ✓ isBanned + createdAt

🚨 Creating indexes for reports collection...
  ✓ status + createdAt
  ✓ reportedItemId
  ✓ reporterId

🚀 Creating indexes for boosts collection...
  ✓ userId + createdAt
  ✓ listingId
  ✓ status + endDate
  ✓ createdAt (for analytics)

✅ All indexes created successfully!

📊 Index Summary:
  Listings: 9 indexes
  Users: 7 indexes
  Reports: 4 indexes
  Boosts: 5 indexes

🔌 Disconnected from MongoDB
```

### 8.3 Verify indexes in Atlas

1. Go back to Atlas dashboard

2. Click **"Browse Collections"**

3. Select `listings` collection

4. Click **"Indexes"** tab

5. You should see 9 indexes listed

6. Repeat for other collections

---

## STEP 9: Configure Monitoring & Alerts (Optional, 3 minutes)

### 9.1 Enable Performance Advisor

1. Left sidebar → Click **"Performance Advisor"**

2. Click **"Enable"**

3. This will suggest index improvements based on actual queries

### 9.2 Set up Alerts

1. Left sidebar → Click **"Alerts"**

2. Click **"Add Alert"**

3. **Recommended alerts**:
   - **Connections**: Alert when > 80% of max connections
   - **Disk Space**: Alert when > 75% full
   - **CPU Usage**: Alert when > 80% for 5 minutes

4. **Notification method**: Email

5. Click **"Save"**

---

## ✅ VERIFICATION CHECKLIST

After completing all steps, verify:

- [ ] MongoDB Atlas account created
- [ ] Cluster `ray-production` is running (green status)
- [ ] Database user `ray-api` exists
- [ ] Network access allows `0.0.0.0/0`
- [ ] Database `ray` exists with 4 collections
- [ ] Connection string is saved and password replaced
- [ ] `ray-functions/.env` has correct `MONGODB_URI`
- [ ] Index deployment script ran successfully
- [ ] All 25 indexes are created (9+7+4+5)
- [ ] Collections are visible in Atlas dashboard

---

## 🎯 WHAT YOU'LL HAVE

After this setup:

1. **MongoDB Cluster**: `ray-production` (M10 or M0)
2. **Database**: `ray`
3. **Collections**: `listings`, `users`, `reports`, `boosts`
4. **Database User**: `ray-api` with read/write access
5. **Network Access**: Open to all IPs (for Cloud Functions)
6. **Indexes**: 25 indexes deployed for optimal performance
7. **Connection String**: Ready to use in Cloud Functions

---

## 📊 EXPECTED PERFORMANCE

With these indexes, your queries will be fast:

| Query Type | Without Index | With Index |
|---|---|---|
| Search listings by category | 500ms | 5ms |
| Get user by Firebase UID | 200ms | 2ms |
| Filter by location + status | 800ms | 8ms |
| Text search in titles | 1000ms | 15ms |

---

## 💰 COST BREAKDOWN

### M10 Cluster (Production)
- **Base cost**: $57/month
- **Storage**: 10GB included
- **Backup**: $0.20/GB/month
- **Data transfer**: $0.10/GB (outbound)
- **Estimated total**: $60-80/month for first 3 months

### M0 Cluster (Free Tier)
- **Cost**: $0/month
- **Storage**: 512MB
- **Limitations**: Shared CPU, no backups
- **Good for**: Testing, MVP launch
- **Upgrade path**: Can upgrade to M10 anytime

---

## 🔒 SECURITY BEST PRACTICES

1. **Never commit `.env` files** to Git
   - Already in `.gitignore`

2. **Rotate database password** every 90 days
   - Database Access → Edit User → Reset Password

3. **Monitor suspicious activity**
   - Check "Activity Feed" in Atlas dashboard

4. **Enable IP Whitelist** after deployment (optional)
   - Replace `0.0.0.0/0` with specific Cloud Functions IPs

5. **Enable encryption at rest** (M10+ only)
   - Security → Encryption at Rest → Enable

---

## 🐛 TROUBLESHOOTING

### Error: "Authentication failed"
- Check password in connection string
- Ensure no special characters are URL-encoded
- Example: `p@ssw0rd` should be `p%40ssw0rd`

### Error: "Connection timeout"
- Check Network Access allows `0.0.0.0/0`
- Verify cluster is running (green status)
- Check firewall/antivirus isn't blocking port 27017

### Error: "Database not found"
- Ensure `/ray?` is in connection string
- Create database manually in Atlas

### Index deployment fails
- Check `MONGODB_URI` in `.env` file
- Ensure `mongodb` package is installed
- Run `npm install mongodb dotenv` again

---

## 📞 SUPPORT

If you encounter issues:

1. **Atlas Documentation**: https://docs.atlas.mongodb.com
2. **Community Forums**: https://community.mongodb.com
3. **Support Tickets**: Atlas dashboard → Help → Contact Support

---

## 🚀 NEXT STEPS

After MongoDB setup is complete:

1. ✅ Firebase Project (DONE)
2. ✅ MongoDB Cluster (DONE)
3. ⏭️ Deploy Cloud Functions
4. ⏭️ Deploy Web & Admin apps
5. ⏭️ Build Mobile app
6. ⏭️ Test end-to-end

---

## 🔗 QUICK REFERENCE

**Atlas Dashboard**: https://cloud.mongodb.com  
**Cluster Name**: `ray-production`  
**Database Name**: `ray`  
**Database User**: `ray-api`  
**Region**: `eu-west-1` (Ireland)  
**Collections**: `listings`, `users`, `reports`, `boosts`  
**Total Indexes**: 25

---

**Connection String Template**:
```
mongodb+srv://ray-api:PASSWORD@ray-production.xxxxx.mongodb.net/ray?retryWrites=true&w=majority
```

**Remember**: Replace `PASSWORD` and `xxxxx` with your actual values!
