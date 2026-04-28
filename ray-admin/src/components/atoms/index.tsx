import { forwardRef, ButtonHTMLAttributes, InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'
import { Loader2 } from 'lucide-react'

// ─── Button ───────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'success'
type BtnSize = 'xs' | 'sm' | 'md' | 'lg'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: BtnVariant
  size?: BtnSize
  loading?: boolean
  fullWidth?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const btnVariants: Record<BtnVariant, string> = {
  primary:   'bg-primary text-white hover:bg-primary-dark',
  secondary: 'bg-surface-modal text-text-primary hover:bg-surface-card border border-border',
  ghost:     'bg-transparent text-text-secondary hover:text-text-primary hover:bg-white/5',
  danger:    'bg-danger text-white hover:bg-red-700',
  outline:   'bg-transparent border border-border text-text-primary hover:border-primary',
  success:   'bg-success text-white hover:bg-green-600',
}
const btnSizes: Record<BtnSize, string> = {
  xs: 'px-2.5 py-1 text-xs rounded-lg',
  sm: 'px-3.5 py-1.5 text-sm rounded-xl',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-2xl',
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, fullWidth, leftIcon, rightIcon, children, className, disabled, ...props }, ref) => (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={clsx(
        'inline-flex items-center justify-center gap-2 font-semibold font-sans',
        'transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        'disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]',
        btnVariants[variant], btnSizes[size],
        fullWidth && 'w-full', className
      )}
      {...props}
    >
      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  )
)
Button.displayName = 'Button'

// ─── Badge ────────────────────────────────────
type BadgeVariant = 'success' | 'warning' | 'danger' | 'primary' | 'muted' | 'navy'
const badgeVariants: Record<BadgeVariant, string> = {
  success: 'bg-success/15 text-success border-success/20',
  warning: 'bg-warning/15 text-warning border-warning/20',
  danger:  'bg-danger/15 text-danger border-danger/20',
  primary: 'bg-primary/15 text-primary border-primary/20',
  muted:   'bg-white/5 text-text-secondary border-border',
  navy:    'bg-navy text-white border-navy-light',
}

export const Badge = ({
  variant = 'muted', children, className, dot,
}: { variant?: BadgeVariant; children: React.ReactNode; className?: string; dot?: boolean }) => (
  <span className={clsx(
    'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold border font-sans',
    badgeVariants[variant], className
  )}>
    {dot && <span className={clsx('w-1.5 h-1.5 rounded-full',
      variant === 'success' ? 'bg-success' : variant === 'danger' ? 'bg-danger' :
      variant === 'warning' ? 'bg-warning' : 'bg-primary'
    )} />}
    {children}
  </span>
)

// ─── Input ────────────────────────────────────
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  leftIcon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, leftIcon, className, ...props }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <label className="text-sm font-semibold text-text-primary font-sans">{label}</label>}
      <div className="relative">
        {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">{leftIcon}</span>}
        <input
          ref={ref}
          className={clsx(
            'w-full bg-surface-modal border rounded-xl px-3 py-2.5 text-text-primary font-sans text-sm',
            'placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
            'transition-colors duration-150 disabled:opacity-50',
            error ? 'border-danger' : 'border-border',
            leftIcon && 'pl-9', className
          )}
          {...props}
        />
      </div>
      {hint && !error && <p className="text-xs text-text-secondary font-sans">{hint}</p>}
      {error && <p className="text-xs text-danger font-sans">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

// ─── Skeleton ─────────────────────────────────
export const Skeleton = ({ className, rounded = 'md' }: { className?: string; rounded?: 'sm' | 'md' | 'lg' | 'full' }) => (
  <div className={clsx(
    'relative overflow-hidden bg-surface-modal',
    { sm: 'rounded', md: 'rounded-xl', lg: 'rounded-2xl', full: 'rounded-full' }[rounded],
    className
  )}>
    <div className="absolute inset-0" style={{
      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
      backgroundSize: '200% 100%', animation: 'skeleton 1.5s ease-in-out infinite',
    }} />
  </div>
)

// ─── StatCard ─────────────────────────────────
export const StatCard = ({
  title, value, change, icon, color = 'primary',
}: {
  title: string
  value: string | number
  change?: { value: number; label: string }
  icon: React.ReactNode
  color?: 'primary' | 'success' | 'warning' | 'danger'
}) => {
  const colorMap = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    warning: 'bg-warning/10 text-warning',
    danger:  'bg-danger/10 text-danger',
  }
  return (
    <div className="bg-surface-card rounded-2xl border border-border p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between">
        <div className={clsx('p-2.5 rounded-xl', colorMap[color])}>{icon}</div>
        {change && (
          <span className={clsx('text-xs font-semibold font-sans px-2 py-0.5 rounded-full',
            change.value >= 0 ? 'text-success bg-success/10' : 'text-danger bg-danger/10'
          )}>
            {change.value >= 0 ? '+' : ''}{change.value}% {change.label}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-display font-bold text-text-primary">{value}</p>
        <p className="text-sm text-text-secondary font-sans mt-0.5">{title}</p>
      </div>
    </div>
  )
}
