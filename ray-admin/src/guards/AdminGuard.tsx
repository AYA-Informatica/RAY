import { useEffect } from 'react'
import { Navigate } from 'react-router-dom'
import { useAdminAuthStore } from '@/store/adminAuthStore'
import type { AdminRole } from '@/types'

const DEBUG_AUTH = import.meta.env.DEV || import.meta.env.VITE_DEBUG_AUTH === 'true'

interface AdminGuardProps {
  children: React.ReactNode
  /** Optional: restrict to specific roles only */
  allowedRoles?: AdminRole[]
}

/**
 * AdminGuard — protects all /admin/* routes.
 * Checks Firebase custom claims for admin role.
 */
export const AdminGuard = ({ children, allowedRoles }: AdminGuardProps) => {
  const { adminUser, isInitialized, initAuth } = useAdminAuthStore()

  useEffect(() => {
    if (!isInitialized) {
      if (DEBUG_AUTH) {
        console.log('[admin.AdminGuard] Initializing auth')
      }
      const unsub = initAuth()
      return unsub
    }
  }, [isInitialized, initAuth])

  if (!isInitialized) {
    if (DEBUG_AUTH) {
      console.log('[admin.AdminGuard] Waiting for auth initialization')
    }
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <span className="font-display font-bold text-3xl text-primary animate-pulse">RAY</span>
      </div>
    )
  }

  if (!adminUser) {
    if (DEBUG_AUTH) {
      console.log('[admin.AdminGuard] No admin user, redirecting to login')
    }
    return <Navigate to="/admin/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(adminUser.role)) {
    if (DEBUG_AUTH) {
      console.log('[admin.AdminGuard] Role denied', { 
        userRole: adminUser.role, 
        allowedRoles 
      })
    }
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-4">
        <span className="text-5xl">🚫</span>
        <h1 className="font-display font-bold text-xl text-text-primary">Access Denied</h1>
        <p className="text-sm text-text-secondary font-sans max-w-xs">
          Your role ({adminUser.role}) doesn't have permission to view this page.
        </p>
      </div>
    )
  }

  if (DEBUG_AUTH) {
    console.log('[admin.AdminGuard] Access granted', { role: adminUser.role })
  }

  return <>{children}</>
}