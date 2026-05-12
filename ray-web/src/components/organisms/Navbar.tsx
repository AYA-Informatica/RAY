import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  Search,
  MapPin,
  Bell,
  MessageCircle,
  ChevronDown,
  User,
  LogOut,
  Heart,
  Plus,
} from 'lucide-react'
import { Button } from '@/components/atoms/Button'
import { Avatar } from '@/components/atoms/Avatar'
import { useAuthStore } from '@/store/authStore'
import { useLocationStore } from '@/store/locationStore'
import { LocationConfirmChip } from '@/components/molecules/LocationConfirmChip'
import { STRINGS } from '@/constants/strings'

/**
 * Navbar organism — sticky top navigation for RAY web.
 * Matches wireframe: Logo | Search + Location | PostAd + Chat + Notifs + Avatar
 */
export const Navbar = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { userLocation, requestGpsLocation } = useLocationStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [showUserMenu, setShowUserMenu] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-nav" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4 h-16">

          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 font-display font-bold text-2xl text-primary tracking-tight hover:opacity-90 transition-opacity"
          >
            RAY
          </Link>

          {/* Search bar — center */}
          <form
            onSubmit={handleSearch}
            className="flex-1 flex items-center gap-0 max-w-2xl mx-auto"
          >
            {/* Location pill */}
            <button
              type="button"
              onClick={async () => {
                if (userLocation) {
                  // Already have location — clicking refreshes it
                  await requestGpsLocation()
                } else {
                  await requestGpsLocation()
                }
              }}
              className={clsx(
                'hidden sm:flex items-center gap-1.5 px-3 h-11 rounded-l-2xl',
                'bg-surface-modal border border-r-0 border-border text-sm font-sans',
                'text-text-secondary hover:text-text-primary transition-colors flex-shrink-0 whitespace-nowrap'
              )}
            >
              <MapPin className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="hidden md:block max-w-[120px] truncate">
                {userLocation
                  ? userLocation.displayLabel === 'Your current location'
                    ? 'Near you'
                    : userLocation.displayLabel.split(',')[0]   // show just the neighborhood
                  : 'Rwanda'
                }
              </span>
              <ChevronDown className="w-3 h-3" />
            </button>

            {/* Location confirmation chip */}
            {user && !userLocation && (
              <div className="hidden sm:flex ml-2">
                <LocationConfirmChip />
              </div>
            )}

            {/* Search input */}
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={STRINGS.home.searchPlaceholder}
                data-testid="desktop-search-input"
                className={clsx(
                  'w-full h-11 pl-4 pr-12 bg-surface-modal border border-border',
                  'sm:rounded-none rounded-l-2xl rounded-r-2xl sm:rounded-r-none',
                  'font-sans text-sm text-text-primary placeholder:text-text-muted',
                  'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
                  'transition-colors duration-150'
                )}
              />
            </div>

            {/* Search button */}
            <button
              type="submit"
              className={clsx(
                'flex items-center justify-center w-12 h-11 rounded-r-2xl flex-shrink-0',
                'bg-primary hover:bg-primary-dark text-white transition-colors duration-150'
              )}
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Right actions */}
          <div className="flex items-center gap-1 flex-shrink-0">

            {/* Post Ad CTA */}
            <Button
              onClick={() => navigate('/post')}
              size="sm"
              className="hidden sm:flex gap-1.5"
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              {STRINGS.nav.postAd}
            </Button>

            {user ? (
              <>
                {/* Chat */}
                <Link
                  to="/chat"
                  className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-modal transition-colors"
                  aria-label="Chats"
                >
                  <MessageCircle className="w-5 h-5" />
                </Link>

                {/* Notifications */}
                <button
                  className="relative p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-modal transition-colors"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border border-background" />
                </button>

                {/* Saved */}
                <Link
                  to="/account/saved"
                  className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-modal transition-colors"
                  aria-label="Saved listings"
                >
                  <Heart className="w-5 h-5" />
                </Link>

                {/* Avatar + user menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu((v) => !v)}
                    className="flex items-center gap-2 p-1 rounded-xl hover:bg-surface-modal transition-colors"
                    aria-expanded={showUserMenu}
                    aria-haspopup="true"
                  >
                    <Avatar src={user.avatar} alt={user.displayName} size="sm" />
                    <ChevronDown className="w-3.5 h-3.5 text-text-secondary hidden sm:block" />
                  </button>

                  {showUserMenu && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setShowUserMenu(false)}
                      />
                      <div className="absolute right-0 top-full mt-2 w-52 bg-surface-modal border border-border rounded-2xl shadow-card z-50 overflow-hidden animate-fade-in">
                        <div className="px-4 py-3 border-b border-border">
                          <p className="text-sm font-semibold text-text-primary font-sans truncate">
                            {user.displayName}
                          </p>
                          <p className="text-xs text-text-secondary font-sans">{user.phone}</p>
                        </div>
                        <nav className="py-1">
                          {[
                            { label: 'My Ads', to: '/account/listings', icon: <User className="w-4 h-4" /> },
                            { label: 'Saved', to: '/account/saved', icon: <Heart className="w-4 h-4" /> },
                            { label: 'Settings', to: '/account/settings', icon: null },
                          ].map(({ label, to, icon }) => (
                            <Link
                              key={to}
                              to={to}
                              onClick={() => setShowUserMenu(false)}
                              className="flex items-center gap-3 px-4 py-2.5 text-sm font-sans text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
                            >
                              {icon}
                              {label}
                            </Link>
                          ))}
                          <button
                            onClick={() => { logout(); setShowUserMenu(false) }}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-sans text-danger hover:bg-danger/10 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            {STRINGS.nav.logout}
                          </button>
                        </nav>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <Button onClick={() => navigate('/login')} size="sm" variant="outline">
                {STRINGS.nav.login}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search — below header on small screens */}
      <div className="sm:hidden px-4 pb-3">
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search in RAY..."
            data-testid="mobile-search-input"
            className={clsx(
              'flex-1 h-10 px-4 bg-surface-modal border border-border rounded-2xl',
              'font-sans text-sm text-text-primary placeholder:text-text-muted',
              'focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
            )}
          />
          <button
            type="submit"
            className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary text-white"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>
    </header>
  )
}
