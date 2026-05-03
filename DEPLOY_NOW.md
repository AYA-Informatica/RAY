# ✅ RAY Web Apps - Ready to Deploy!

Your apps are built and ready. Follow these steps to deploy:

---

## 🚀 Deploy to Vercel (5 minutes)

### Step 1: Login to Vercel

```bash
vercel login
```

This will open your browser. Choose your login method (GitHub recommended).

### Step 2: Deploy Web App

```bash
cd ray-web
vercel --prod --yes
```

Follow the prompts:
- **Set up and deploy?** → Y
- **Which scope?** → Select your account
- **Link to existing project?** → N
- **Project name?** → ray-web (or press Enter)
- **Directory?** → ./ (press Enter)
- **Override settings?** → N (press Enter)

**Your web app URL will be displayed!** (e.g., `https://ray-web.vercel.app`)

### Step 3: Deploy Admin App

```bash
cd ../ray-admin
npm run build
vercel --prod --yes
```

Follow the same prompts:
- **Project name?** → ray-admin

**Your admin URL will be displayed!** (e.g., `https://ray-admin.vercel.app`)

---

## 🔐 Step 4: Add Environment Variables

For each app in Vercel dashboard (https://vercel.com/dashboard):

### Web App Variables

1. Go to your `ray-web` project
2. Click **Settings** → **Environment Variables**
3. Add these (copy from `ray-web/.env`):

```
VITE_FIREBASE_API_KEY=AIzaSyCj29EkEqgdAQvnTf0WZfnYORMkzBq8vjc
VITE_FIREBASE_AUTH_DOMAIN=ray-production.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=ray-production
VITE_FIREBASE_STORAGE_BUCKET=ray-production.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=631486274245
VITE_FIREBASE_APP_ID=1:631486274245:web:0958ac0aaedf2a388deeac
VITE_FIREBASE_VAPID_KEY=BG1-AEcD10eYrR2SJHy2UBDACn4qolY4v0-hi0ihTX3pxohygROwPDE94OJ2vQa2K7NCyETLevQJvzUMnO8Ucpg
VITE_CLOUDINARY_CLOUD_NAME=dbyduh4i6
VITE_CLOUDINARY_UPLOAD_PRESET=ray_listings
VITE_FUNCTIONS_BASE_URL=https://ray-steel.vercel.app
VITE_API_BASE_URL=https://ray-steel.vercel.app
```

4. For each variable:
   - Click **Add New**
   - Name: (variable name)
   - Value: (variable value)
   - Environment: Select **All**
   - Click **Save**

### Admin App Variables

1. Go to your `ray-admin` project
2. Add the same Firebase variables (skip Cloudinary ones)

### Step 5: Redeploy Both Apps

After adding environment variables:

1. Go to **Deployments** tab
2. Click **•••** on latest deployment
3. Click **Redeploy**
4. Wait 2-3 minutes

---

## ✅ Verify Deployment

### Test Web App
- Open your web app URL
- Home page should load
- Categories should display
- Try searching
- Test login (phone OTP)

### Test Admin App
- Open your admin URL
- Login page should load
- Try logging in with admin account

---

## 🎉 Success!

Your RAY platform is now live:

- ✅ **Web App**: `https://ray-web.vercel.app` (or your custom URL)
- ✅ **Admin App**: `https://ray-admin.vercel.app` (or your custom URL)
- ✅ **Backend API**: `https://ray-steel.vercel.app`

---

## 📝 Build Status

- ✅ `ray-web` - Built successfully (dist/ folder created)
- ⏳ `ray-admin` - Ready to build and deploy

---

## 🔄 Future Deployments

After making changes:

```bash
# Web app
cd ray-web
npm run build
vercel --prod --yes

# Admin app
cd ray-admin
npm run build
vercel --prod --yes
```

---

## 🆘 Troubleshooting

### "Not logged in" error
```bash
vercel login
```

### Build fails
```bash
rm -rf dist node_modules
npm install
npm run build
```

### Environment variables not working
- Make sure they start with `VITE_`
- Redeploy after adding them
- Check Vercel dashboard → Settings → Environment Variables

---

**Need help?** Check the detailed guides:
- [DEPLOYMENT_COMPLETE_SETUP.md](./DEPLOYMENT_COMPLETE_SETUP.md)
- [DEPLOY_WEB_APPS.md](./DEPLOY_WEB_APPS.md)
- [DEPLOYMENT_COMMANDS.md](./DEPLOYMENT_COMMANDS.md)
