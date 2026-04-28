import auth from '@react-native-firebase/auth'
import type { Listing, User, Conversation, Message, SearchFilters } from '@/types'

const BASE_URL = process.env.EXPO_PUBLIC_FUNCTIONS_URL ??
  'https://us-central1-your-project.cloudfunctions.net'

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await auth().currentUser?.getIdToken()
  const res   = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    throw new Error(err.message)
  }
  const json = await res.json()
  return json.data ?? json
}

export const listingsApi = {
  search: (f: Partial<SearchFilters>): Promise<{ listings: Listing[]; total: number; hasMore: boolean }> =>
    request('/api/listings/search', { method: 'POST', body: JSON.stringify(f) }),
  getById:    (id: string):  Promise<Listing>   => request(`/api/listings/${id}`),
  getFresh:   ():            Promise<Listing[]>  => request('/api/listings/fresh'),
  getPopular: ():            Promise<Listing[]>  => request('/api/listings/popular'),
  getBestDeals: ():          Promise<Listing[]>  => request('/api/listings/best-deals'),
  getSimilar: (id: string):  Promise<Listing[]>  => request(`/api/listings/${id}/similar`),
  getByUser:  (userId: string): Promise<Listing[]> => request(`/api/users/${userId}/listings`),
  create: (data: FormData):  Promise<Listing>   =>
    request('/api/listings', { method: 'POST', headers: {}, body: data }),
  delete: (id: string):      Promise<void>       =>
    request(`/api/listings/${id}`, { method: 'DELETE' }),
}

export const usersApi = {
  getMyProfile: ():                  Promise<User>            => request('/api/users/me'),
  getProfile:   (id: string):        Promise<User>            => request(`/api/users/${id}`),
  updateProfile:(data: Partial<User>): Promise<User>          =>
    request('/api/users/me', { method: 'PATCH', body: JSON.stringify(data) }),
}

export const chatApi = {
  getConversations: ():               Promise<Conversation[]> => request('/api/conversations'),
  startConversation:(listingId: string): Promise<Conversation> =>
    request('/api/conversations', { method: 'POST', body: JSON.stringify({ listingId }) }),
  getMessages: (id: string):          Promise<Message[]>      => request(`/api/conversations/${id}/messages`),
  sendMessage: (id: string, content: string): Promise<Message> =>
    request(`/api/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify({ content }) }),
  markRead:    (id: string):          Promise<void>            =>
    request(`/api/conversations/${id}/read`, { method: 'POST' }),
}
