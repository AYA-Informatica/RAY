import { clsx } from 'clsx'
import { User } from 'lucide-react'

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export interface AvatarProps {
  src?: string
  alt?: string
  size?: AvatarSize
  online?: boolean
  className?: string
}

const sizeClasses: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-14 h-14 text-xl',
  xl: 'w-20 h-20 text-2xl',
}

const dotSizeClasses: Record<AvatarSize, string> = {
  xs: 'w-1.5 h-1.5 border',
  sm: 'w-2 h-2 border',
  md: 'w-2.5 h-2.5 border-2',
  lg: 'w-3 h-3 border-2',
  xl: 'w-4 h-4 border-2',
}

/**
 * RAY avatar atom with optional online indicator.
 */
export const Avatar = ({ src, alt = 'User', size = 'md', online, className }: AvatarProps) => {
  return (
    <div className={clsx('relative flex-shrink-0', className)}>
      <div
        className={clsx(
          'rounded-full overflow-hidden bg-surface-modal flex items-center justify-center',
          sizeClasses[size]
        )}
      >
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <User className="w-1/2 h-1/2 text-text-secondary" />
        )}
      </div>
      {online !== undefined && (
        <span
          className={clsx(
            'absolute bottom-0 right-0 rounded-full border-background',
            dotSizeClasses[size],
            online ? 'bg-success' : 'bg-text-muted'
          )}
        />
      )}
    </div>
  )
}
