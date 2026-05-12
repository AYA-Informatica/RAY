import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import {
  MapPin,
  Clock,
  Share2,
  Flag,
  Heart,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Phone,
} from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '@/components/atoms/Button'
import { Badge } from '@/components/atoms/Badge'
import { UserRow } from '@/components/molecules/UserRow'
import { ListingGrid } from '@/components/organisms/ListingGrid'
import { ListingCardSkeleton } from '@/components/atoms/Skeleton'
import { useListing, useSimilarListings } from '@/hooks/useListings'
import { useAuthStore } from '@/store/authStore'
import { useListingsStore } from '@/store/listingsStore'
import { chatApi } from '@/services/api'
import { STRINGS } from '@/constants/strings'

function timeAgo(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ${STRINGS.listing.postedAgo}`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${STRINGS.listing.postedAgo}`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ${STRINGS.listing.postedAgo}`
  return `${Math.floor(seconds / 86400)}d ${STRINGS.listing.postedAgo}`
}

export const ListingDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const toggleSaved = useListingsStore((s) => s.toggleSaved)
  const isSaved = useListingsStore((s) => s.isSaved(id ?? ''))

  const { listing, isLoading } = useListing(id ?? '')
  const { similar, isLoading: loadingSimilar } = useSimilarListings(id ?? '')

  const [activeImage, setActiveImage] = useState(0)
  const [descExpanded, setDescExpanded] = useState(false)
  const [startingChat, setStartingChat] = useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [id])

  const handleChat = async () => {
    if (!user) {
      console.log('[ListingDetail] 🚪 User not logged in, redirecting to login')
      navigate('/login', { state: { from: `/listing/${id}` } })
      return
    }
    console.log('[ListingDetail] 💬 Starting chat with seller', {
      listingId: id,
      sellerId: listing?.seller.id,
    })
    setStartingChat(true)
    try {
      const convo = await chatApi.startConversation(id!)
      console.log('[ListingDetail] ✅ Chat started', { conversationId: convo.id })
      navigate(`/chat/${convo.id}`)
    } catch (err) {
      console.error('[ListingDetail] ❌ Failed to start chat', err)
    } finally {
      setStartingChat(false)
    }
  }

  const handleShare = () => {
    const url = window.location.href
    const text = listing
      ? `${listing.title} — ${STRINGS.currency.format(listing.price)}\n${url}`
      : url
    if (navigator.share) {
      navigator.share({ title: listing?.title, text, url })
    } else {
      const wa = `https://wa.me/?text=${encodeURIComponent(text)}`
      window.open(wa, '_blank')
    }
  }

  if (isLoading) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-[3fr_2fr] gap-8">
          <ListingCardSkeleton />
          <div className="flex flex-col gap-4">
            <ListingCardSkeleton />
            <ListingCardSkeleton />
          </div>
        </div>
      </main>
    )
  }

  if (!listing) {
    return (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <p className="text-4xl mb-4">😕</p>
        <h1 className="text-xl font-display font-bold text-text-primary mb-2">
          {STRINGS.errors.notFound}
        </h1>
        <Link to="/" className="text-primary font-sans text-sm hover:underline">
          Back to home
        </Link>
      </main>
    )
  }

  const images = listing.images.length > 0 ? listing.images : [listing.coverImage]

  return (
    <>
      <Helmet>
        <title>{`${listing.title} — ${STRINGS.currency.format(listing.price)} | RAY`}</title>
        <meta name="description" content={listing.description ?? listing.title} />
        <meta property="og:title" content={listing.title} />
        <meta property="og:description" content={`${STRINGS.currency.format(listing.price)} · ${listing.location.displayLabel}`} />
        <meta property="og:image" content={listing.coverImage} />
        <meta property="og:url" content={window.location.href} />
        <link rel="canonical" href={window.location.href} />
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: listing.title,
            image: listing.images,
            description: listing.description,
            offers: {
              '@type': 'Offer',
              price: listing.price,
              priceCurrency: 'RWF',
              availability: listing.status === 'active'
                ? 'https://schema.org/InStock'
                : 'https://schema.org/SoldOut',
            },
            seller: { '@type': 'Person', name: listing.seller.displayName },
          })}
        </script>
      </Helmet>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:grid lg:grid-cols-[3fr_2fr] gap-6 lg:gap-8">

          {/* ── Left: Images + Description ── */}
          <div className="flex flex-col gap-6">

            {/* Image gallery */}
            <div className="flex flex-col gap-3">
              {/* Main image */}
              <div className="relative rounded-3xl overflow-hidden bg-surface-card aspect-[4/3]">
                <img
                  src={images[activeImage]}
                  alt={`${listing.title} image ${activeImage + 1}`}
                  className="w-full h-full object-cover"
                />

                {/* Nav arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((i) => Math.max(0, i - 1))}
                      disabled={activeImage === 0}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white disabled:opacity-30 hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveImage((i) => Math.min(images.length - 1, i + 1))}
                      disabled={activeImage === images.length - 1}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white disabled:opacity-30 hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>

                    {/* Dot indicators */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {images.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setActiveImage(i)}
                          className={clsx(
                            'w-2 h-2 rounded-full transition-all duration-200',
                            i === activeImage ? 'bg-white w-4' : 'bg-white/50'
                          )}
                        />
                      ))}
                    </div>
                  </>
                )}

                {/* Status badge */}
                {listing.status === 'sold' && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <Badge variant="danger" className="text-base px-4 py-2">SOLD</Badge>
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImage(i)}
                      className={clsx(
                        'w-16 h-16 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-colors',
                        i === activeImage ? 'border-primary' : 'border-transparent'
                      )}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Description */}
            {listing.description && (
              <div className="flex flex-col gap-2">
                <h2 className="font-display font-bold text-text-primary">Description</h2>
                <div
                  className={clsx(
                    'text-sm font-sans text-text-secondary leading-relaxed',
                    !descExpanded && 'line-clamp-4'
                  )}
                >
                  {listing.description}
                </div>
                {listing.description.length > 200 && (
                  <button
                    onClick={() => setDescExpanded((v) => !v)}
                    className="text-sm text-primary font-semibold font-sans self-start hover:text-primary-dark transition-colors"
                  >
                    {descExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}

            {/* Details */}
            {listing.meta && Object.keys(listing.meta).length > 0 && (
              <div className="flex flex-col gap-3">
                <h2 className="font-display font-bold text-text-primary">Details</h2>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(listing.meta).map(([key, value]) => {
                    if (value === undefined || value === null || value === '') return null
                    // Convert key from snake_case to Title Case for display
                    const label = key
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (c) => c.toUpperCase())
                    const displayValue =
                      typeof value === 'boolean'
                        ? value ? 'Yes' : 'No'
                        : String(value)
                    return (
                      <div key={key} className="flex flex-col gap-0.5 px-3 py-2.5 bg-surface-modal rounded-xl">
                        <span className="text-xs text-text-muted font-sans uppercase tracking-wide">{label}</span>
                        <span className="text-sm font-semibold text-text-primary font-sans">{displayValue}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Safety tip */}
            <div className="flex items-start gap-3 p-4 bg-warning/10 border border-warning/20 rounded-2xl">
              <ShieldCheck className="w-5 h-5 text-warning flex-shrink-0 mt-0.5" />
              <p className="text-sm font-sans text-text-secondary">{STRINGS.listing.safetyTip}</p>
            </div>
          </div>

          {/* ── Right: Price + Actions + Seller (sticky on desktop) ── */}
          <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">

            {/* Price card */}
            <div className="bg-surface-card rounded-3xl p-5 flex flex-col gap-4">
              {/* Header row: price + actions */}
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-3xl font-display font-bold text-primary leading-tight">
                    {STRINGS.currency.format(listing.price)}
                  </p>
                  {listing.negotiable && (
                    <p className="text-sm text-text-secondary font-sans mt-0.5">
                      {STRINGS.listing.negotiable}
                    </p>
                  )}
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => toggleSaved(listing.id)}
                    className={clsx(
                      'p-2.5 rounded-xl border border-border transition-colors hover:border-primary',
                      isSaved ? 'text-primary border-primary' : 'text-text-secondary'
                    )}
                    aria-label="Save listing"
                  >
                    <Heart className={clsx('w-5 h-5', isSaved && 'fill-primary')} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-xl border border-border text-text-secondary hover:border-primary hover:text-primary transition-colors"
                    aria-label="Share listing"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Title + badges */}
              <div>
                <h1 className="text-xl font-display font-bold text-text-primary leading-snug">
                  {listing.title}
                </h1>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant={
                    listing.condition === 'new' ? 'success' :
                    listing.condition === 'like_new' ? 'primary' :
                    listing.condition === 'good' ? 'warning' : 'muted'
                  }>
                    {STRINGS.listing.condition[listing.condition]}
                  </Badge>
                  {listing.isFeatured && <Badge variant="featured">Featured</Badge>}
                </div>
              </div>

              {/* Location + time */}
              <div className="flex flex-col gap-1.5 text-sm text-text-secondary font-sans">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                  {listing.location.displayLabel}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 flex-shrink-0" />
                  {timeAgo(listing.postedAt)}
                </div>
              </div>

              {/* CTA */}
              <Button
                fullWidth
                size="lg"
                onClick={handleChat}
                loading={startingChat}
                disabled={listing.status === 'sold'}
              >
                {listing.status === 'sold' ? 'Item Sold' : STRINGS.listing.chatWithSeller}
              </Button>

              {listing.seller.verificationStatus === 'dealer' && (
                <Button fullWidth size="md" variant="outline" leftIcon={<Phone className="w-4 h-4" />}>
                  Call Seller
                </Button>
              )}
            </div>

            {/* Seller card */}
            <div className="bg-surface-card rounded-3xl p-5 flex flex-col gap-4">
              <h2 className="font-display font-bold text-text-primary text-sm uppercase tracking-wider text-text-secondary">
                {STRINGS.listing.sellerInfo}
              </h2>
              <UserRow
                user={listing.seller}
                showRating
                rating={4.8}
                reviewCount={127}
                subtitle={`${STRINGS.listing.memberSince} Jan 2023`}
                meta={`${STRINGS.listing.responseRate}: 95%`}
                rightContent={
                  <Link
                    to={`/profile/${listing.seller.id}`}
                    className="text-sm font-semibold text-primary hover:text-primary-dark font-sans transition-colors"
                  >
                    {STRINGS.listing.viewProfile}
                  </Link>
                }
              />
            </div>

            {/* Report */}
            <button
              className="flex items-center gap-2 text-xs text-text-muted hover:text-danger font-sans transition-colors self-center py-2"
            >
              <Flag className="w-3.5 h-3.5" />
              {STRINGS.listing.reportListing}
            </button>
          </div>
        </div>

        {/* ── Similar listings ── */}
        <div className="mt-12">
          <ListingGrid
            title={STRINGS.listing.similarListings}
            listings={similar}
            loading={loadingSimilar}
            layout="grid"
            columns={4}
            skeletonCount={4}
          />
        </div>
      </main>
    </>
  )
}
