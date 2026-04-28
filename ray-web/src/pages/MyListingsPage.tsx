import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { Edit, Check, Trash2, Eye, MessageCircle, Plus } from 'lucide-react'
import { clsx } from 'clsx'
import { Button, Badge } from '@/components/atoms'
import { useAuthStore } from '@/store/authStore'
import { listingsApi } from '@/services/api'
import { formatPrice, timeAgo } from '@/utils/format'
import type { Listing, ListingStatus } from '@/types'

type TabValue = 'active' | 'sold' | 'expired'

const STATUS_BADGE: Record<ListingStatus, { label: string; variant: 'success' | 'muted' }> = {
  active: { label: 'Active', variant: 'success' },
  sold: { label: 'Sold', variant: 'muted' },
  expired: { label: 'Expired', variant: 'muted' },
  pending_review: { label: 'Pending', variant: 'muted' },
  rejected: { label: 'Rejected', variant: 'muted' },
}

export const MyListingsPage = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [activeTab, setActiveTab] = useState<TabValue>('active')
  const [listings, setListings] = useState<Listing[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setIsLoading(true)
    listingsApi
      .getByUser(user.id)
      .then((data) => setListings(data))
      .finally(() => setIsLoading(false))
  }, [user])

  const filteredListings = listings.filter((l) => l.status === activeTab)

  const handleMarkAsSold = async (id: string) => {
    if (!confirm('Mark this listing as sold?')) return
    try {
      await listingsApi.update(id, { status: 'sold' })
      setListings((prev) => prev.map((l) => (l.id === id ? { ...l, status: 'sold' as const } : l)))
    } catch (err) {
      alert('Failed to update listing')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this listing? This cannot be undone.')) return
    try {
      await listingsApi.delete(id)
      setListings((prev) => prev.filter((l) => l.id !== id))
    } catch (err) {
      alert('Failed to delete listing')
    }
  }

  return (
    <>
      <Helmet>
        <title>My Listings | RAY</title>
      </Helmet>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="font-display font-bold text-text-primary text-2xl">My Listings</h1>
          <Button size="sm" onClick={() => navigate('/post')} leftIcon={<Plus className="w-4 h-4" />}>
            Post New Ad
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 bg-surface-modal rounded-xl border border-border w-fit">
          {(['active', 'sold', 'expired'] as TabValue[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-4 py-2 rounded-lg text-sm font-semibold font-sans capitalize transition-all',
                activeTab === tab ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Listings */}
        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 bg-surface-card rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-16 h-16 rounded-full bg-surface-modal flex items-center justify-center">
              <Plus className="w-8 h-8 text-text-muted" />
            </div>
            <p className="text-text-secondary font-sans text-center">
              {activeTab === 'active' ? 'No active listings' : `No ${activeTab} listings`}
            </p>
            {activeTab === 'active' && (
              <Button size="sm" onClick={() => navigate('/post')}>
                Post a new ad
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {filteredListings.map((listing) => (
              <div
                key={listing.id}
                className="flex items-center gap-4 p-4 bg-surface-card rounded-2xl border border-border hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => navigate(`/listing/${listing.id}`)}
              >
                <img
                  src={listing.coverImage}
                  alt={listing.title}
                  className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-text-primary font-sans truncate">{listing.title}</p>
                  <p className="text-lg font-bold text-primary font-sans mt-1">{formatPrice(listing.price)}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge variant={STATUS_BADGE[listing.status].variant}>
                      {STATUS_BADGE[listing.status].label}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-text-muted font-sans">
                      <Eye className="w-3.5 h-3.5" />
                      {listing.views}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-text-muted font-sans">
                      <MessageCircle className="w-3.5 h-3.5" />
                      {listing.chatCount}
                    </span>
                    <span className="text-xs text-text-muted font-sans">{timeAgo(listing.postedAt)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                  {listing.status === 'active' && (
                    <>
                      <button
                        onClick={() => navigate(`/post?edit=${listing.id}`)}
                        className="p-2 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors"
                        title="Edit"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMarkAsSold(listing.id)}
                        className="p-2 rounded-lg text-text-secondary hover:text-success hover:bg-success/10 transition-colors"
                        title="Mark as Sold"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => handleDelete(listing.id)}
                    className="p-2 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </>
  )
}
