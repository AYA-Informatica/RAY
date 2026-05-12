import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { MapPin, Calendar, MessageCircle, Flag, Star, Zap } from 'lucide-react'
import { Avatar } from '@/components/atoms/Avatar'
import { Badge } from '@/components/atoms/Badge'
import { Button } from '@/components/atoms/Button'
import { Skeleton } from '@/components/atoms/Skeleton'
import { ListingGrid } from '@/components/organisms/ListingGrid'
import { usersApi, chatApi, listingsApi } from '@/services/api'
import { useAuthStore } from '@/store/authStore'
import { useLocationStore } from '@/store/locationStore'
import { haversineDistanceKm } from '@/constants/neighborhoodCoords'
import { STRINGS } from '@/constants/strings'
import type { User, Listing } from '@/types'

export const SellerProfilePage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuthStore()
  const { userLocation } = useLocationStore()

  const [seller, setSeller] = useState<User | null>(null)
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isStartingChat, setIsStartingChat] = useState(false)

  const distanceFromSeller = useMemo(() => {
    if (!userLocation || !seller?.location?.lat || !seller?.location?.lng) return null
    return haversineDistanceKm(
      userLocation.lat, userLocation.lng,
      seller.location.lat, seller.location.lng
    )
  }, [userLocation, seller])

  useEffect(() => {
    if (!id) return
    Promise.all([
      usersApi.getProfile(id),
      listingsApi.getByUser(id),
    ]).then(([profile, ads]) => {
      setSeller(profile)
      setListings(ads)
    }).finally(() => setIsLoading(false))
  }, [id])

  const handleChat = async () => {
    if (!currentUser) { navigate('/login'); return }
    // Navigate to existing conversation or start new one from first active listing
    if (listings[0]) {
      setIsStartingChat(true)
      try {
        const convo = await chatApi.startConversation(listings[0].id)
        navigate(`/chat/${convo.id}`)
      } finally {
        setIsStartingChat(false)
      }
    }
  }

  if (isLoading) {
    return (
      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        <div className="flex flex-col gap-4 bg-surface-card rounded-3xl p-6 border border-border">
          <Skeleton className="h-20 w-20 mx-auto" rounded="full" />
          <Skeleton className="h-6 w-40 mx-auto" />
          <Skeleton className="h-4 w-60 mx-auto" />
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 rounded-2xl" />)}
          </div>
        </div>
      </main>
    )
  }

  if (!seller) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-16 text-center flex flex-col items-center gap-4">
        <span className="text-5xl">😕</span>
        <h1 className="font-display font-bold text-xl text-text-primary">User not found</h1>
        <Button onClick={() => navigate(-1)} variant="outline">Go back</Button>
      </main>
    )
  }

  const isOwnProfile = currentUser?.id === seller.id

  return (
    <>
      <Helmet>
        <title>{`${seller.displayName} | RAY`}</title>
        <meta name="description" content={`View ${seller.displayName}'s listings on RAY`} />
      </Helmet>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">

        {/* ── Profile card ── */}
        <div className="relative rounded-3xl overflow-hidden bg-surface-card border border-border">
          <div className="h-20 bg-gradient-to-br from-primary to-primary-dark" />

          <div className="px-5 pb-5">
            <div className="-mt-8 mb-3 flex items-end justify-between">
              <Avatar
                src={seller.avatar}
                alt={seller.displayName}
                size="xl"
                className="ring-4 ring-surface-card"
              />
              {!isOwnProfile && (
                <div className="flex gap-2">
                  <button className="p-2 rounded-xl border border-border text-text-secondary hover:text-danger hover:border-danger transition-colors">
                    <Flag className="w-4 h-4" />
                  </button>
                  <Button
                    size="sm"
                    onClick={handleChat}
                    loading={isStartingChat}
                    leftIcon={<MessageCircle className="w-4 h-4" />}
                  >
                    Chat
                  </Button>
                </div>
              )}
            </div>

            {/* Name + badges */}
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-display font-bold text-xl text-text-primary">
                  {seller.displayName}
                </h1>
                {seller.verificationStatus !== 'none' && (
                  <Badge variant="success" dot>{STRINGS.trust.verified}</Badge>
                )}
                {seller.trustLevel === 3 && (
                  <Badge variant="primary">{STRINGS.trust.topSeller}</Badge>
                )}
              </div>

              {/* Meta row */}
              <div className="flex flex-wrap gap-3 text-sm text-text-secondary font-sans mt-1">
                {seller.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-primary" />
                    {seller.location.displayLabel}
                    {distanceFromSeller !== null && (
                      <span className="text-text-muted ml-1">
                        · {distanceFromSeller < 1
                            ? `${Math.round(distanceFromSeller * 1000)}m from you`
                            : `${distanceFromSeller.toFixed(1)} km from you`}
                      </span>
                    )}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {STRINGS.listing.memberSince} {new Date(seller.memberSince).toLocaleDateString('en-RW', { month: 'long', year: 'numeric' })}
                </span>
              </div>

              {/* Trust badges row */}
              <div className="flex flex-wrap gap-2 mt-2">
                {seller.responseRate && seller.responseRate >= 80 && (
                  <span className="flex items-center gap-1 text-xs font-semibold font-sans text-warning">
                    <Zap className="w-3.5 h-3.5" />
                    {STRINGS.trust.fastReply}
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="mt-4 grid grid-cols-3 divide-x divide-border bg-surface-modal rounded-2xl overflow-hidden">
              {[
                { label: 'Active Ads', value: seller.activeListings ?? listings.length },
                {
                  label: 'Response Rate',
                  value: seller.responseRate ? `${seller.responseRate}%` : 'N/A',
                },
                { label: 'Deals Done', value: seller.completedDeals ?? 0 },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center py-3 px-2">
                  <span className="font-display font-bold text-text-primary text-lg">{value}</span>
                  <span className="text-[11px] text-text-secondary font-sans text-center">{label}</span>
                </div>
              ))}
            </div>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < 4 ? 'text-warning fill-warning' : 'text-border'}`} />
                ))}
              </div>
              <span className="text-sm font-semibold text-text-primary font-sans">4.8</span>
              <span className="text-sm text-text-secondary font-sans">· 127 reviews</span>
            </div>
          </div>
        </div>

        {/* ── Listings ── */}
        <ListingGrid
          title={`${isOwnProfile ? 'My' : `${seller.displayName.split(' ')[0]}'s`} Listings`}
          listings={listings}
          loading={isLoading}
          layout="grid"
          columns={2}
          skeletonCount={4}
          emptyMessage="No active listings at the moment."
        />

        <div className="h-8" />
      </main>
    </>
  )
}
