import { Outlet, Link } from 'react-router-dom'
import { Home, Search, Plus, MessageCircle, User } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { Navbar } from '@/components/organisms/Navbar'
import { useConversations } from '@/hooks/useChat'

const FOOTER_LINKS = {
  RAY: [
    { label: 'About', to: '/about' },
    { label: 'Careers', to: '/careers' },
    { label: 'Press', to: '/press' },
  ],
  Help: [
    { label: 'Help Centre', to: '/help' },
    { label: 'Safety Tips', to: '/safety' },
    { label: 'Contact Us', to: '/contact' },
  ],
  Legal: [
    { label: 'Terms', to: '/terms' },
    { label: 'Privacy', to: '/privacy' },
    { label: 'Cookie Policy', to: '/cookies' },
  ],
}

export const Layout = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { totalUnread } = useConversations()

  const navItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Home', to: '/' },
    { icon: <Search className="w-5 h-5" />, label: 'Search', to: '/search' },
    { icon: null, label: 'Sell', to: '/post', isFab: true },
    {
      icon: (
        <div className="relative">
          <MessageCircle className="w-5 h-5" />
          {totalUnread > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[9px] text-white font-bold">
              {totalUnread > 9 ? '9+' : totalUnread}
            </span>
          )}
        </div>
      ),
      label: 'Chats',
      to: '/chat',
    },
    { icon: <User className="w-5 h-5" />, label: 'Profile', to: '/account' },
  ]

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <div className="flex-1">
        <Outlet />
      </div>

      {/* Desktop Footer */}
      <footer className="hidden md:block border-t border-border bg-surface-card mt-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <div className="grid grid-cols-4 gap-8">
            {/* Brand */}
            <div className="flex flex-col gap-4">
              <span className="font-display font-bold text-2xl text-primary">RAY</span>
              <p className="text-sm font-sans text-text-secondary leading-relaxed">
                The fastest way to buy and sell locally in East Africa.
              </p>
              <p className="text-xs font-sans text-text-muted">
                © {new Date().getFullYear()} RAY Technologies Ltd
              </p>
            </div>

            {/* Link columns */}
            {Object.entries(FOOTER_LINKS).map(([title, links]) => (
              <div key={title} className="flex flex-col gap-3">
                <h3 className="text-xs font-display font-bold text-text-primary uppercase tracking-widest">
                  {title}
                </h3>
                {links.map(({ label, to }) => (
                  <Link
                    key={to}
                    to={to}
                    className="text-sm font-sans text-text-secondary hover:text-primary transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>

          {/* Bottom row */}
          <div className="mt-10 pt-6 border-t border-border flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs font-sans text-text-muted">
              🇷🇼 Kigali, Rwanda — Built for East Africa
            </p>
            <div className="flex gap-4">
              {['English', 'Kinyarwanda', 'Français'].map((lang) => (
                <button
                  key={lang}
                  className="text-xs font-sans text-text-muted hover:text-text-secondary transition-colors"
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile bottom tab bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-surface-card border-t border-border safe-area-pb">
        <div className="flex items-end justify-around px-2 py-2">
          {navItems.map(({ icon, label, to, isFab }) => {
            const isActive = location.pathname === to ||
              (to !== '/' && location.pathname.startsWith(to))

            if (isFab) {
              return (
                <button
                  key={to}
                  onClick={() => navigate(to)}
                  className={clsx(
                    'flex flex-col items-center justify-center -mt-5',
                    'w-14 h-14 rounded-full bg-primary shadow-primary',
                    'hover:bg-primary-dark active:scale-95 transition-all duration-150',
                    'border-4 border-background'
                  )}
                  aria-label="Post Ad"
                >
                  <Plus className="w-6 h-6 text-white" />
                </button>
              )
            }

            return (
              <Link
                key={to}
                to={to}
                className={clsx(
                  'flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition-colors',
                  isActive ? 'text-primary' : 'text-text-muted hover:text-text-secondary'
                )}
              >
                {icon}
                <span className="text-[10px] font-semibold font-sans">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Spacer for mobile nav */}
      <div className="md:hidden h-20" />
    </div>
  )
}
