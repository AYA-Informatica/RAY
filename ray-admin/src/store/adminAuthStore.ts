import { create } from 'zustand'
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '@/services/firebase'

export type AdminRole = 'admin' | 'moderator' | 'support'

interface AdminUser {
  uid: string
  email: string | null
  displayName: string | null
  role: AdminRole
}

interface AdminAuthState {
  adminUser: AdminUser | null
  isLoading: boolean
  isInitialized: boolean
  error: string | null
  initAuth: () => () => void
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
}

const DEBUG_AUTH = import.meta.env.DEV || import.meta.env.VITE_DEBUG_AUTH === 'true'

async function getRoleFromToken(fbUser: FirebaseUser): Promise<AdminRole> {
  const token = await fbUser.getIdTokenResult()
  const role = token.claims['role'] as string | undefined
  if (role === 'admin' || role === 'moderator' || role === 'support') return role
  throw new Error('Access denied: insufficient role')
}

export const useAdminAuthStore = create<AdminAuthState>()((set) => ({
  adminUser: null,
  isLoading: false,
  isInitialized: false,
  error: null,

  initAuth: () => {
    if (DEBUG_AUTH) {
      console.log('[admin.authStore] Initializing auth listener')
    }
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (DEBUG_AUTH) {
        console.log('[admin.authStore] Auth state changed', { hasUser: !!fbUser, uid: fbUser?.uid })
      }
      if (fbUser) {
        try {
          const role = await getRoleFromToken(fbUser)
          if (DEBUG_AUTH) {
            console.log('[admin.authStore] Admin role verified', { role })
          }
          set({
            adminUser: {
              uid: fbUser.uid,
              email: fbUser.email,
              displayName: fbUser.displayName,
              role,
            },
            isInitialized: true,
          })
        } catch {
          console.error('[admin.authStore] Access denied - insufficient role')
          await signOut(auth)
          set({ adminUser: null, isInitialized: true, error: 'Access denied' })
        }
      } else {
        set({ adminUser: null, isInitialized: true })
      }
    })
    return unsub
  },

  login: async (email, password) => {
    if (DEBUG_AUTH) {
      console.log('[admin.authStore] Attempting login', { email })
    }
    set({ isLoading: true, error: null })
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      // Force token refresh to get latest custom claims
      await credential.user.getIdToken(true)
      const role = await getRoleFromToken(credential.user)
      if (DEBUG_AUTH) {
        console.log('[admin.authStore] Login successful', { uid: credential.user.uid, role })
      }
      set({
        adminUser: {
          uid: credential.user.uid,
          email: credential.user.email,
          displayName: credential.user.displayName,
          role,
        },
        isLoading: false,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed'
      console.error('[admin.authStore] Login failed', { error: message })
      set({ error: message, isLoading: false })
      throw err
    }
  },

  logout: async () => {
    if (DEBUG_AUTH) {
      console.log('[admin.authStore] Logging out')
    }
    await signOut(auth)
    set({ adminUser: null })
    if (DEBUG_AUTH) {
      console.log('[admin.authStore] Logged out successfully')
    }
  },

  clearError: () => set({ error: null }),
}))