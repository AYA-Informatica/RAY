// ─────────────────────────────────────────────
// RAY — Core Types
// ─────────────────────────────────────────────

export type UserRole = 'user' | 'dealer' | 'admin' | 'moderator' | 'support'
export type VerificationStatus = 'none' | 'phone' | 'id' | 'dealer'
export type TrustLevel = 1 | 2 | 3

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
  | 'cars'
  | 'properties'
  | 'electronics'
  | 'fashion'
  | 'furniture'
  | 'jobs'
  | 'services'
  | 'other'

export interface Listing {
  id: string
  title: string
  description?: string
  price: number
  negotiable: boolean
  condition: ListingCondition
  category: ListingCategory
  subcategory?: string
  images: string[]            // array of storage URLs
  coverImage: string
  location: KigaliLocation
  seller: UserSummary
  status: ListingStatus
  isFeatured: boolean
  isPromoted: boolean
  views: number
  chatCount: number
  postedAt: string            // ISO date
  expiresAt: string
  tags?: string[]
}

export interface UserSummary {
  id: string
  displayName: string
  avatar?: string
  trustLevel: TrustLevel
  verificationStatus: VerificationStatus
  responseRate?: number
}

// ─────────────────────────────────────────────
// Location
// ─────────────────────────────────────────────

export interface KigaliLocation {
  district: string
  neighborhood: string
  lat?: number
  lng?: number
  displayLabel: string        // e.g. "Kimihurura, Kigali"
}

// ─────────────────────────────────────────────
// Chat
// ─────────────────────────────────────────────

export type MessageType = 'text' | 'image' | 'system' | 'phone_shared'

export interface Message {
  id: string
  conversationId: string
  senderId: string
  type: MessageType
  content: string
  imageUrl?: string
  timestamp: string
  read: boolean
}

export interface Conversation {
  id: string
  listingId: string
  listingSnapshot: {
    title: string
    price: number
    coverImage: string
  }
  participants: [string, string]   // [buyerId, sellerId]
  otherUser: UserSummary
  lastMessage?: Message
  unreadCount: number
  updatedAt: string
}

// ─────────────────────────────────────────────
// Search & Filters
// ─────────────────────────────────────────────

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'nearest'

export interface SearchFilters {
  query?: string
  category?: ListingCategory
  minPrice?: number
  maxPrice?: number
  condition?: ListingCondition[]
  distanceKm?: number
  district?: string
  sortBy: SortOption
  page: number
  limit: number
}

export interface SearchResult {
  listings: Listing[]
  total: number
  page: number
  hasMore: boolean
}

// ─────────────────────────────────────────────
// Monetization
// ─────────────────────────────────────────────

export type BoostType = 'featured' | 'top_ad' | 'elite_seller'

export interface BoostPackage {
  id: string
  type: BoostType
  name: string
  price: number               // in RWF
  durationDays: number
  benefits: string[]
}

// ─────────────────────────────────────────────
// Notifications
// ─────────────────────────────────────────────

export type NotificationType =
  | 'new_message'
  | 'listing_boosted'
  | 'price_drop'
  | 'listing_expiring'
  | 'listing_sold'

export interface AppNotification {
  id: string
  type: NotificationType
  title: string
  body: string
  read: boolean
  createdAt: string
  meta?: Record<string, string>
}

// ─────────────────────────────────────────────
// API Response wrapper
// ─────────────────────────────────────────────

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface ApiError {
  code: string
  message: string
  field?: string
}
