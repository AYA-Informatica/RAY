import { clsx } from 'clsx'

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'muted' | 'navy' | 'featured'

export interface BadgeProps {
  variant?: BadgeVariant
  children: React.ReactNode
  className?: string
  dot?: boolean
}

const variantClasses: Record<BadgeVariant, string> = {
  primary: 'bg-primary/20 text-primary border border-primary/30',
  success: 'bg-success/20 text-success border border-success/30',
  warning: 'bg-warning/20 text-warning border border-warning/30',
  danger: 'bg-danger/20 text-danger border border-danger/30',
  muted: 'bg-white/10 text-text-secondary border border-border',
  navy: 'bg-navy text-white border border-navy-light',
  featured: 'bg-primary text-white border border-primary-dark',
}

/**
 * RAY badge atom — for conditions, trust levels, featured labels.
 */
export const Badge = ({ variant = 'muted', children, className, dot }: BadgeProps) => {
  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold font-sans',
        variantClasses[variant],
        className
      )}
    >
      {dot && (
        <span
          className={clsx(
            'w-1.5 h-1.5 rounded-full',
            variant === 'success' && 'bg-success',
            variant === 'warning' && 'bg-warning',
            variant === 'danger' && 'bg-danger',
            variant === 'primary' && 'bg-primary',
            (variant === 'muted' || variant === 'navy' || variant === 'featured') && 'bg-white'
          )}
        />
      )}
      {children}
    </span>
  )
}
