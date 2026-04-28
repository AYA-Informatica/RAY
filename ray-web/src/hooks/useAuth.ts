import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

/**
 * useAuth — convenience hook wrapping the auth store.
 * Initialises the Firebase auth listener once on mount.
 */
export function useAuth() {
  const store = useAuthStore()

  useEffect(() => {
    if (store.isInitialized) return
    const unsubscribe = store.initAuth()
    return unsubscribe
  }, [store])

  return {
    user: store.user,
    firebaseUser: store.firebaseUser,
    isLoading: store.isLoading,
    isInitialized: store.isInitialized,
    isAuthenticated: !!store.firebaseUser,
    logout: store.logout,
  }
}
