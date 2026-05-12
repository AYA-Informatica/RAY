// ─────────────────────────────────────────────
// RAY — Core Types
// ─────────────────────────────────────────────

export type UserRole = 'user' | 'dealer' | 'admin' | 'moderator' | 'support'
export type VerificationStatus = 'none' | 'phone' | 'id' | 'dealer'
export type TrustLevel = 1 | 2 | 3

export interface KigaliLocation {
  district: string
  neighborhood: string
  displayLabel: string
  lat: number              // required — GPS latitude
  lng: number              // required — GPS longitude
  source: 'gps' | 'manual' // how the location was obtained
}

export interface User {
  id: string
  phone: string
  displayName: string
  avatar?: string
  location?: KigaliLocation
  role: UserRole
  verificationStatus: VerificationStatus
  trustLevel: TrustLevel
  responseRate?: number         // 0–100
  completedDeals?: number
  activeListings?: number
  memberSince: string           // ISO date
  isOnline?: boolean
  lastSeen?: string
}

// ─────────────────────────────────────────────
// Listings
// ─────────────────────────────────────────────

export type ListingCondition = 'new' | 'like_new' | 'good' | 'fair'
export type ListingStatus = 'active' | 'sold' | 'expired' | 'pending_review' | 'rejected'
export type ListingCategory =
  | 'mobiles'
  | 'electronics'
  | 'vehicles'
  | 'property'
  | 'fashion'
  | 'furniture'
  | 'food'
  | 'services'
  | 'jobs'
  | 'health'
  | 'sports'
  | 'kids'

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'nearest'

export interface SearchFilters {
  query?: string
  category?: ListingCategory
  minPrice?: number
  maxPrice?: number
  condition?: ListingCondition[]
  district?: string
  meta?: Record<string, string | number | boolean>

  // Distance filter — all three must be present together to activate
  distanceKm?: 10 | 20 | 30 | 50 | 100   // max distance radius
  userLat?: number                          // searcher's latitude
  userLng?: number                          // searcher's longitude

  sortBy: SortOption
  page: number
  limit: number
}

export interface UserSummary {
  id: string
  displayName: string
  avatar?: string
  trustLevel: TrustLevel
  verificationStatus: VerificationStatus
  responseRate?: number
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
  location?: KigaliLocation
  seller: UserSummary
  status: ListingStatus
  isFeatured: boolean
  isPromoted: boolean
  views: number
  chatCount: number
  postedAt: string
  expiresAt: string
  meta?: Record<string, string | number | boolean>
}