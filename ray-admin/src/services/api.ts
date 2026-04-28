import { auth } from '@/services/firebase'
import type { Listing, User } from '@/types'

const BASE_URL = import.meta.env.VITE_FUNCTIONS_BASE_URL ||
  'https://us-central1-your-project.cloudfunctions.net'

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await auth.currentUser?.getIdToken()
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  }
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(err.message || `HTTP ${res.status}`)
  }
  const json = await res.json()
  return json.data ?? json
}

// ── Listings ──
export const adminListingsApi = {
  getAll: (params?: Record<string, string>): Promise<{ listings: Listing[]; total: number }> => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(`/admin/listings${qs}`)
  },
  getById: (id: string): Promise<Listing> => request(`/admin/listings/${id}`),
  approve: (id: string): Promise<void> =>
    request(`/admin/listings/${id}/approve`, { method: 'POST' }),
  reject: (id: string, reason: string): Promise<void> =>
    request(`/admin/listings/${id}/reject`, { method: 'POST', body: JSON.stringify({ reason }) }),
  delete: (id: string): Promise<void> =>
    request(`/admin/listings/${id}`, { method: 'DELETE' }),
  feature: (id: string, featured: boolean): Promise<void> =>
    request(`/admin/listings/${id}/feature`, { method: 'POST', body: JSON.stringify({ featured }) }),
}

// ── Users ──
export const adminUsersApi = {
  getAll: (params?: Record<string, string>): Promise<{ users: User[]; total: number }> => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : ''
    return request(`/admin/users${qs}`)
  },
  getById: (id: string): Promise<User> => request(`/admin/users/${id}`),
  ban: (id: string, reason: string): Promise<void> =>
    request(`/admin/users/${id}/ban`, { method: 'POST', body: JSON.stringify({ reason }) }),
  unban: (id: string): Promise<void> =>
    request(`/admin/users/${id}/unban`, { method: 'POST' }),
  verify: (id: string): Promise<void> =>
    request(`/admin/users/${id}/verify`, { method: 'POST' }),
  setRole: (id: string, role: string): Promise<void> =>
    request(`/admin/users/${id}/role`, { method: 'POST', body: JSON.stringify({ role }) }),
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
  getAll: (status?: string): Promise<{ reports: Report[]; total: number }> =>
    request(`/admin/reports${status ? `?status=${status}` : ''}`),
  resolve: (id: string, action: string): Promise<void> =>
    request(`/admin/reports/${id}/resolve`, { method: 'POST', body: JSON.stringify({ action }) }),
  dismiss: (id: string): Promise<void> =>
    request(`/admin/reports/${id}/dismiss`, { method: 'POST' }),
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
  getDashboard: (): Promise<DashboardStats> => request('/admin/analytics/dashboard'),
  getRevenue: (period: string): Promise<{ data: { date: string; amount: number }[] }> =>
    request(`/admin/analytics/revenue?period=${period}`),
}
