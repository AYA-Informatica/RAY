import { useState } from 'react'
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { subDays, format } from 'date-fns'
import { PageHeader } from '@/components/organisms/AdminLayout'
import { Skeleton } from '@/components/atoms'
import { clsx } from 'clsx'

const PERIODS = [
  { label: '7 days', value: 7 },
  { label: '30 days', value: 30 },
  { label: '90 days', value: 90 },
]

function mockRevenue(days: number) {
  return Array.from({ length: days }, (_, i) => ({
    date: format(subDays(new Date(), days - 1 - i), days <= 7 ? 'EEE' : 'MMM d'),
    revenue: Math.floor(Math.random() * 300000) + 50000,
    boosts: Math.floor(Math.random() * 50) + 10,
    premium: Math.floor(Math.random() * 30) + 5,
  }))
}

const PLATFORM_STATS = [
  { label: 'Avg time to first message', value: '4.2 min', trend: '-12%' },
  { label: 'Avg listing lifetime', value: '8.3 days', trend: '-3%' },
  { label: 'Seller conversion rate', value: '34%', trend: '+7%' },
  { label: 'Daily active users', value: '1,840', trend: '+22%' },
  { label: 'Avg listings per seller', value: '3.2', trend: '+5%' },
  { label: 'Chat-to-deal ratio', value: '28%', trend: '+4%' },
]

export const AdminAnalyticsPage = () => {
  const [period, setPeriod] = useState(30)
  const data = mockRevenue(period)
  const totalRevenue = data.reduce((s, d) => s + d.revenue, 0)

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title="Analytics"
        subtitle="Platform performance and revenue metrics"
        actions={
          <div className="flex gap-1 p-1 bg-surface-modal rounded-xl border border-border">
            {PERIODS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setPeriod(value)}
                className={clsx(
                  'px-3 py-1.5 rounded-lg text-xs font-semibold font-sans transition-all',
                  period === value ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        }
      />

      <div className="flex-1 p-6 flex flex-col gap-6">

        {/* Revenue KPIs */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: `Revenue (${period}d)`, value: `Rwf ${(totalRevenue / 1000000).toFixed(2)}M` },
            { label: 'Boost revenue', value: `Rwf ${(data.reduce((s, d) => s + d.boosts, 0) * 4990).toLocaleString()}` },
            { label: 'Premium revenue', value: `Rwf ${(data.reduce((s, d) => s + d.premium, 0) * 29900).toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-surface-card rounded-2xl border border-border p-5">
              <p className="text-2xl font-display font-bold text-primary">{value}</p>
              <p className="text-sm text-text-secondary font-sans mt-1">{label}</p>
            </div>
          ))}
        </div>

        {/* Revenue line chart */}
        <div className="bg-surface-card rounded-3xl border border-border p-6 flex flex-col gap-4">
          <h2 className="font-display font-bold text-text-primary">Revenue Over Time</h2>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" />
              <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis
                tick={{ fill: '#666', fontSize: 11 }}
                axisLine={false} tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ background: '#242424', border: '1px solid #2E2E2E', borderRadius: 12, color: '#fff', fontSize: 12 }}
                formatter={(v: number) => [`Rwf ${v.toLocaleString()}`, 'Revenue']}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#E8390E"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 4, fill: '#E8390E' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Boosts vs Premium bar chart */}
        <div className="bg-surface-card rounded-3xl border border-border p-6 flex flex-col gap-4">
          <h2 className="font-display font-bold text-text-primary">Monetisation Breakdown</h2>
          <div className="flex items-center gap-4 text-xs font-sans">
            <span className="flex items-center gap-1.5 text-text-secondary">
              <span className="w-3 h-0.5 bg-primary rounded" />Boosts sold
            </span>
            <span className="flex items-center gap-1.5 text-text-secondary">
              <span className="w-3 h-0.5 bg-navy rounded" />Premium subs
            </span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} barSize={12} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2E2E2E" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#666', fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#242424', border: '1px solid #2E2E2E', borderRadius: 12, color: '#fff', fontSize: 12 }}
              />
              <Bar dataKey="boosts" fill="#E8390E" radius={[4, 4, 0, 0]} />
              <Bar dataKey="premium" fill="#1B2B5E" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Platform health metrics */}
        <div className="bg-surface-card rounded-3xl border border-border p-6 flex flex-col gap-4">
          <h2 className="font-display font-bold text-text-primary">Platform Health</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PLATFORM_STATS.map(({ label, value, trend }) => {
              const isPositive = trend.startsWith('+')
              return (
                <div key={label} className="flex flex-col gap-1 p-4 bg-surface-modal rounded-2xl">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-lg font-display font-bold text-text-primary">{value}</span>
                    <span className={clsx(
                      'text-xs font-semibold font-sans px-2 py-0.5 rounded-full',
                      isPositive ? 'text-success bg-success/10' : 'text-danger bg-danger/10'
                    )}>
                      {trend}
                    </span>
                  </div>
                  <span className="text-xs text-text-secondary font-sans">{label}</span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  )
}
