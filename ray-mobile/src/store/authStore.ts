import { create } from 'zustand'
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import * as Haptics from 'expo-haptics'
import { usersApi } from '@/services/api'
import type { User } from '@/types'

interface AuthState {
  firebaseUser:       FirebaseAuthTypes.User | null
  user:               User | null
  confirm:            FirebaseAuthTypes.ConfirmationResult | null
  isLoading:          boolean
  isInitialized:      boolean
  error:              string | null
  initAuth:           () => () => void
  sendOtp:            (phone: string) => Promise<void>
  verifyOtp:          (code: string) => Promise<'new_user' | 'existing_user'>
  loadProfile:        () => Promise<void>
  updateUser:         (data: Partial<User>) => void
  logout:             () => Promise<void>
  clearError:         () => void
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  firebaseUser:  null,
  user:          null,
  confirm:       null,
  isLoading:     false,
  isInitialized: false,
  error:         null,

  initAuth: () => {
    const unsub = auth().onAuthStateChanged(async (fbUser) => {
      set({ firebaseUser: fbUser, isInitialized: true })
      if (fbUser) await get().loadProfile()
      else        set({ user: null })
    })
    return unsub
  },

  sendOtp: async (phone) => {
    set({ isLoading: true, error: null })
    try {
      const confirm = await auth().signInWithPhoneNumber(phone)
      set({ confirm, isLoading: false })
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Failed to send OTP', isLoading: false })
      throw err
    }
  },

  verifyOtp: async (code) => {
    const { confirm } = get()
    if (!confirm) throw new Error('No OTP confirmation in progress')
    set({ isLoading: true, error: null })
    try {
      const cred      = await confirm.confirm(code)
      const isNewUser = cred!.user.metadata.creationTime === cred!.user.metadata.lastSignInTime
      set({ firebaseUser: cred!.user, isLoading: false })
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
      return isNewUser ? 'new_user' : 'existing_user'
    } catch (err) {
      set({ error: err instanceof Error ? err.message : 'Invalid OTP', isLoading: false })
      throw err
    }
  },

  loadProfile: async () => {
    try {
      const user = await usersApi.getMyProfile()
      set({ user })
    } catch {
      set({ user: null })
    }
  },

  updateUser: (data) => set((s) => ({ user: s.user ? { ...s.user, ...data } : null })),

  logout: async () => {
    await auth().signOut()
    set({ firebaseUser: null, user: null, confirm: null })
  },

  clearError: () => set({ error: null }),
}))
