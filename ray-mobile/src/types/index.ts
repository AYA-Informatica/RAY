export type UserRole = 'user' | 'dealer' | 'admin' | 'moderator' | 'support'
export type VerificationStatus = 'none' | 'phone' | 'id' | 'dealer'
export type TrustLevel = 1 | 2 | 3
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
export type MessageType = 'text' | 'image' | 'system' | 'phone_shared'

export interface User {
  id: string
  phone: string
  displayName: string
  avatar?: string
  location?: KigaliLocation
  role: UserRole
  verificationStatus: VerificationStatus
  trustLevel: TrustLevel
  responseRate?: number
  completedDeals?: number
  activeListings?: number
  memberSince: string
  isOnline?: boolean
}

export interface UserSummary {
  id: string
  displayName: string
  avatar?: string
  trustLevel: TrustLevel
  verificationStatus: VerificationStatus
  responseRate?: number
}

export interface KigaliLocation {
  district: string
  neighborhood: string
  displayLabel: string
  lat: number
  lng: number
  source: 'gps' | 'manual'
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
  location: KigaliLocation
  seller: UserSummary
  status: ListingStatus
  isFeatured: boolean
  isPromoted: boolean
  views: number
  chatCount: number
  postedAt: string
  expiresAt: string
}

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
  listingSnapshot: { title: string; price: number; coverImage: string }
  participants: [string, string]
  otherUser: UserSummary
  lastMessage?: Message
  unreadCount: number
  updatedAt: string
}

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
