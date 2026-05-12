import { useEffect } from 'react'
import { useAdminAuthStore } from '@/store/adminAuthStore'

const DEBUG_AUTH = import.meta.env.DEV || import.meta.env.VITE_DEBUG_AUTH === 'true'

export function useAdminAuth() {
  const store = useAdminAuthStore()
  
  useEffect(() => {
    if (!store.isInitialized) {
      if (DEBUG_AUTH) {
        console.log('[admin.useAdminAuth] Initializing auth hook')
      }
      const unsub = store.initAuth()
      return unsub
    }
  }, [store.isInitialized, store])
  
  return {
    adminUser: store.adminUser,
    isInitialized: store.isInitialized,
    role: store.adminUser?.role,
  }
}