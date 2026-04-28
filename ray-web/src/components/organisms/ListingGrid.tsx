import { clsx } from 'clsx'
import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { ListingCard } from '@/components/molecules/ListingCard'
import { ListingCardSkeleton } from '@/components/atoms/Skeleton'
import type { Listing } from '@/types'

interface ListingGridProps {
  listings: Listing[]
  loading?: boolean
  skeletonCount?: number
  title?: string
  seeAllHref?: string
  /** 'grid' = 2–3 col grid | 'scroll' = horizontal scrollable row */
  layout?: 'grid' | 'scroll'
  columns?: 2 | 3 | 4
  className?: string
  emptyMessage?: string
}

/**
 * ListingGrid organism — renders a section of listings in grid or scroll layout.
 * Handles loading skeletons and empty states.
 */
export const ListingGrid = ({
  listings,
  loading = false,
  skeletonCount = 6,
  title,
  seeAllHref,
  layout = 'grid',
  columns = 2,
  className,
  emptyMessage = 'No listings found',
}: ListingGridProps) => {
  const colClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-2 sm:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }[columns]

  return (
    <section className={clsx('flex flex-col gap-4', className)}>
      {/* Section header */}
      {(title || seeAllHref) && (
        <div className="flex items-center justify-between">
          {title && (
            <h2 className="text-lg font-display font-bold text-text-primary tracking-tight">
              {title}
            </h2>
          )}
          {seeAllHref && (
            <Link
              to={seeAllHref}
              className="flex items-center gap-0.5 text-sm font-semibold text-primary hover:text-primary-dark transition-colors font-sans"
            >
              See all
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}

      {/* Grid layout */}
      {layout === 'grid' && (
        <>
          {loading ? (
            <div className={clsx('grid gap-3', colClass)}>
              {Array.from({ length: skeletonCount }).map((_, i) => (
                <ListingCardSkeleton key={i} />
              ))}
            </div>
          ) : listings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <span className="text-5xl">🔍</span>
              <p className="text-text-secondary font-sans text-sm">{emptyMessage}</p>
            </div>
          ) : (
            <div className={clsx('grid gap-3', colClass)}>
              {listings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Horizontal scroll layout */}
      {layout === 'scroll' && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-4 px-4">
          {loading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-48">
                  <ListingCardSkeleton />
                </div>
              ))
            : listings.map((listing) => (
                <div key={listing.id} className="flex-shrink-0 w-48 sm:w-56">
                  <ListingCard listing={listing} />
                </div>
              ))}
        </div>
      )}
    </section>
  )
}
