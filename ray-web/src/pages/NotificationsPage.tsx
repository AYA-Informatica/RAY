import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { Bell, MessageCircle, Zap, TrendingDown, Clock, CheckCheck } from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '@/components/atoms'
import { timeAgo } from '@/utils/format'
import type { AppNotification } from '@/types'

const ICON_MAP = {
  new_message: MessageCircle,
  listing_boosted: Zap,
  price_drop: TrendingDown,
  listing_expiring: Clock,
  listing_sold: CheckCheck,
}

const COLOR_MAP = {
  new_message: 'text-primary',
  listing_boosted: 'text-warning',
  price_drop: 'text-success',
  listing_expiring: 'text-danger',
  listing_sold: 'text-success',
}

export const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch from API
    setNotifications([])
    setIsLoading(false)
  }, [])

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  return (
    <>
      <Helmet>
        <title>Notifications | RAY</title>
      </Helmet>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-text-primary text-2xl">Notifications</h1>
          {notifications.some((n) => !n.read) && (
            <Button variant="secondary" size="sm" onClick={markAllAsRead}>
              Mark all as read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-20 bg-surface-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <Bell className="w-16 h-16 text-text-muted" />
            <p className="text-text-secondary font-sans text-center">No notifications yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((notif) => {
              const Icon = ICON_MAP[notif.type]
              const color = COLOR_MAP[notif.type]
              return (
                <div
                  key={notif.id}
                  className={clsx(
                    'flex items-start gap-4 p-4 rounded-2xl border transition-colors cursor-pointer hover:bg-surface-modal',
                    notif.read
                      ? 'bg-surface-card border-border'
                      : 'bg-surface-card border-l-4 border-l-primary border-t-border border-r-border border-b-border'
                  )}
                >
                  <div className={clsx('p-2 rounded-xl bg-surface-modal', color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary font-sans">{notif.title}</p>
                    <p className="text-sm text-text-secondary font-sans mt-0.5">{notif.body}</p>
                    <p className="text-xs text-text-muted font-sans mt-1">{timeAgo(notif.createdAt)}</p>
                  </div>
                  {!notif.read && (
                    <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </main>
    </>
  )
}
