import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  LayoutDashboard, List, Users, Flag, BarChart3,
  Settings, LogOut, Shield, ChevronRight,
} from 'lucide-react'
import { useAdminAuthStore } from '@/store/adminAuthStore'
import { ROLE_PERMISSIONS } from '@/types'
import type { AdminRole } from '@/types'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  roles: AdminRole[]
  badge?: number
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',  to: '/admin/dashboard',  icon: <LayoutDashboard className="w-4 h-4" />, roles: ['admin'] },
  { label: 'Listings',   to: '/admin/listings',   icon: <List className="w-4 h-4" />,            roles: ['admin', 'moderator'] },
  { label: 'Users',      to: '/admin/users',      icon: <Users className="w-4 h-4" />,           roles: ['admin', 'support'] },
  { label: 'Reports',    to: '/admin/reports',    icon: <Flag className="w-4 h-4" />,            roles: ['admin', 'moderator', 'support'] },
  { label: 'Analytics',  to: '/admin/analytics',  icon: <BarChart3 className="w-4 h-4" />,       roles: ['admin'] },
  { label: 'Settings',   to: '/admin/settings',   icon: <Settings className="w-4 h-4" />,        roles: ['admin'] },
]

const ROLE_COLORS: Record<AdminRole, string> = {
  admin:     'bg-primary/20 text-primary',
  moderator: 'bg-warning/20 text-warning',
  support:   'bg-success/20 text-success',
}

export const AdminLayout = () => {
  const navigate = useNavigate()
  const { adminUser, logout } = useAdminAuthStore()
  const role = adminUser?.role ?? 'support'
  const perms = ROLE_PERMISSIONS[role]

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(role))

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* ── Sidebar ── */}
      <aside className="w-60 flex-shrink-0 bg-sidebar border-r border-border flex flex-col fixed inset-y-0 left-0 z-40">
        {/* Brand */}
        <div className="px-5 py-5 border-b border-border flex items-center gap-2">
          <span className="font-display font-bold text-2xl text-primary">RAY</span>
          <span className="text-xs font-sans text-text-muted bg-surface-modal px-2 py-0.5 rounded-md border border-border">
            Admin
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5 overflow-y-auto">
          {visibleNav.map(({ label, to, icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold font-sans',
                'transition-all duration-150 group',
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-text-secondary hover:text-text-primary hover:bg-sidebar-hover'
              )}
            >
              {({ isActive }) => (
                <>
                  <span className={clsx(
                    'flex-shrink-0 transition-colors',
                    isActive ? 'text-primary' : 'text-text-muted group-hover:text-text-secondary'
                  )}>
                    {icon}
                  </span>
                  <span className="flex-1">{label}</span>
                  {badge !== undefined && badge > 0 && (
                    <span className="text-[10px] font-bold bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-border p-3 flex flex-col gap-2">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-surface-modal">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-text-primary font-sans truncate">
                {adminUser?.displayName ?? adminUser?.email ?? 'Admin'}
              </p>
              <span className={clsx(
                'text-[10px] font-bold font-sans px-1.5 py-0.5 rounded-md capitalize',
                ROLE_COLORS[role]
              )}>
                {role}
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-sans text-danger hover:bg-danger/10 transition-colors w-full"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <main className="flex-1 ml-60 min-h-screen flex flex-col">
        <Outlet />
      </main>
    </div>
  )
}

// ─── Page header component ───────────────────
export const PageHeader = ({
  title, subtitle, actions,
}: {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}) => (
  <div className="flex items-start justify-between gap-4 px-8 py-6 border-b border-border bg-sidebar">
    <div>
      <h1 className="font-display font-bold text-xl text-text-primary">{title}</h1>
      {subtitle && <p className="text-sm text-text-secondary font-sans mt-0.5">{subtitle}</p>}
    </div>
    {actions && <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>}
  </div>
)
