import sharp from 'sharp'
import { v4 as uuidv4 } from 'uuid'
import { storage } from './firebase'

const BUCKET = process.env.FIREBASE_STORAGE_BUCKET ?? ''

interface UploadResult { url: string; path: string }

async function uploadBuffer(
  buffer: Buffer,
  storagePath: string,
  contentType = 'image/webp'
): Promise<UploadResult> {
  const bucket = storage.bucket(BUCKET)
  const file   = bucket.file(storagePath)
  await file.save(buffer, {
    metadata: {
      contentType,
      cacheControl: 'public, max-age=31536000',
    },
  })
  await file.makePublic()
  return {
    url:  `https://storage.googleapis.com/${BUCKET}/${storagePath}`,
    path: storagePath,
  }
}

/**
 * Process and upload a listing image.
 * Produces: full (1200px WebP) + thumbnail (400x300 WebP).
 * Returns { full, thumb } — both are public CDN URLs.
 */
export async function uploadListingImage(
  inputBuffer: Buffer,
  userId: string,
  listingId: string
): Promise<{ full: string; thumb: string }> {
  console.log('[functions.imageService] Processing listing image', { userId, listingId })
  const fileName = uuidv4()
  const basePath = `listings/${userId}/${listingId}`

  const [fullBuffer, thumbBuffer] = await Promise.all([
    sharp(inputBuffer)
      .resize(1200, 1080, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 })
      .toBuffer(),
    sharp(inputBuffer)
      .resize(400, 300, { fit: 'cover', position: 'centre' })
      .webp({ quality: 75, effort: 4 })
      .toBuffer(),
  ])

  const [full, thumb] = await Promise.all([
    uploadBuffer(fullBuffer,  `${basePath}/${fileName}.webp`),
    uploadBuffer(thumbBuffer, `${basePath}/thumb_${fileName}.webp`),
  ])

  console.log('[functions.imageService] Listing image uploaded', { full: full.url, thumb: thumb.url })
  return { full: full.url, thumb: thumb.url }
}

/**
 * Upload a user avatar.
 * 400x400 square crop, WebP, 80% quality.
 */
export async function uploadAvatar(inputBuffer: Buffer, userId: string): Promise<string> {
  console.log('[functions.imageService] Processing avatar', { userId })
  const processed = await sharp(inputBuffer)
    .resize(400, 400, { fit: 'cover', position: 'centre' })
    .webp({ quality: 80, effort: 4 })
    .toBuffer()

  const storagePath = `avatars/${userId}/${uuidv4()}.webp`
  const result      = await uploadBuffer(processed, storagePath)
  console.log('[functions.imageService] Avatar uploaded', { url: result.url })
  return result.url
}

/**
 * Delete a Storage file by its public URL.
 * Non-fatal — logs warning on failure.
 */
export async function deleteStorageFile(url: string): Promise<void> {
  try {
    console.log('[functions.imageService] Deleting storage file', { url })
    const path = url.split(`${BUCKET}/`)[1]
    if (!path) return
    await storage.bucket(BUCKET).file(path).delete()
    console.log('[functions.imageService] Storage file deleted', { url })
  } catch {
    console.warn('[functions.imageService] Could not delete:', url)
  }
}
