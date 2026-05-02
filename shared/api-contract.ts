export type ReportType = 'listing' | 'user'
export type ReportStatus = 'pending' | 'resolved' | 'dismissed'

export interface CreateReportPayload {
  type: ReportType
  targetId: string
  reason: string
  details?: string
}

export const API_ROUTES = {
  listings: {
    search: '/api/listings/search',
    byId: (id: string) => `/api/listings/${id}`,
    fresh: '/api/listings/fresh',
    popular: '/api/listings/popular',
    bestDeals: '/api/listings/best-deals',
    create: '/api/listings',
    similar: (id: string) => `/api/listings/${id}/similar`,
    boost: (id: string) => `/api/listings/${id}/boost`,
  },
  users: {
    me: '/api/users/me',
    byId: (id: string) => `/api/users/${id}`,
    listings: (id: string) => `/api/users/${id}/listings`,
    avatar: '/api/users/me/avatar',
  },
  conversations: {
    base: '/api/conversations',
    byId: (id: string) => `/api/conversations/${id}`,
    messages: (id: string) => `/api/conversations/${id}/messages`,
    read: (id: string) => `/api/conversations/${id}/read`,
  },
  reports: {
    base: '/api/reports',
    resolve: (id: string) => `/api/reports/${id}/resolve`,
    dismiss: (id: string) => `/api/reports/${id}/dismiss`,
  },
  admin: {
    listings: '/admin/listings',
    listingById: (id: string) => `/admin/listings/${id}`,
    listingApprove: (id: string) => `/admin/listings/${id}/approve`,
    listingReject: (id: string) => `/admin/listings/${id}/reject`,
    listingFeature: (id: string) => `/admin/listings/${id}/feature`,
    listingDelete: (id: string) => `/admin/listings/${id}`,
    users: '/admin/users',
    userById: (id: string) => `/admin/users/${id}`,
    userBan: (id: string) => `/admin/users/${id}/ban`,
    userUnban: (id: string) => `/admin/users/${id}/unban`,
    userVerify: (id: string) => `/admin/users/${id}/verify`,
    userRole: (id: string) => `/admin/users/${id}/role`,
    analyticsDashboard: '/admin/analytics/dashboard',
  },
} as const
