import { clsx } from 'clsx'
import { X } from 'lucide-react'

export interface FilterChipProps {
  label: string
  active?: boolean
  removable?: boolean
  onClick?: () => void
  onRemove?: () => void
  className?: string
}

/**
 * FilterChip molecule — used in search filter bars and active filter rows.
 */
export const FilterChip = ({
  label,
  active = false,
  removable = false,
  onClick,
  onRemove,
  className,
}: FilterChipProps) => {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold font-sans',
        'border transition-all duration-150 whitespace-nowrap flex-shrink-0',
        active
          ? 'bg-primary text-white border-primary'
          : 'bg-surface-modal text-text-secondary border-border hover:border-primary hover:text-text-primary',
        className
      )}
    >
      {label}
      {removable && active && (
        <span
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation()
            onRemove?.()
          }}
          onKeyDown={(e) => e.key === 'Enter' && onRemove?.()}
          className="ml-0.5 hover:opacity-70 transition-opacity"
          aria-label={`Remove ${label} filter`}
        >
          <X className="w-3 h-3" />
        </span>
      )}
    </button>
  )
}
