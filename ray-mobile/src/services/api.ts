import auth from '@react-native-firebase/auth'
import type { Listing, User, Conversation, Message, SearchFilters } from '@/types'
import { API_ROUTES } from '../../../shared/api-contract'

const BASE_URL =
  process.env.EXPO_PUBLIC_FUNCTIONS_URL ??
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  'https://us-central1-your-project.cloudfunctions.net'
const DEBUG_API = __DEV__ || process.env.EXPO_PUBLIC_DEBUG_API === 'true'

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = options.method ?? 'GET'
  const started = Date.now()
  const token = await auth().currentUser?.getIdToken()
  const res   = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  if (DEBUG_API) {
    console.log('[mobile.api] response', {
      method,
      endpoint,
      status: res.status,
      durationMs: Date.now() - started,
      ok: res.ok,
    })
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: `HTTP ${res.status}` }))
    if (DEBUG_API) {
      console.error('[mobile.api] request failed', {
        method,
        endpoint,
        status: res.status,
        error: err.message,
      })
    }
    throw new Error(err.message)
  }
  const json = await res.json()
  return json.data ?? json
}

export const listingsApi = {
  search: (f: Partial<SearchFilters>): Promise<{ listings: Listing[]; total: number; hasMore: boolean }> =>
    request(API_ROUTES.listings.search, { method: 'POST', body: JSON.stringify(f) }),
  getById:    (id: string):  Promise<Listing>   => request(API_ROUTES.listings.byId(id)),
  getFresh:   ():            Promise<Listing[]>  => request(API_ROUTES.listings.fresh),
  getPopular: ():            Promise<Listing[]>  => request(API_ROUTES.listings.popular),
  getBestDeals: ():          Promise<Listing[]>  => request(API_ROUTES.listings.bestDeals),
  getSimilar: (id: string):  Promise<Listing[]>  => request(API_ROUTES.listings.similar(id)),
  getByUser:  (userId: string): Promise<Listing[]> => request(API_ROUTES.users.listings(userId)),
  create: (data: FormData):  Promise<Listing>   =>
    request(API_ROUTES.listings.create, { method: 'POST', headers: {}, body: data }),
  delete: (id: string):      Promise<void>       =>
    request(API_ROUTES.listings.byId(id), { method: 'DELETE' }),
}

export const usersApi = {
  getMyProfile: ():                  Promise<User>            => request(API_ROUTES.users.me),
  getProfile:   (id: string):        Promise<User>            => request(API_ROUTES.users.byId(id)),
  updateProfile:(data: Partial<User>): Promise<User>          =>
    request(API_ROUTES.users.me, { method: 'PATCH', body: JSON.stringify(data) }),
}

export const chatApi = {
  getConversations: ():               Promise<Conversation[]> => request(API_ROUTES.conversations.base),
  startConversation:(listingId: string): Promise<Conversation> =>
    request(API_ROUTES.conversations.base, { method: 'POST', body: JSON.stringify({ listingId }) }),
  getMessages: (id: string):          Promise<Message[]>      => request(API_ROUTES.conversations.messages(id)),
  sendMessage: (id: string, content: string): Promise<Message> =>
    request(API_ROUTES.conversations.messages(id), { method: 'POST', body: JSON.stringify({ content }) }),
  markRead:    (id: string):          Promise<void>            =>
    request(API_ROUTES.conversations.read(id), { method: 'POST' }),
}
