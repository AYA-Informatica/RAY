/**
 * Cloudinary Image Upload Service
 * 
 * Handles image uploads to Cloudinary with automatic optimization.
 * Benefits over Firebase Storage:
 * - Automatic WebP/AVIF conversion
 * - On-the-fly image transformations (resize, crop)
 * - Better CDN performance for Rwanda
 * - 25GB free storage + 25GB bandwidth/month
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'ray_listings'

interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  bytes: number
}

interface UploadOptions {
  folder?: string
  transformation?: string
  tags?: string[]
}

/**
 * Upload a single image to Cloudinary
 * @param file - Image file to upload
 * @param options - Upload configuration
 * @returns Cloudinary secure URL
 */
export const uploadToCloudinary = async (
  file: File,
  options: UploadOptions = {}
): Promise<string> => {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error('Cloudinary cloud name not configured. Set VITE_CLOUDINARY_CLOUD_NAME in .env')
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
  
  if (options.folder) {
    formData.append('folder', options.folder)
  }
  
  if (options.tags && options.tags.length > 0) {
    formData.append('tags', options.tags.join(','))
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error?.message || 'Cloudinary upload failed')
    }

    const data: CloudinaryUploadResponse = await response.json()
    return data.secure_url
  } catch (error) {
    console.error('[Cloudinary] Upload failed:', error)
    throw new Error(
      error instanceof Error ? error.message : 'Failed to upload image to Cloudinary'
    )
  }
}

/**
 * Upload multiple images to Cloudinary in parallel
 * @param files - Array of image files
 * @param options - Upload configuration
 * @returns Array of Cloudinary URLs
 */
export const uploadMultipleToCloudinary = async (
  files: File[],
  options: UploadOptions = {}
): Promise<string[]> => {
  const uploadPromises = files.map((file) => uploadToCloudinary(file, options))
  return Promise.all(uploadPromises)
}

/**
 * Generate optimized image URL with transformations
 * @param url - Original Cloudinary URL
 * @param width - Target width
 * @param height - Target height
 * @param crop - Crop mode (fill, fit, scale, etc.)
 * @returns Transformed URL
 */
export const getOptimizedImageUrl = (
  url: string,
  width?: number,
  height?: number,
  crop: 'fill' | 'fit' | 'scale' | 'crop' = 'fill'
): string => {
  if (!url.includes('cloudinary.com')) {
    return url // Not a Cloudinary URL, return as-is
  }

  const transformations: string[] = []
  
  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (width || height) transformations.push(`c_${crop}`)
  
  // Always add auto format and quality
  transformations.push('f_auto', 'q_auto')

  const transformString = transformations.join(',')
  
  // Insert transformations into URL
  return url.replace('/upload/', `/upload/${transformString}/`)
}

/**
 * Get thumbnail URL (300x300, optimized for listing cards)
 */
export const getThumbnailUrl = (url: string): string => {
  return getOptimizedImageUrl(url, 300, 300, 'fill')
}

/**
 * Get detail view URL (800x600, optimized for listing detail page)
 */
export const getDetailUrl = (url: string): string => {
  return getOptimizedImageUrl(url, 800, 600, 'fit')
}

/**
 * Get full size URL (1200px width, auto quality/format)
 */
export const getFullSizeUrl = (url: string): string => {
  return getOptimizedImageUrl(url, 1200, undefined, 'scale')
}

/**
 * Check if Cloudinary is properly configured
 */
export const isCloudinaryConfigured = (): boolean => {
  return Boolean(CLOUDINARY_CLOUD_NAME && CLOUDINARY_UPLOAD_PRESET)
}
