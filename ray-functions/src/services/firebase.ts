import * as admin from 'firebase-admin'
import { getStorage } from 'firebase-admin/storage'
import { debugLog } from '../utils/debug'

if (!admin.apps.length) {
  // Check if we have service account credentials
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      })
      debugLog('firebase.init', 'Initialized with service account', {
        projectId: serviceAccount.project_id,
      })
    } catch (err) {
      console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', err)
      admin.initializeApp()
    }
  } else {
    // Fallback to default credentials (works in Cloud Functions)
    admin.initializeApp()
    debugLog('firebase.init', 'Initialized with default credentials', {})
  }
}

export const db        = admin.firestore()
export const auth      = admin.auth()
export const storage   = getStorage()
export const messaging = admin.messaging()
export { admin }
