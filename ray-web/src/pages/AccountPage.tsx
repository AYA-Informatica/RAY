import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  Settings, ChevronRight, Heart, Bell, Star,
  Zap, HelpCircle, Shield, LogOut, Grid3X3,
  MapPin, RefreshCw, Navigation
} from 'lucide-react'
import { clsx } from 'clsx'
import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { ListingGrid } from '@/components/organisms/ListingGrid'
import { useAuthStore } from '@/store/authStore'
import { useLocationStore } from '@/store/locationStore'
import { usersApi, listingsApi } from '@/services/api'
import { KIGALI_NEIGHBORHOODS } from '@/constants/locations'
import { STRINGS } from '@/constants/strings'
import type { Listing } from '@/types'

interface MenuRow {
  label: string
  icon: React.ReactNode
  to?: string
  onClick?: () => void
  badge?: number
  danger?: boolean
}

export const AccountPage = () => {
  const navigate = useNavigate()
  const { user, logout, updateUser } = useAuthStore()
  const { userLocation, requestGpsLocation, setManualLocation, setLocation, isRequesting: isRequestingLocation } = useLocationStore()
  const [myListings, setMyListings] = useState<Listing[]>([])
  const [isLoadingListings, setIsLoadingListings] = useState(true)
  const [activeTab, setActiveTab] = useState<'listings' | 'favourites'>('listings')

  useEffect(() => {
    if (!user) return
    listingsApi.getByUser(user.id)
      .then(setMyListings)
      .finally(() => setIsLoadingListings(false))
  }, [user])

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
        <span className="text-5xl">👤</span>
        <h1 className="font-display font-bold text-xl text-text-primary">Sign in to view your profile</h1>
        <Button onClick={() => navigate('/login')}>Login</Button>
      </main>
    )
  }

  const menuRows: MenuRow[] = [
    {
      label: STRINGS.profile.myAds,
      icon: <Grid3X3 className="w-4 h-4" />,
      to: '/account/listings',
      badge: user.activeListings,
    },
    {
      label: STRINGS.profile.favourites,
      icon: <Heart className="w-4 h-4" />,
      to: '/account/saved',
      badge: 34,
    },
    {
      label: STRINGS.profile.notifications,
      icon: <Bell className="w-4 h-4" />,
      to: '/account/notifications',
      badge: 3,
    },
    {
      label: STRINGS.profile.reviewsRatings,
      icon: <Star className="w-4 h-4" />,
      to: '/account/reviews',
    },
    {
      label: STRINGS.profile.upgradePremium,
      icon: <Zap className="w-4 h-4 text-primary" />,
      to: '/premium',
    },
    {
      label: STRINGS.profile.settings,
      icon: <Settings className="w-4 h-4" />,
      to: '/account/settings',
    },
    {
      label: STRINGS.profile.helpSupport,
      icon: <HelpCircle className="w-4 h-4" />,
      to: '/help',
    },
    {
      label: STRINGS.profile.safetyTips,
      icon: <Shield className="w-4 h-4" />,
      to: '/safety',
    },
    {
      label: STRINGS.profile.logout,
      icon: <LogOut className="w-4 h-4" />,
      onClick: handleLogout,
      danger: true,
    },
  ]

  return (
    <>
      <Helmet><title>My Account | RAY</title></Helmet>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">

        {/* ── Profile header card ── */}
        <div className="relative rounded-3xl overflow-hidden bg-surface-card border border-border">
          {/* Orange header strip */}
          <div className="h-24 bg-primary relative">
            <div className="absolute -bottom-2 -right-4 w-32 h-32 bg-primary-dark/40 rounded-full blur-2xl" />
            {/* Settings icon */}
            <Link
              to="/account/settings"
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <Settings className="w-4 h-4" />
            </Link>
          </div>

          {/* Avatar (overlapping) */}
          <div className="px-5 pb-5">
            <div className="-mt-10 mb-3 flex items-end justify-between">
              <div className="relative">
                <Avatar
                  src={user.avatar}
                  alt={user.displayName}
                  size="xl"
                  className="ring-4 ring-surface-card"
                />
                {user.verificationStatus !== 'none' && (
                  <span className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full border-2 border-surface-card flex items-center justify-center">
                    <span className="text-white text-[10px]">✓</span>
                  </span>
                )}
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate('/account/edit')}>
                Edit Profile
              </Button>
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-xl text-text-primary">
                  {user.displayName}
                </h1>
                {user.trustLevel === 3 && (
                  <Badge variant="primary">{STRINGS.trust.topSeller}</Badge>
                )}
                {user.verificationStatus !== 'none' && (
                  <Badge variant="success" dot>{STRINGS.trust.verified}</Badge>
                )}
              </div>
              <p className="text-sm text-text-secondary font-sans">{user.phone}</p>
              {user.location && (
                <p className="text-sm text-text-secondary font-sans">{user.location.displayLabel}</p>
              )}
            </div>

            {/* Stats row */}
            <div className="mt-4 grid grid-cols-3 divide-x divide-border bg-surface-modal rounded-2xl overflow-hidden">
              {[
                { label: 'Active Ads', value: user.activeListings ?? 12 },
                { label: 'Total Views', value: user.activeListings ? `${(user.activeListings * 200 / 1000).toFixed(1)}k` : '2.4k' },
                { label: 'Favourites', value: 34 },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center py-3 px-2">
                  <span className="font-display font-bold text-text-primary text-lg">{value}</span>
                  <span className="text-[11px] text-text-secondary font-sans">{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Location card */}
        <div className="bg-surface-card rounded-3xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <h3 className="font-display font-bold text-text-primary text-sm">Your Location</h3>
            <span className="text-xs text-text-muted font-sans">Used for nearby listings</span>
          </div>

          <div className="p-5 flex flex-col gap-4">
            {/* Current location display */}
            <div className="flex items-center gap-3">
              <div className={clsx(
                'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                user?.location ? 'bg-success/10' : 'bg-surface-modal'
              )}>
                <MapPin className={clsx('w-5 h-5', user?.location ? 'text-success' : 'text-text-muted')} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-text-primary font-sans">
                  {user?.location?.displayLabel ?? 'No location saved'}
                </p>
                <p className="text-xs text-text-muted font-sans mt-0.5">
                  {user?.location
                    ? `Saved · ${user.location.source === 'gps' ? 'GPS' : 'Manual'}`
                    : 'Add a location to see nearby listings'}
                </p>
              </div>
            </div>

            {/* Update controls */}
            <div className="flex flex-col gap-2">
              {/* GPS refresh */}
              <button
                onClick={async () => {
                  const loc = await requestGpsLocation()
                  if (loc) {
                    try {
                      await usersApi.updateProfile({
                        location: {
                          district:     loc.displayLabel.split(', ')[1] ?? 'Kigali',
                          neighborhood: loc.displayLabel.split(', ')[0],
                          displayLabel: loc.displayLabel,
                          lat:          loc.lat,
                          lng:          loc.lng,
                          source:       'gps',
                        },
                      })
                      updateUser({
                        location: {
                          district:     loc.displayLabel.split(', ')[1] ?? 'Kigali',
                          neighborhood: loc.displayLabel.split(', ')[0],
                          displayLabel: loc.displayLabel,
                          lat:          loc.lat,
                          lng:          loc.lng,
                          source:       'gps',
                        },
                      })
                    } catch {
                      // show error toast
                    }
                  }
                }}
                disabled={isRequestingLocation}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 bg-surface-modal border border-border rounded-xl',
                  'text-sm font-semibold font-sans transition-colors',
                  isRequestingLocation
                    ? 'opacity-50 cursor-not-allowed text-text-muted'
                    : 'text-text-secondary hover:border-primary hover:text-primary'
                )}
              >
                {isRequestingLocation
                  ? <div className="w-4 h-4 border-2 border-text-muted border-t-transparent rounded-full animate-spin" />
                  : <RefreshCw className="w-4 h-4" />}
                {isRequestingLocation ? 'Getting GPS location...' : 'Update with GPS'}
              </button>

              {/* Manual neighborhood select */}
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary pointer-events-none" />
                <select
                  defaultValue=""
                  value={user?.location?.displayLabel ?? ''}
                  onChange={async (e) => {
                    if (!e.target.value) return
                    const loc = setManualLocation(e.target.value)
                    if (!loc) return
                    try {
                      await usersApi.updateProfile({
                        location: {
                          district:     loc.displayLabel.split(', ')[1] ?? 'Kigali',
                          neighborhood: loc.displayLabel.split(', ')[0],
                          displayLabel: loc.displayLabel,
                          lat:          loc.lat,
                          lng:          loc.lng,
                          source:       'manual',
                        },
                      })
                      updateUser({
                        location: {
                          district:     loc.displayLabel.split(', ')[1] ?? 'Kigali',
                          neighborhood: loc.displayLabel.split(', ')[0],
                          displayLabel: loc.displayLabel,
                          lat:          loc.lat,
                          lng:          loc.lng,
                          source:       'manual',
                        },
                      })
                    } catch {
                      // show error toast
                    }
                  }}
                  className="w-full pl-10 pr-4 py-2.5 bg-surface-modal border border-border rounded-xl appearance-none font-sans text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Change neighborhood manually</option>
                  {KIGALI_NEIGHBORHOODS.map((n) => (
                    <option key={n.name} value={n.displayLabel}>{n.displayLabel}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location store vs profile mismatch notice */}
            {userLocation && user?.location &&
             userLocation.displayLabel !== user.location.displayLabel && (
              <div className="flex items-start gap-2 px-3 py-2.5 bg-warning/10 border border-warning/20 rounded-xl">
                <span className="text-warning text-xs mt-0.5">⚠</span>
                <p className="text-xs font-sans text-text-secondary">
                  Your active search location ({userLocation.displayLabel.split(',')[0]}) differs
                  from your saved profile location ({user.location.displayLabel.split(',')[0]}).{' '}
                  <button
                    onClick={async () => {
                      if (!user.location) return
                      setLocation({
                        lat:          user.location.lat,
                        lng:          user.location.lng,
                        displayLabel: user.location.displayLabel,
                        source:       user.location.source ?? 'manual',
                        obtainedAt:   new Date().toISOString(),
                      })
                    }}
                    className="text-primary font-semibold hover:underline"
                  >
                    Use profile location
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* ── Premium upsell ── */}
        {user.trustLevel < 3 && (
          <div className="flex items-center justify-between gap-4 px-5 py-4 bg-navy rounded-2xl border border-navy-light">
            <div>
              <p className="font-display font-bold text-white text-sm">{STRINGS.profile.goPremium}</p>
              <p className="text-xs text-white/70 font-sans mt-0.5">{STRINGS.profile.premiumSell}</p>
            </div>
            <Button size="sm" className="flex-shrink-0">
              {STRINGS.profile.upgrade}
            </Button>
          </div>
        )}

        {/* ── Menu list ── */}
        <div className="bg-surface-card rounded-3xl border border-border overflow-hidden">
          {menuRows.map((row, i) => {
            const inner = (
              <div
                className={clsx(
                  'flex items-center gap-3 px-5 py-4 transition-colors',
                  i < menuRows.length - 1 && 'border-b border-border',
                  row.danger
                    ? 'hover:bg-danger/5 text-danger'
                    : 'hover:bg-surface-modal text-text-secondary hover:text-text-primary',
                  (row.to || row.onClick) && 'cursor-pointer'
                )}
              >
                <span className={clsx('flex-shrink-0', row.danger ? 'text-danger' : 'text-text-secondary')}>
                  {row.icon}
                </span>
                <span
                  className={clsx(
                    'flex-1 text-sm font-semibold font-sans',
                    row.danger ? 'text-danger' : 'text-text-primary'
                  )}
                >
                  {row.label}
                </span>
                {row.badge !== undefined && row.badge > 0 && (
                  <span className="w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-xs font-bold font-sans">
                    {row.badge}
                  </span>
                )}
                <ChevronRight className={clsx('w-4 h-4 flex-shrink-0', row.danger ? 'text-danger/50' : 'text-text-muted')} />
              </div>
            )

            if (row.onClick) {
              return <button key={row.label} className="w-full text-left" onClick={row.onClick}>{inner}</button>
            }
            return <Link key={row.label} to={row.to!}>{inner}</Link>
          })}
        </div>

        {/* ── My listings tabs ── */}
        <div className="flex flex-col gap-4">
          <div className="flex gap-1 p-1 bg-surface-card rounded-2xl border border-border">
            {(['listings', 'favourites'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  'flex-1 py-2.5 rounded-xl text-sm font-semibold font-sans transition-all duration-150 capitalize',
                  activeTab === tab
                    ? 'bg-primary text-white shadow-primary/30 shadow-md'
                    : 'text-text-secondary hover:text-text-primary'
                )}
              >
                {tab === 'listings' ? STRINGS.profile.myAds : STRINGS.profile.favourites}
              </button>
            ))}
          </div>

          {activeTab === 'listings' && (
            <ListingGrid
              listings={myListings}
              loading={isLoadingListings}
              layout="grid"
              columns={2}
              skeletonCount={4}
              emptyMessage="You haven't posted any ads yet."
            />
          )}

          {activeTab === 'favourites' && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <span className="text-4xl">❤️</span>
              <p className="text-sm text-text-secondary font-sans">Your saved listings will appear here.</p>
              <Button variant="outline" size="sm" onClick={() => navigate('/')}>Browse listings</Button>
            </div>
          )}
        </div>

        {/* Bottom spacer */}
        <div className="h-8" />
      </main>
    </>
  )
}
