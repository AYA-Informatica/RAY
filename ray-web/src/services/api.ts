import { auth } from './firebase'
import type {
  Listing,
  SearchFilters,
  SearchResult,
  Conversation,
  Message,
  User,
  ApiResponse,
} from '@/types'

// ─────────────────────────────────────────────
// Base request helper
// ─────────────────────────────────────────────

const BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL || 
  'https://us-central1-your-project.cloudfunctions.net'

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await auth.currentUser?.getIdToken()

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }

  const json: ApiResponse<T> = await res.json()
  return json.data
}

// ─────────────────────────────────────────────
// Listings
// ─────────────────────────────────────────────

export const listingsApi = {
  search: (filters: Partial<SearchFilters>): Promise<SearchResult> =>
    request('/api/listings/search', {
      method: 'POST',
      body: JSON.stringify(filters),
    }),

  getById: (id: string): Promise<Listing> =>
    request(`/api/listings/${id}`),

  getFresh: (districtOrNeighborhood?: string): Promise<Listing[]> =>
    request(`/api/listings/fresh${districtOrNeighborhood ? `?location=${districtOrNeighborhood}` : ''}`),

  getPopular: (): Promise<Listing[]> =>
    request('/api/listings/popular'),

  getBestDeals: (): Promise<Listing[]> =>
    request('/api/listings/best-deals'),

  create: (data: FormData): Promise<Listing> =>
    request('/api/listings', {
      method: 'POST',
      headers: {},          // let fetch set multipart boundary
      body: data,
    }),

  update: (id: string, data: Partial<Listing>): Promise<Listing> =>
    request(`/api/listings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  delete: (id: string): Promise<void> =>
    request(`/api/listings/${id}`, { method: 'DELETE' }),

  boost: (id: string, packageId: string): Promise<Listing> =>
    request(`/api/listings/${id}/boost`, {
      method: 'POST',
      body: JSON.stringify({ packageId }),
    }),

  getByUser: (userId: string): Promise<Listing[]> =>
    request(`/api/users/${userId}/listings`),

  getSimilar: (listingId: string): Promise<Listing[]> =>
    request(`/api/listings/${listingId}/similar`),
}

// ─────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────

export const usersApi = {
  getProfile: (userId: string): Promise<User> =>
    request(`/api/users/${userId}`),

  getMyProfile: (): Promise<User> =>
    request('/api/users/me'),

  updateProfile: (data: Partial<User>): Promise<User> =>
    request('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  uploadAvatar: (file: File): Promise<{ url: string }> => {
    const form = new FormData()
    form.append('avatar', file)
    return request('/api/users/me/avatar', {
      method: 'POST',
      headers: {},
      body: form,
    })
  },
}

// ─────────────────────────────────────────────
// Chat
// ─────────────────────────────────────────────

export const chatApi = {
  getConversations: (): Promise<Conversation[]> =>
    request('/api/conversations'),

  getConversation: (id: string): Promise<Conversation> =>
    request(`/api/conversations/${id}`),

  startConversation: (listingId: string): Promise<Conversation> =>
    request('/api/conversations', {
      method: 'POST',
      body: JSON.stringify({ listingId }),
    }),

  getMessages: (conversationId: string): Promise<Message[]> =>
    request(`/api/conversations/${conversationId}/messages`),

  sendMessage: (conversationId: string, content: string): Promise<Message> =>
    request(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),

  markRead: (conversationId: string): Promise<void> =>
    request(`/api/conversations/${conversationId}/read`, { method: 'POST' }),
}

// ─────────────────────────────────────────────
// Reports
// ─────────────────────────────────────────────

export const reportsApi = {
  reportListing: (listingId: string, reason: string): Promise<void> =>
    request('/api/reports/listing', {
      method: 'POST',
      body: JSON.stringify({ listingId, reason }),
    }),

  reportUser: (userId: string, reason: string): Promise<void> =>
    request('/api/reports/user', {
      method: 'POST',
      body: JSON.stringify({ userId, reason }),
    }),
}
