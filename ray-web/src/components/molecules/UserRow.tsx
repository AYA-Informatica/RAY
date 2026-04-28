import { clsx } from 'clsx'
import { CheckCircle2, Zap, Star } from 'lucide-react'
import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { STRINGS } from '@/constants/strings'
import type { UserSummary } from '@/types'

export interface UserRowProps {
  user: UserSummary
  subtitle?: string
  meta?: string
  showRating?: boolean
  rating?: number
  reviewCount?: number
  className?: string
  onClick?: () => void
  rightContent?: React.ReactNode
}

/**
 * UserRow molecule — displays a user's identity with trust indicators.
 * Used in listing detail seller cards, conversation rows, profile headers.
 */
export const UserRow = ({
  user,
  subtitle,
  meta,
  showRating = false,
  rating,
  reviewCount,
  className,
  onClick,
  rightContent,
}: UserRowProps) => {
  return (
    <div
      className={clsx(
        'flex items-center gap-3',
        onClick && 'cursor-pointer hover:opacity-80 transition-opacity',
        className
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <Avatar src={user.avatar} alt={user.displayName} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-sm font-semibold text-text-primary font-sans truncate">
            {user.displayName}
          </span>
          {user.verificationStatus !== 'none' && (
            <CheckCircle2 className="w-3.5 h-3.5 text-success flex-shrink-0" />
          )}
          {user.trustLevel === 3 && (
            <Badge variant="primary" className="text-[10px] py-0 px-1.5">
              {STRINGS.trust.topSeller}
            </Badge>
          )}
        </div>

        {showRating && rating !== undefined && (
          <div className="flex items-center gap-1 mt-0.5">
            <Star className="w-3 h-3 text-warning fill-warning" />
            <span className="text-xs font-semibold text-text-primary font-sans">{rating}</span>
            {reviewCount !== undefined && (
              <span className="text-xs text-text-secondary font-sans">
                · {reviewCount} reviews
              </span>
            )}
          </div>
        )}

        {subtitle && (
          <p className="text-xs text-text-secondary font-sans mt-0.5">{subtitle}</p>
        )}
        {meta && (
          <p className="text-xs text-text-muted font-sans">{meta}</p>
        )}

        {user.responseRate !== undefined && user.responseRate >= 80 && (
          <div className="flex items-center gap-1 mt-0.5">
            <Zap className="w-3 h-3 text-warning" />
            <span className="text-xs text-warning font-sans">{STRINGS.trust.fastReply}</span>
          </div>
        )}
      </div>

      {rightContent && <div className="flex-shrink-0">{rightContent}</div>}
    </div>
  )
}
