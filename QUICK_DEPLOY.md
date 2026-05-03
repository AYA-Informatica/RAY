# 🚀 Quick Deploy - RAY Web Apps

## Fastest Way to Deploy (5 minutes)

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Deploy Web App
```bash
cd ray-web
npm run build
vercel --prod
```

### 3. Deploy Admin App
```bash
cd ../ray-admin
npm run build
vercel --prod
```

**Done!** ✅

---

## Or Use the Automated Script

### Windows
```bash
deploy.bat
```

Choose option 3 to deploy both apps.

---

## Environment Variables Needed

After first deployment, add these in Vercel dashboard:

### Web App (ray-web)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FUNCTIONS_BASE_URL=
VITE_CLOUDINARY_CLOUD_NAME=
VITE_CLOUDINARY_UPLOAD_PRESET=
```

### Admin App (ray-admin)
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FUNCTIONS_BASE_URL=
```

Copy values from your `.env` files.

---

## Verify Deployment

### Web App
- Home page loads
- Can browse categories
- Search works
- Login with phone OTP

### Admin App
- Login page loads
- Dashboard shows stats
- Tables load data

---

## Troubleshooting

### Build fails
```bash
# Clear and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Environment variables not working
1. Go to Vercel project settings
2. Add all variables
3. Redeploy from Deployments tab

---

**Need help?** See [DEPLOY_WEB_APPS.md](./DEPLOY_WEB_APPS.md) for detailed guide.
