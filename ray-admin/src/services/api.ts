import { auth } from '@/services/firebase'
import type { Listing, User } from '@/types'
import { API_ROUTES, type ReportStatus } from '../../../shared/api-contract'

const BASE_URL =
  import.meta.env.VITE_FUNCTIONS_BASE_URL ||
  import.meta.env.VITE_API_BASE_URL ||
  'https://us-central1-your-project.cloudfunctions.net'

const DEBUG_API = import.meta.env.DEV || import.meta.env.VITE_DEBUG_API === 'true'

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const method = options.method ?? 'GET'
  const started = Date.now()
  const token = await auth.currentUser?.getIdToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })
  if (DEBUG_API) {
    console.log('[admin.api] response', {
      method,
      endpoint,
      status: res.status,
      durationMs: Date.now() - started,
      ok: res.ok,
    })
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }))
    if (DEBUG_API) {
      console.error('[admin.api] request failed', {
        method,
        endpoint,
        status: res.status,
        error: err.message,
      })
    }
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  const json = await res.json()
  return json.data ?? json
}

// ── Listings ──
export const adminListingsApi = {
  getAll: (params?: Record<string, string>): Promise<{ listings: Listing[]; total: number }> => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(`${API_ROUTES.admin.listings}${qs}`)
  },
  getById: (id: string): Promise<Listing> => request(API_ROUTES.admin.listingById(id)),
  approve: (id: string): Promise<void> =>
    request(API_ROUTES.admin.listingApprove(id), { method: 'POST' }),
  reject: (id: string, reason: string): Promise<void> =>
    request(API_ROUTES.admin.listingReject(id), { method: 'POST', body: JSON.stringify({ reason }) }),
  delete: (id: string): Promise<void> =>
    request(API_ROUTES.admin.listingDelete(id), { method: 'DELETE' }),
  feature: (id: string, featured: boolean): Promise<void> =>
    request(API_ROUTES.admin.listingFeature(id), { method: 'POST', body: JSON.stringify({ featured }) }),
}

// ── Users ──
export const adminUsersApi = {
  getAll: (params?: Record<string, string>): Promise<{ users: User[]; total: number }> => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(`${API_ROUTES.admin.users}${qs}`)
  },
  getById: (id: string): Promise<User> => request(API_ROUTES.admin.userById(id)),
  ban: (id: string, reason: string): Promise<void> =>
    request(API_ROUTES.admin.userBan(id), { method: 'POST', body: JSON.stringify({ reason }) }),
  unban: (id: string): Promise<void> =>
    request(API_ROUTES.admin.userUnban(id), { method: 'POST' }),
  verify: (id: string): Promise<void> =>
    request(API_ROUTES.admin.userVerify(id), { method: 'POST' }),
  setRole: (id: string, role: string): Promise<void> =>
    request(API_ROUTES.admin.userRole(id), { method: 'POST', body: JSON.stringify({ role }) }),
}

// ── Reports / Moderation ──
export interface Report {
  id: string
  type: 'listing' | 'user'
  targetId: string
  reportedBy: string
  reason: string
  status: 'pending' | 'resolved' | 'dismissed'
  createdAt: string
  snapshot?: Partial<Listing> | Partial<User>
}

export const adminReportsApi = {
  getAll: (status?: ReportStatus | 'all'): Promise<{ reports: Report[]; total: number }> =>
    request(`${API_ROUTES.reports.base}${status ? `?status=${status}` : ''}`),
  resolve: (id: string, action: string): Promise<void> =>
    request(API_ROUTES.reports.resolve(id), { method: 'POST', body: JSON.stringify({ action }) }),
  dismiss: (id: string): Promise<void> =>
    request(API_ROUTES.reports.dismiss(id), { method: 'POST' }),
}

// ── Analytics ──
export interface DashboardStats {
  totalUsers: number
  newUsersToday: number
  totalListings: number
  newListingsToday: number
  activeListings: number
  totalRevenue: number
  revenueThisMonth: number
  pendingReports: number
  dailyActivity: { date: string; listings: number; users: number; revenue: number }[]
  categoryBreakdown: { name: string; count: number; percentage: number }[]
  topListings: Listing[]
}

export const adminAnalyticsApi = {
  getDashboard: (): Promise<DashboardStats> => request(API_ROUTES.admin.analyticsDashboard),
  getRevenue: (): Promise<{ data: { date: string; amount: number }[] }> =>
    request(API_ROUTES.admin.analyticsDashboard).then((stats: DashboardStats) => ({
      data: stats.dailyActivity.map((d) => ({ date: d.date, amount: d.revenue })),
    })),
}
