import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getMessaging, isSupported } from 'firebase/messaging'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
}

const USE_EMULATOR = import.meta.env.VITE_USE_EMULATOR === 'true'

console.log('[web.firebase] Initializing Firebase app', { 
  projectId: firebaseConfig.projectId,
  useEmulator: USE_EMULATOR 
})
export const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Connect to emulators in development
if (USE_EMULATOR) {
  console.log('[web.firebase] Connecting to auth emulator')
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
  console.log('[web.firebase] Connecting to firestore emulator')
  connectFirestoreEmulator(db, 'localhost', 8080)
}

console.log('[web.firebase] Firebase initialized successfully')

// FCM is only available in secure contexts (HTTPS)
export const getMessagingInstance = async () => {
  console.log('[web.firebase] Checking FCM support')
  const supported = await isSupported()
  console.log('[web.firebase] FCM supported:', supported)
  if (supported) {
    return getMessaging(app)
  }
  return null
}