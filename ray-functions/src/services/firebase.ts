import * as admin from 'firebase-admin'
import { getStorage } from 'firebase-admin/storage'

if (!admin.apps.length) {
  admin.initializeApp()
}

export const db        = admin.firestore()
export const auth      = admin.auth()
export const storage   = getStorage()
export const messaging = admin.messaging()
export { admin }
