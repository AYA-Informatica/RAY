/**
 * Unified Image Upload Service
 * 
 * Provides a single interface for image uploads that can use either:
 * - Cloudinary (recommended - better performance, auto-optimization)
 * - Firebase Storage (fallback)
 * 
 * Set VITE_IMAGE_PROVIDER=cloudinary in .env to use Cloudinary
 */

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { storage } from './firebase'
import {
  uploadToCloudinary,
  uploadMultipleToCloudinary,
  isCloudinaryConfigured,
  getThumbnailUrl,
  getDetailUrl,
} from './cloudinary'

type ImageProvider = 'cloudinary' | 'firebase'

const IMAGE_PROVIDER: ImageProvider =
  (import.meta.env.VITE_IMAGE_PROVIDER as ImageProvider) || 'cloudinary'

/**
 * Upload a single image using the configured provider
 */
export const uploadImage = async (
  file: File,
  folder: string = 'listings'
): Promise<string> => {
  // Use Cloudinary if configured and selected
  if (IMAGE_PROVIDER === 'cloudinary' && isCloudinaryConfigured()) {
    return uploadToCloudinary(file, { folder })
  }

  // Fallback to Firebase Storage
  const fileName = `${folder}/${Date.now()}-${file.name}`
  const storageRef = ref(storage, fileName)
  await uploadBytes(storageRef, file)
  return getDownloadURL(storageRef)
}

/**
 * Upload multiple images using the configured provider
 */
export const uploadImages = async (
  files: File[],
  folder: string = 'listings'
): Promise<string[]> => {
  // Use Cloudinary if configured and selected
  if (IMAGE_PROVIDER === 'cloudinary' && isCloudinaryConfigured()) {
    return uploadMultipleToCloudinary(files, { folder })
  }

  // Fallback to Firebase Storage
  const uploadPromises = files.map(async (file) => {
    const fileName = `${folder}/${Date.now()}-${file.name}`
    const storageRef = ref(storage, fileName)
    await uploadBytes(storageRef, file)
    return getDownloadURL(storageRef)
  })

  return Promise.all(uploadPromises)
}

/**
 * Get optimized thumbnail URL (300x300)
 * Works with both Cloudinary and regular URLs
 */
export const getImageThumbnail = (url: string): string => {
  if (url.includes('cloudinary.com')) {
    return getThumbnailUrl(url)
  }
  return url // Firebase URLs are returned as-is
}

/**
 * Get optimized detail view URL (800x600)
 * Works with both Cloudinary and regular URLs
 */
export const getImageDetail = (url: string): string => {
  if (url.includes('cloudinary.com')) {
    return getDetailUrl(url)
  }
  return url // Firebase URLs are returned as-is
}

/**
 * Get the current image provider
 */
export const getImageProvider = (): ImageProvider => {
  if (IMAGE_PROVIDER === 'cloudinary' && isCloudinaryConfigured()) {
    return 'cloudinary'
  }
  return 'firebase'
}

/**
 * Check if image uploads are properly configured
 */
export const isImageUploadConfigured = (): boolean => {
  if (IMAGE_PROVIDER === 'cloudinary') {
    return isCloudinaryConfigured()
  }
  return true // Firebase is always available
}
