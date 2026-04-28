// Re-export all shared types
export type {
  User,
  Listing,
  ListingCategory,
  ListingCondition,
  ListingStatus,
  UserRole,
  VerificationStatus,
  TrustLevel,
} from './core'

// Admin-specific types
export type AdminRole = 'admin' | 'moderator' | 'support'

export interface AdminPermissions {
  canManageListings: boolean
  canManageUsers: boolean
  canViewAnalytics: boolean
  canManageReports: boolean
  canManageAdmins: boolean
}

export const ROLE_PERMISSIONS: Record<AdminRole, AdminPermissions> = {
  admin: {
    canManageListings: true,
    canManageUsers: true,
    canViewAnalytics: true,
    canManageReports: true,
    canManageAdmins: true,
  },
  moderator: {
    canManageListings: true,
    canManageUsers: false,
    canViewAnalytics: false,
    canManageReports: true,
    canManageAdmins: false,
  },
  support: {
    canManageListings: false,
    canManageUsers: true,
    canViewAnalytics: false,
    canManageReports: true,
    canManageAdmins: false,
  },
}
