import { Link } from 'react-router-dom'
import { clsx } from 'clsx'
import { MapPin, Clock, CheckCircle2, Heart } from 'lucide-react'
import { Badge } from '@/components/atoms/Badge'
import { STRINGS } from '@/constants/strings'
import { useListingsStore } from '@/store/listingsStore'
import type { Listing } from '@/types'

export interface ListingCardProps {
  listing: Listing
  className?: string
  /** Compact horizontal layout for chat/search rows */
  compact?: boolean
}

function timeAgo(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

const conditionVariant = {
  new: 'success',
  like_new: 'primary',
  good: 'warning',
  fair: 'muted',
} as const

/**
 * ListingCard molecule — the core unit of the RAY feed.
 * Used in grids, horizontal scrolls, and search results.
 */
export const ListingCard = ({ listing, className, compact = false }: ListingCardProps) => {
  const toggleSaved = useListingsStore((s) => s.toggleSaved)
  const isSaved = useListingsStore((s) => s.isSaved(listing.id))

  if (compact) {
    return (
      <Link
        to={`/listing/${listing.id}`}
        className={clsx(
          'flex items-center gap-3 p-3 rounded-2xl bg-surface-card hover:bg-surface-modal',
          'transition-colors duration-150 group',
          className
        )}
      >
        <div className="w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden bg-surface-modal">
          <img
            src={listing.coverImage}
            alt={listing.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-text-primary truncate font-sans">
            {listing.title}
          </p>
          <p className="text-primary font-bold text-sm font-sans">
            {STRINGS.currency.format(listing.price)}
          </p>
          <p className="text-xs text-text-secondary font-sans truncate">
            {listing.location.displayLabel}
          </p>
        </div>
      </Link>
    )
  }

  return (
    <div
      className={clsx(
        'group relative flex flex-col rounded-2xl overflow-hidden bg-surface-card',
        'hover:shadow-card-hover transition-shadow duration-300',
        className
      )}
      data-testid="listing-card"
    >
      {/* Image */}
      <Link to={`/listing/${listing.id}`} className="relative block aspect-[4/3] overflow-hidden">
        <img
          src={listing.coverImage}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

        {/* Featured badge */}
        {listing.isFeatured && (
          <div className="absolute top-2 left-2">
            <Badge variant="featured">{STRINGS.listing.featured}</Badge>
          </div>
        )}

        {/* Condition badge */}
        <div className="absolute top-2 right-2">
          <Badge variant={conditionVariant[listing.condition]}>
            {STRINGS.listing.condition[listing.condition]}
          </Badge>
        </div>
      </Link>

      {/* Save button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          e.preventDefault()
          toggleSaved(listing.id)
        }}
        className={clsx(
          'absolute top-2 right-2 mt-7 p-1.5 rounded-full transition-colors duration-150',
          'bg-black/30 hover:bg-black/50',
          isSaved ? 'text-primary' : 'text-white'
        )}
        aria-label={isSaved ? 'Remove from saved' : 'Save listing'}
      >
        <Heart className={clsx('w-3.5 h-3.5', isSaved && 'fill-primary')} />
      </button>

      {/* Info */}
      <Link to={`/listing/${listing.id}`} className="flex flex-col gap-1 p-3">
        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="text-primary font-bold text-base font-sans leading-tight">
            {STRINGS.currency.format(listing.price)}
          </span>
          {listing.negotiable && (
            <span className="text-xs text-text-secondary font-sans">
              {STRINGS.listing.negotiable}
            </span>
          )}
        </div>

        {/* Title */}
        <p className="text-sm font-semibold text-text-primary font-sans line-clamp-1 leading-snug">
          {listing.title}
        </p>

        {/* Meta row */}
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-1 text-text-secondary">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="text-xs font-sans truncate max-w-[100px]">
              {listing.location.neighborhood}
            </span>
          </div>
          <div className="flex items-center gap-1 text-text-secondary">
            <Clock className="w-3 h-3" />
            <span className="text-xs font-sans">{timeAgo(listing.postedAt)}</span>
          </div>
        </div>

        {/* Seller trust row */}
        {listing.seller.verificationStatus !== 'none' && (
          <div className="flex items-center gap-1 mt-0.5">
            <CheckCircle2 className="w-3 h-3 text-success flex-shrink-0" />
            <span className="text-xs text-success font-sans">{STRINGS.trust.verified}</span>
          </div>
        )}
      </Link>
    </div>
  )
}
