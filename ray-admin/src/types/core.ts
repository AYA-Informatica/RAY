export type UserRole = 'user' | 'dealer' | 'admin' | 'moderator' | 'support'
export type VerificationStatus = 'none' | 'phone' | 'id' | 'dealer'
export type TrustLevel = 1 | 2 | 3
export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair'
export type ListingStatus = 'active' | 'sold' | 'expired' | 'pending_review' | 'rejected'
export type ListingCategory =
  | 'mobiles' | 'cars' | 'properties' | 'electronics'
  | 'fashion' | 'furniture' | 'jobs' | 'services' | 'other'

export interface User {
  id: string
  phone: string
  displayName: string
  avatar?: string
  role: UserRole
  verificationStatus: VerificationStatus
  trustLevel: TrustLevel
  responseRate?: number
  completedDeals?: number
  activeListings?: number
  memberSince: string
  isOnline?: boolean
  isBanned?: boolean
  banReason?: string
  location?: { displayLabel: string }
}

export interface UserSummary {
  id: string
  displayName: string
  avatar?: string
  trustLevel: TrustLevel
  verificationStatus: VerificationStatus
}

export interface Listing {
  id: string
  title: string
  description?: string
  price: number
  negotiable: boolean
  condition: ListingCondition
  category: ListingCategory
  subcategory?: string
  images: string[]
  coverImage: string
  location: { district: string; neighborhood: string; displayLabel: string }
  seller: UserSummary
  status: ListingStatus
  isFeatured: boolean
  isPromoted: boolean
  views: number
  chatCount: number
  postedAt: string
  expiresAt: string
}
