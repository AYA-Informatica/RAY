# Cloudinary Setup Guide for RAY

**Time Required**: 10 minutes  
**Cost**: FREE (25GB storage + 25GB bandwidth/month)  
**Why**: Better than Firebase Storage for classifieds - automatic image optimization, faster CDN, no credit card needed

---

## Benefits Over Firebase Storage

| Feature | Cloudinary | Firebase Storage |
|---------|-----------|------------------|
| Free Storage | 25 GB | 5 GB (requires Blaze plan) |
| Free Bandwidth | 25 GB/month | 1 GB/day |
| Credit Card | Not required | Required (Blaze plan) |
| Auto Optimization | ✅ WebP, AVIF, quality | ❌ Manual |
| On-the-fly Resize | ✅ URL-based | ❌ Manual |
| CDN | ✅ Global (fast) | ✅ Firebase CDN |
| Setup Time | 10 minutes | 5 minutes |

---

## Step 1: Create Cloudinary Account (3 minutes)

1. Go to: **https://cloudinary.com/users/register_free**

2. Fill in:
   - Email: Your email
   - Password: Create strong password
   - Click **"Create Account"**

3. Verify your email (check inbox)

4. You'll be redirected to the Cloudinary Dashboard

---

## Step 2: Get Your Credentials (2 minutes)

1. On the Dashboard, you'll see:
   ```
   Cloud name: your_cloud_name
   API Key: 123456789012345
   API Secret: abcdefghijklmnopqrstuvwxyz
   ```

2. **Copy the Cloud name** - you'll need this for `.env`

---

## Step 3: Create Upload Preset (3 minutes)

**Why?** Upload presets allow unsigned uploads from the browser (secure & simple).

1. In Cloudinary Dashboard, click **Settings** (gear icon, top-right)

2. Click **Upload** tab in the left sidebar

3. Scroll down to **Upload presets** section

4. Click **"Add upload preset"**

5. Configure:
   - **Preset name**: `ray_listings`
   - **Signing Mode**: Select **"Unsigned"** ⚠️ Important!
   - **Folder**: `ray/listings`
   - **Use filename**: Toggle ON
   - **Unique filename**: Toggle ON
   - **Overwrite**: Toggle OFF
   - **Access mode**: Public
   - **Allowed formats**: jpg, png, webp, heic

6. Click **"Save"**

7. Repeat for avatars (optional):
   - **Preset name**: `ray_avatars`
   - **Folder**: `ray/avatars`
   - **Signing Mode**: **Unsigned**
   - Click **"Save"**

---

## Step 4: Configure RAY Web App (2 minutes)

1. Open `ray-web/.env` (create from `.env.example` if it doesn't exist)

2. Add these lines:

```env
# Image Upload Provider
VITE_IMAGE_PROVIDER=cloudinary

# Cloudinary Configuration
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=ray_listings
```

3. Replace `your_cloud_name` with the value from Step 2

4. Save the file

---

## Step 5: Test the Integration (2 minutes)

1. Start the dev server:
```bash
cd ray-web
npm run dev
```

2. Open http://localhost:5173

3. Go to **Post Ad** page

4. Upload a test image

5. Check browser console - you should see:
```
[Cloudinary] Upload successful
```

6. The image URL should look like:
```
https://res.cloudinary.com/your_cloud_name/image/upload/v1234567890/ray/listings/filename.jpg
```

---

## Step 6: Verify Uploads in Cloudinary (1 minute)

1. Go back to Cloudinary Dashboard

2. Click **Media Library** in the left sidebar

3. You should see your uploaded images in the `ray/listings` folder

4. Click on an image to see details (size, format, transformations)

---

## ✅ VERIFICATION CHECKLIST

After completing all steps, verify:

- [ ] Cloudinary account is created and verified
- [ ] Cloud name is copied
- [ ] Upload preset `ray_listings` is created with **Unsigned** mode
- [ ] `.env` file has `VITE_CLOUDINARY_CLOUD_NAME` set
- [ ] `.env` file has `VITE_IMAGE_PROVIDER=cloudinary`
- [ ] Test image uploads successfully
- [ ] Images appear in Cloudinary Media Library

---

## 🎯 WHAT YOU GET

After this setup:

1. **Automatic Optimization**: Images are auto-converted to WebP (40% smaller)
2. **Fast Loading**: Listing cards load 300x300 thumbnails instead of full images
3. **Responsive Images**: Different sizes for mobile/desktop automatically
4. **Better UX**: Faster page loads = happier users in Rwanda (slow 3G/4G)
5. **Cost Savings**: 25GB free vs Firebase's 5GB (5x more storage)

---

## 📊 Image Transformations (Automatic)

RAY automatically generates these versions:

| Use Case | Size | URL Example |
|----------|------|-------------|
| Listing Card | 300x300 | `.../w_300,h_300,c_fill,f_auto,q_auto/...` |
| Detail Page | 800x600 | `.../w_800,h_600,c_fit,f_auto,q_auto/...` |
| Full Size | 1200px | `.../w_1200,c_scale,f_auto,q_auto/...` |

**No extra code needed** - the `imageUpload.ts` service handles this automatically!

---

## 🔄 Switching Back to Firebase Storage

If you need to switch back:

1. Open `ray-web/.env`
2. Change:
```env
VITE_IMAGE_PROVIDER=firebase
```
3. Restart dev server

That's it! The app will use Firebase Storage instead.

---

## 🚨 Troubleshooting

### Error: "Cloudinary cloud name not configured"
- Check `.env` file has `VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name`
- Restart dev server after changing `.env`

### Error: "Upload preset not found"
- Verify upload preset name is exactly `ray_listings`
- Check **Signing Mode** is set to **"Unsigned"**

### Error: "Invalid signature"
- You're using a **signed** preset - change to **unsigned**
- Or set `VITE_CLOUDINARY_API_KEY` and `VITE_CLOUDINARY_API_SECRET` in `.env`

### Images not appearing in Media Library
- Check the **Folder** setting in upload preset
- Look in `ray/listings` folder, not root

---

## 💰 Cost Estimate

**Free Tier Limits:**
- 25 GB storage (~5,000 listing images)
- 25 GB bandwidth/month (~50,000 image views)
- 25 credits/month (transformations)

**When you exceed free tier:**
- Storage: $0.10/GB/month
- Bandwidth: $0.10/GB
- Transformations: $0.002 per credit

**Estimated cost for 10,000 listings:**
- Storage: 50GB = $2.50/month
- Bandwidth: 100GB = $10/month
- **Total: ~$12.50/month**

Compare to Firebase Storage (Blaze plan):
- Storage: 50GB = $2.50/month
- Bandwidth: 100GB = $12/month
- **Total: ~$14.50/month** (+ no auto-optimization)

---

## 🎓 Next Steps

After Cloudinary is working:

1. ✅ Cloudinary Setup (DONE)
2. ⏭️ Test image uploads in production
3. ⏭️ Monitor usage in Cloudinary Dashboard
4. ⏭️ Set up usage alerts (Settings → Usage)
5. ⏭️ Optimize upload preset settings (compression, quality)

---

**Support**: If you get stuck, check Cloudinary docs: https://cloudinary.com/documentation

**Dashboard**: https://cloudinary.com/console
