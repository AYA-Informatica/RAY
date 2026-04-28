import { useEffect } from 'react'
import { useAdminAuthStore } from '@/store/adminAuthStore'

export function useAdminAuth() {
  const store = useAdminAuthStore()
  
  useEffect(() => {
    if (!store.isInitialized) {
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
