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
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const role = await getRoleFromToken(fbUser)
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
    set({ isLoading: true, error: null })
    try {
      const credential = await signInWithEmailAndPassword(auth, email, password)
      const role = await getRoleFromToken(credential.user)
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
      set({ error: message, isLoading: false })
      throw err
    }
  },

  logout: async () => {
    await signOut(auth)
    set({ adminUser: null })
  },

  clearError: () => set({ error: null }),
}))
