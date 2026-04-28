import { useEffect, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import { Users, List, TrendingUp, Flag, Eye, MessageCircle, Zap, Award } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { StatCard, Skeleton, Badge } from '@/components/atoms'
import { PageHeader } from '@/components/organisms/AdminLayout'
import { adminAnalyticsApi } from '@/services/api'
import type { DashboardStats } from '@/services/api'

const CATEGORY_COLORS = [
  '#E8390E', '#3B82F6', '#22C55E', '#F59E0B',
  '#8B5CF6', '#EC4899', '#14B8A6', '#F97316',
]

// Fallback mock data for when API is not yet connected
const MOCK_DAILY: DashboardStats['dailyActivity'] = Array.from({ length: 14 }, (_, i) => ({
  date: format(subDays(new Date(), 13 - i), 'MMM d'),
  listings: Math.floor(Math.random() * 80) + 20,
  users: Math.floor(Math.random() * 40) + 10,
  revenue: Math.floor(Math.random() * 200000) + 50000,
}))

const MOCK_CATEGORIES = [
  { name: 'Mobiles', count: 4200, percentage: 30 },
  { name: 'Cars', count: 2800, percentage: 20 },
  { name: 'Properties', count: 2100, percentage: 15 },
  { name: 'Electronics', count: 1400, percentage: 10 },
  { name: 'Fashion', count: 1120, percentage: 8 },
  { name: 'Furniture', count: 980, percentage: 7 },
  { name: 'Other', count: 1400, percentage: 10 },
]

export const DashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    adminAnalyticsApi.getDashboard()
      .then(setStats)
      .catch(() => {
        // Use mock data if API not ready
        setStats({
          totalUsers: 12480,
          newUsersToday: 47,
          totalListings: 34200,
          newListingsToday: 183,
          activeListings: 28900,
          totalRevenue: 4820000,
          revenueThisMonth: 620000,
          pendingReports: 12,
          dailyActivity: MOCK_DAILY,
          categoryBreakdown: MOCK_CATEGORIES,
          topListings: [],
        })
      })
      .finally(() => setIsLoading(false))
  }, [])

  const topStats = stats
    ? [
        {
          title: 'Total Users',
          value: stats.totalUsers.toLocaleString(),
          change: { value: 12, label: 'this week' },
          icon: <Users className="w-5 h-5" />,
          color: 'primary' as const,
        },
        {
          title: 'Active Listings',
          value: stats.activeListings.toLocaleString(),
          change: { value: 8, label: 'this week' },
          icon: <List className="w-5 h-5" />,
          color: 'success' as const,
        },
        {
          title: 'Revenue This Month',
          value: `Rwf ${(stats.revenueThisMonth / 1000).toFixed(0)}k`,
          change: { value: 23, label: 'vs last month' },
          icon: <TrendingUp className="w-5 h-5" />,
          color: 'warning' as const,
        },
        {
          title: 'Pending Reports',
          value: stats.pendingReports,
          change: { value: -5, label: 'vs yesterday' },
          icon: <Flag className="w-5 h-5" />,
          color: 'danger' as const,
        },
      ]
    : []

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Dashboard"
        subtitle={`${format(new Date(), 'EEEE, MMMM d yyyy')} · Kigali, Rwanda`}
      />

      <div className="flex-1 p-8 flex flex-col gap-6">

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-36 rounded-2xl" />
              ))
            : topStats.map((s) => <StatCard key={s.title} {...s} />)}
        </div>

        {/* ── Today's pulse ── */}
        {!isLoading && stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'New users today', value: stats.newUsersToday, icon: <Users className="w-4 h-4" /> },
              { label: 'New listings today', value: stats.newListingsToday, icon: <List className="w-4 h-4" /> },
              { label: 'Active sessions', value: '342', icon: <Eye className="w-4 h-4" /> },
              { label: 'Chats initiated', value: '891', icon: <MessageCircle className="w-4 h-4" /> },
            ].map(({ label, value, icon }) => (
              <div key={label} className="flex items-center gap-3 px-4 py-3 bg-surface-card rounded-2xl border border-border">
                <span className="p-2 rounded-xl bg-primary/10 text-primary">{icon}</span>
                <div>
                  <p className="text-lg font-display font-bold text-text-primary">{value}</p>
                  <p className="text-xs text-text-secondary font-sans">{label}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Activity chart ── */}
        <div className="bg-surface-card rounded-3xl border border-border p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-text-primary">Platform Activity (14 days)</h2>
            <div className="flex items-center gap-4 text-xs font-sans">
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="w-3 h-0.5 bg-primary rounded inline-block" />Listings
              </span>
              <span className="flex items-center gap-1.5 text-text-secondary">
                <span className="w-3 h-0.5 bg-success rounded inline-block" />Users
              </span>
            </div>
          </div>
          {isLoading ? (
            <Skeleton className="h-64" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={stats?.dailyActivity ?? MOCK_DAILY}>
                <defs>
                  <linearGradient id="gradListings" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#E8390E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#E8390E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" />
                <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: '#242424', border: '1px solid #2E2E2E', borderRadius: 12, color: '#fff', fontSize: 12 }}
                  cursor={{ stroke: '#E8390E', strokeWidth: 1, strokeDasharray: '4 4' }}
                />
                <Area type="monotone" dataKey="listings" stroke="#E8390E" strokeWidth={2} fill="url(#gradListings)" />
                <Area type="monotone" dataKey="users" stroke="#22C55E" strokeWidth={2} fill="url(#gradUsers)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* ── Bottom row: Revenue bar + Category pie ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Revenue bar chart */}
          <div className="bg-surface-card rounded-3xl border border-border p-6 flex flex-col gap-4">
            <h2 className="font-display font-bold text-text-primary">Daily Revenue (Rwf)</h2>
            {isLoading ? <Skeleton className="h-48" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={stats?.dailyActivity ?? MOCK_DAILY} barSize={20}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip
                    contentStyle={{ background: '#242424', border: '1px solid #2E2E2E', borderRadius: 12, color: '#fff', fontSize: 12 }}
                    formatter={(v: number) => [`Rwf ${v.toLocaleString()}`, 'Revenue']}
                  />
                  <Bar dataKey="revenue" fill="#E8390E" radius={[6, 6, 0, 0]} opacity={0.85} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Category pie chart */}
          <div className="bg-surface-card rounded-3xl border border-border p-6 flex flex-col gap-4">
            <h2 className="font-display font-bold text-text-primary">Listings by Category</h2>
            {isLoading ? <Skeleton className="h-48" /> : (
              <div className="flex items-center gap-4">
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats?.categoryBreakdown ?? MOCK_CATEGORIES}
                      dataKey="count"
                      nameKey="name"
                      cx="50%" cy="50%"
                      innerRadius={55} outerRadius={80}
                      paddingAngle={3}
                    >
                      {(stats?.categoryBreakdown ?? MOCK_CATEGORIES).map((_, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#242424', border: '1px solid #2E2E2E', borderRadius: 12, color: '#fff', fontSize: 12 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-col gap-2 flex-1">
                  {(stats?.categoryBreakdown ?? MOCK_CATEGORIES).slice(0, 5).map((cat, i) => (
                    <div key={cat.name} className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: CATEGORY_COLORS[i] }} />
                      <span className="text-xs font-sans text-text-secondary flex-1 truncate">{cat.name}</span>
                      <span className="text-xs font-semibold text-text-primary font-sans">{cat.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Quick actions ── */}
        <div className="bg-surface-card rounded-3xl border border-border p-5">
          <h2 className="font-display font-bold text-text-primary mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Review pending listings', icon: <List className="w-4 h-4" />, to: '/admin/listings?status=pending_review' },
              { label: 'Handle open reports', icon: <Flag className="w-4 h-4" />, to: '/admin/reports?status=pending' },
              { label: 'Verify sellers', icon: <Award className="w-4 h-4" />, to: '/admin/users?filter=unverified' },
              { label: 'Boost analytics', icon: <Zap className="w-4 h-4" />, to: '/admin/analytics' },
            ].map(({ label, icon, to }) => (
              <a
                key={to}
                href={to}
                className="flex items-center gap-2 px-4 py-2.5 bg-surface-modal rounded-xl border border-border text-sm font-semibold font-sans text-text-secondary hover:text-primary hover:border-primary transition-colors"
              >
                {icon}{label}
              </a>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
