import { clsx } from 'clsx'

export interface SkeletonProps {
  className?: string
  rounded?: 'sm' | 'md' | 'lg' | 'full'
}

/**
 * RAY skeleton loader — animated shimmer placeholder.
 * Use instead of spinners on data-fetching screens.
 */
export const Skeleton = ({ className, rounded = 'md' }: SkeletonProps) => {
  const roundedClass = {
    sm: 'rounded',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    full: 'rounded-full',
  }[rounded]

  return (
    <div
      className={clsx(
        'relative overflow-hidden bg-surface-modal',
        roundedClass,
        className
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%)',
          backgroundSize: '200% 100%',
          animation: 'skeleton 1.5s ease-in-out infinite',
        }}
      />
    </div>
  )
}

export const ListingCardSkeleton = () => (
  <div className="flex flex-col gap-2 rounded-2xl overflow-hidden bg-surface-card">
    <Skeleton className="w-full aspect-[4/3]" rounded="sm" />
    <div className="p-3 flex flex-col gap-2">
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-3 w-3/4" />
    </div>
  </div>
)
