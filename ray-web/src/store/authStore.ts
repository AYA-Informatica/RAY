import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  signInWithPhoneNumber,
  RecaptchaVerifier,
  ConfirmationResult,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '@/services/firebase'
import { usersApi } from '@/services/api'
import type { User } from '@/types'

interface AuthState {
  firebaseUser: FirebaseUser | null
  user: User | null
  isLoading: boolean
  isInitialized: boolean
  confirmationResult: ConfirmationResult | null
  error: string | null

  // Actions
  initAuth: () => () => void
  sendOtp: (phone: string) => Promise<void>
  verifyOtp: (code: string) => Promise<'new_user' | 'existing_user'>
  loadUserProfile: () => Promise<void>
  updateUser: (data: Partial<User>) => void
  logout: () => Promise<void>
  clearError: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      firebaseUser: null,
      user: null,
      isLoading: false,
      isInitialized: false,
      confirmationResult: null,
      error: null,

      initAuth: () => {
        const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
          set({ firebaseUser: fbUser, isInitialized: true })
          if (fbUser) {
            await get().loadUserProfile()
          } else {
            set({ user: null })
          }
        })
        return unsubscribe
      },

      sendOtp: async (phone: string) => {
        set({ isLoading: true, error: null })
        try {
          // RecaptchaVerifier must be attached to a DOM element with id="recaptcha-container"
          const recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
            size: 'invisible',
          })
          const result = await signInWithPhoneNumber(auth, phone, recaptchaVerifier)
          set({ confirmationResult: result, isLoading: false })
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Failed to send OTP'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      verifyOtp: async (code: string) => {
        const { confirmationResult } = get()
        if (!confirmationResult) throw new Error('No OTP in progress')

        set({ isLoading: true, error: null })
        try {
          const credential = await confirmationResult.confirm(code)
          const isNewUser = credential.user.metadata.creationTime === 
                            credential.user.metadata.lastSignInTime
          set({ firebaseUser: credential.user, isLoading: false })
          return isNewUser ? 'new_user' : 'existing_user'
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Invalid OTP'
          set({ error: message, isLoading: false })
          throw err
        }
      },

      loadUserProfile: async () => {
        try {
          const user = await usersApi.getMyProfile()
          set({ user })
        } catch {
          // Profile may not exist yet (new user)
          set({ user: null })
        }
      },

      updateUser: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }))
      },

      logout: async () => {
        await signOut(auth)
        set({ firebaseUser: null, user: null, confirmationResult: null })
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'ray-auth',
      partialize: (state) => ({ user: state.user }),
    }
  )
)
