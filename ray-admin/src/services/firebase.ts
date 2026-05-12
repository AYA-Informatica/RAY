import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

const USE_EMULATOR = import.meta.env.VITE_USE_EMULATOR === 'true'

console.log('[admin.firebase] Initializing Firebase app', { 
  projectId: firebaseConfig.projectId,
  useEmulator: USE_EMULATOR 
})
export const app = initializeApp(firebaseConfig, 'admin')
export const auth = getAuth(app)
export const db = getFirestore(app)

// Connect to emulators in development
if (USE_EMULATOR) {
  console.log('[admin.firebase] Connecting to auth emulator')
  connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true })
  console.log('[admin.firebase] Connecting to firestore emulator')
  connectFirestoreEmulator(db, 'localhost', 8080)
}

console.log('[admin.firebase] Firebase initialized successfully')