# Deploy RAY Web Apps

**Time**: 10-15 minutes  
**Cost**: $0/month (Free tier)

---

## Choose Your Deployment Platform

### Option A: Vercel (Recommended) ⚡
- Faster global CDN
- Automatic HTTPS
- Zero config needed
- Better for React apps
- **Best for production**

### Option B: Firebase Hosting 🔥
- Integrated with Firebase services
- Good for testing
- Simpler if already using Firebase

---

## OPTION A: Deploy to Vercel (Recommended)

### 1. Build Both Apps

```bash
# Build web app
cd ray-web
npm run build

# Build admin app
cd ../ray-admin
npm run build
```

### 2. Install Vercel CLI

```bash
npm install -g vercel
```

### 3. Deploy Web App

```bash
cd ray-web
vercel --prod
```

Follow prompts:
- **Set up and deploy?** → Y
- **Which scope?** → Your account
- **Link to existing project?** → N
- **Project name?** → ray-web
- **Directory?** → ./
- **Override settings?** → N

**Your web app URL**: `https://ray-web.vercel.app`

### 4. Deploy Admin App

```bash
cd ../ray-admin
vercel --prod
```

Follow prompts:
- **Project name?** → ray-admin

**Your admin URL**: `https://ray-admin.vercel.app`

### 5. Add Environment Variables

For each app in Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add variables from `.env` files
3. Click **Redeploy** from Deployments tab

---

## OPTION B: Deploy to Firebase Hosting

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 2. Login to Firebase

```bash
firebase login
```

### 3. Set Up Hosting Targets

```bash
cd "c:\Users\user\Documents\My Projects\RAY"

# Link web app
firebase target:apply hosting web ray-production

# Link admin app  
firebase target:apply hosting admin ray-admin-production
```

### 4. Build Both Apps

```bash
# Build web app
cd ray-web
npm run build

# Build admin app
cd ../ray-admin
npm run build
```

### 5. Deploy Both Apps

```bash
# From project root
cd ..

# Deploy web app only
firebase deploy --only hosting:web

# Deploy admin app only
firebase deploy --only hosting:admin

# OR deploy both at once
firebase deploy --only hosting
```

### 6. Get Your URLs

After deployment:
- **Web app**: `https://ray-production.web.app`
- **Admin app**: `https://ray-admin-production.web.app`

---

## Post-Deployment Checklist

### ✅ Web App
- [ ] Home page loads
- [ ] Can browse categories
- [ ] Search works
- [ ] Phone OTP login works
- [ ] Can view listing details
- [ ] Images load correctly
- [ ] Chat opens (if logged in)

### ✅ Admin App
- [ ] Login page loads
- [ ] Can login with admin account
- [ ] Dashboard shows stats
- [ ] Can view listings table
- [ ] Can view users table
- [ ] Charts render correctly

---

## Update Custom Domains (Optional)

### Vercel
1. Go to project **Settings** → **Domains**
2. Add domain: `ray.rw` (web) and `admin.ray.rw` (admin)
3. Add DNS records as shown

### Firebase
1. Go to **Hosting** in Firebase Console
2. Click **Add custom domain**
3. Follow DNS setup instructions

---

## Troubleshooting

### Build fails
```bash
# Clear cache and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### 404 on refresh
- **Vercel**: Already configured in `vercel.json`
- **Firebase**: Already configured in `firebase.json`

### Environment variables not working
- Vercel: Must start with `VITE_`
- Check `.env` file has correct format
- Redeploy after adding variables

### Images not loading
- Check Firebase Storage rules
- Verify Cloudinary API key (if using)
- Check browser console for CORS errors

---

## Quick Commands Reference

### Vercel
```bash
# Deploy web app
cd ray-web && vercel --prod

# Deploy admin app
cd ray-admin && vercel --prod

# Check deployment status
vercel ls
```

### Firebase
```bash
# Deploy both apps
firebase deploy --only hosting

# Deploy web only
firebase deploy --only hosting:web

# Deploy admin only
firebase deploy --only hosting:admin

# View hosting URLs
firebase hosting:sites:list
```

---

## What's Next?

After deployment:

1. **Test thoroughly** on production URLs
2. **Set up monitoring** (Vercel Analytics or Firebase Performance)
3. **Configure custom domains**
4. **Set up CI/CD** (GitHub Actions)
5. **Enable analytics** (Google Analytics)

---

## Success! 🎉

Your RAY platform is now live:

- ✅ **Web App**: Users can browse and post listings
- ✅ **Admin Dashboard**: Manage platform from anywhere
- ✅ **Global CDN**: Fast loading worldwide
- ✅ **HTTPS**: Secure by default
- ✅ **Auto-scaling**: Handles traffic spikes

**Total cost**: $0/month on free tier

---

## Support

Issues? Check:
1. Build logs in terminal
2. Browser console for errors
3. Vercel/Firebase deployment logs
4. Network tab for API errors
