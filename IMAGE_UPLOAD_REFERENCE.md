# Image Upload Service - Developer Reference

Quick reference for using the unified image upload service in RAY.

---

## Import

```typescript
import { uploadImage, uploadImages, getImageThumbnail, getImageDetail } from '@/services/imageUpload'
```

---

## Upload Single Image

```typescript
// Upload a single image
const file: File = // ... from input
const imageUrl = await uploadImage(file, 'listings')

// Upload to different folder
const avatarUrl = await uploadImage(file, 'avatars')
```

---

## Upload Multiple Images

```typescript
// Upload multiple images in parallel
const files: File[] = // ... from input
const imageUrls = await uploadImages(files, 'listings')

// Result: ['https://...', 'https://...', 'https://...']
```

---

## Get Optimized URLs

```typescript
// Original URL from upload
const originalUrl = 'https://res.cloudinary.com/.../image.jpg'

// Get thumbnail (300x300) for listing cards
const thumbnailUrl = getImageThumbnail(originalUrl)
// Result: https://res.cloudinary.com/.../w_300,h_300,c_fill,f_auto,q_auto/image.jpg

// Get detail view (800x600) for listing detail page
const detailUrl = getImageDetail(originalUrl)
// Result: https://res.cloudinary.com/.../w_800,h_600,c_fit,f_auto,q_auto/image.jpg
```

---

## Usage in Components

### Listing Card Component

```typescript
import { getImageThumbnail } from '@/services/imageUpload'

export const ListingCard = ({ listing }: { listing: Listing }) => {
  const thumbnailUrl = getImageThumbnail(listing.images[0])
  
  return (
    <div className="listing-card">
      <img src={thumbnailUrl} alt={listing.title} />
      {/* ... */}
    </div>
  )
}
```

### Listing Detail Page

```typescript
import { getImageDetail } from '@/services/imageUpload'

export const ListingDetailPage = () => {
  const detailUrl = getImageDetail(listing.images[0])
  
  return (
    <div className="listing-detail">
      <img src={detailUrl} alt={listing.title} />
      {/* ... */}
    </div>
  )
}
```

### Post Ad Page (Already Implemented)

The `PostAdPage` component already handles image uploads correctly.
No changes needed - it will automatically use Cloudinary when configured.

---

## Configuration

### Use Cloudinary (Recommended)

```env
# .env
VITE_IMAGE_PROVIDER=cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=ray_listings
```

### Use Firebase Storage (Fallback)

```env
# .env
VITE_IMAGE_PROVIDER=firebase
# Firebase config already set
```

---

## Advanced: Direct Cloudinary Usage

If you need more control, import Cloudinary service directly:

```typescript
import { 
  uploadToCloudinary, 
  getOptimizedImageUrl,
  getThumbnailUrl,
  getDetailUrl,
  getFullSizeUrl 
} from '@/services/cloudinary'

// Upload with custom options
const url = await uploadToCloudinary(file, {
  folder: 'listings',
  tags: ['featured', 'electronics'],
})

// Custom transformations
const customUrl = getOptimizedImageUrl(url, 500, 500, 'crop')
```

---

## Error Handling

```typescript
try {
  const url = await uploadImage(file, 'listings')
  console.log('Upload successful:', url)
} catch (error) {
  console.error('Upload failed:', error)
  // Show error to user
}
```

---

## Best Practices

1. **Always use thumbnails in listing cards** - saves bandwidth
   ```typescript
   <img src={getImageThumbnail(listing.images[0])} />
   ```

2. **Use detail URLs in listing detail pages** - good balance
   ```typescript
   <img src={getImageDetail(listing.images[0])} />
   ```

3. **Upload multiple images in parallel** - faster
   ```typescript
   const urls = await uploadImages(files) // Parallel
   // NOT: files.map(f => await uploadImage(f)) // Sequential
   ```

4. **Handle upload errors gracefully**
   ```typescript
   try {
     await uploadImage(file)
   } catch (error) {
     toast.error('Failed to upload image. Please try again.')
   }
   ```

---

## Image Sizes Reference

| Use Case | Function | Size | Crop Mode |
|----------|----------|------|-----------|
| Listing Card | `getImageThumbnail()` | 300x300 | fill |
| Listing Detail | `getImageDetail()` | 800x600 | fit |
| Full Size | `getFullSizeUrl()` | 1200px width | scale |
| Custom | `getOptimizedImageUrl()` | Custom | Custom |

---

## Testing

```typescript
import { getImageProvider, isImageUploadConfigured } from '@/services/imageUpload'

// Check which provider is active
console.log('Using:', getImageProvider()) // 'cloudinary' or 'firebase'

// Check if properly configured
if (!isImageUploadConfigured()) {
  console.error('Image upload not configured!')
}
```

---

## Migration Notes

### From Firebase Storage

If you're migrating from direct Firebase Storage usage:

**Before:**
```typescript
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from '@/services/firebase'

const storageRef = ref(storage, `listings/${file.name}`)
await uploadBytes(storageRef, file)
const url = await getDownloadURL(storageRef)
```

**After:**
```typescript
import { uploadImage } from '@/services/imageUpload'

const url = await uploadImage(file, 'listings')
```

---

## Performance Tips

1. **Compress images before upload** (optional)
   - Cloudinary does this automatically
   - But pre-compression can speed up uploads on slow connections

2. **Show upload progress** (future enhancement)
   ```typescript
   // TODO: Add progress callback to uploadImage()
   ```

3. **Lazy load images**
   ```typescript
   <img src={thumbnailUrl} loading="lazy" />
   ```

---

## Troubleshooting

### "Cloudinary cloud name not configured"
- Check `.env` has `VITE_CLOUDINARY_CLOUD_NAME`
- Restart dev server

### Images not optimizing
- Check URL includes transformations: `w_300,h_300,c_fill,f_auto,q_auto`
- Use `getImageThumbnail()` or `getImageDetail()` functions

### Upload fails silently
- Check browser console for errors
- Verify upload preset is **unsigned** in Cloudinary dashboard

---

**Need help?** Check [CLOUDINARY_SETUP_GUIDE.md](./CLOUDINARY_SETUP_GUIDE.md)
