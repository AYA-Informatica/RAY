import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ChevronRight, CheckCircle, XCircle, Star, Trash2, MapPin, Eye, MessageCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { format } from 'date-fns'
import { Button, Badge, Input } from '@/components/atoms'
import { PageHeader } from '@/components/organisms/AdminLayout'
import { adminListingsApi } from '@/services/api'
import { formatPrice } from '@/utils/format'
import type { Listing } from '@/types'

export const AdminListingDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [listing, setListing] = useState<Listing | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [rejectionReason, setRejectionReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)

  useEffect(() => {
    if (!id) return
    adminListingsApi
      .getById(id)
      .then(setListing)
      .catch(() => toast.error('Failed to load listing'))
      .finally(() => setIsLoading(false))
  }, [id])

  const handleApprove = async () => {
    if (!id) return
    try {
      await adminListingsApi.approve(id)
      toast.success('Listing approved')
      setListing((prev) => (prev ? { ...prev, status: 'active' as const } : null))
    } catch {
      toast.error('Failed to approve listing')
    }
  }

  const handleReject = async () => {
    if (!id || !rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }
    try {
      await adminListingsApi.reject(id, rejectionReason)
      toast.success('Listing rejected')
      setListing((prev) => (prev ? { ...prev, status: 'rejected' as const } : null))
      setShowRejectInput(false)
    } catch {
      toast.error('Failed to reject listing')
    }
  }

  const handleFeature = async () => {
    if (!id) return
    try {
      await adminListingsApi.feature(id, !listing?.isFeatured)
      toast.success(listing?.isFeatured ? 'Removed from featured' : 'Added to featured')
      setListing((prev) => (prev ? { ...prev, isFeatured: !prev.isFeatured } : null))
    } catch {
      toast.error('Failed to update featured status')
    }
  }

  const handleDelete = async () => {
    if (!id || !confirm('Delete this listing? This cannot be undone.')) return
    try {
      await adminListingsApi.delete(id)
      toast.success('Listing deleted')
      navigate('/admin/listings')
    } catch {
      toast.error('Failed to delete listing')
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col flex-1">
        <PageHeader title="Loading..." />
        <div className="flex-1 p-8">
          <div className="h-96 bg-surface-card rounded-2xl animate-pulse" />
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="flex flex-col flex-1">
        <PageHeader title="Listing Not Found" />
        <div className="flex-1 p-8 flex items-center justify-center">
          <p className="text-text-secondary font-sans">This listing does not exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col flex-1">
      <PageHeader
        title={listing.title}
        breadcrumbs={
          <div className="flex items-center gap-2 text-sm text-text-muted font-sans">
            <Link to="/admin" className="hover:text-text-primary">
              Admin
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/admin/listings" className="hover:text-text-primary">
              Listings
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-text-primary truncate max-w-[200px]">{listing.title}</span>
          </div>
        }
      />

      <div className="flex-1 p-8 flex gap-6">
        {/* Left Panel */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Image Gallery */}
          <div className="bg-surface-card rounded-2xl border border-border overflow-hidden">
            <img src={listing.coverImage} alt={listing.title} className="w-full aspect-video object-cover" />
            <div className="flex gap-2 p-4 overflow-x-auto scrollbar-hide">
              {listing.images.map((img, i) => (
                <img
                  key={i}
                  src={img}
                  alt=""
                  className="w-20 h-20 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                />
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="bg-surface-card rounded-2xl border border-border p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-display font-bold text-text-primary">{listing.title}</h2>
                <p className="text-3xl font-display font-bold text-primary mt-2">{formatPrice(listing.price)}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="success">{listing.condition}</Badge>
                <Badge variant="muted">{listing.category}</Badge>
              </div>
            </div>

            <div className="flex items-center gap-4 text-sm text-text-secondary font-sans">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {listing.location.displayLabel}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {listing.views} views
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {listing.chatCount} chats
              </span>
            </div>

            {listing.description && (
              <div>
                <h3 className="text-sm font-bold text-text-secondary font-sans uppercase mb-2">Description</h3>
                <p className="text-sm text-text-primary font-sans whitespace-pre-wrap">{listing.description}</p>
              </div>
            )}

            <div className="flex items-center gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-text-muted font-sans">Posted</p>
                <p className="text-sm text-text-primary font-sans">{format(new Date(listing.postedAt), 'PPp')}</p>
              </div>
              <div>
                <p className="text-xs text-text-muted font-sans">Expires</p>
                <p className="text-sm text-text-primary font-sans">{format(new Date(listing.expiresAt), 'PPp')}</p>
              </div>
            </div>

            {/* Seller Info */}
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-bold text-text-secondary font-sans uppercase mb-3">Seller</h3>
              <div className="flex items-center gap-3">
                {listing.seller.avatar && (
                  <img src={listing.seller.avatar} alt="" className="w-12 h-12 rounded-full object-cover" />
                )}
                <div>
                  <p className="text-sm font-semibold text-text-primary font-sans">{listing.seller.displayName}</p>
                  <p className="text-xs text-text-muted font-sans">Trust Level {listing.seller.trustLevel}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="w-80 flex flex-col gap-4">
          {/* Status Card */}
          <div className="bg-surface-card rounded-2xl border border-border p-5 flex flex-col gap-4">
            <div>
              <h3 className="text-sm font-bold text-text-secondary font-sans uppercase mb-2">Status</h3>
              <Badge variant={listing.status === 'active' ? 'success' : 'warning'}>{listing.status}</Badge>
            </div>

            {listing.status === 'pending_review' && (
              <>
                <Button fullWidth variant="primary" onClick={handleApprove} leftIcon={<CheckCircle className="w-4 h-4" />}>
                  Approve
                </Button>
                {!showRejectInput ? (
                  <Button
                    fullWidth
                    variant="danger"
                    onClick={() => setShowRejectInput(true)}
                    leftIcon={<XCircle className="w-4 h-4" />}
                  >
                    Reject
                  </Button>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Input
                      label="Rejection Reason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Why is this listing being rejected?"
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="danger" onClick={handleReject}>
                        Confirm
                      </Button>
                      <Button size="sm" variant="secondary" onClick={() => setShowRejectInput(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}

            <Button
              fullWidth
              variant="secondary"
              onClick={handleFeature}
              leftIcon={<Star className={listing.isFeatured ? 'fill-warning' : ''} />}
            >
              {listing.isFeatured ? 'Remove Featured' : 'Make Featured'}
            </Button>

            <Button fullWidth variant="danger" onClick={handleDelete} leftIcon={<Trash2 className="w-4 h-4" />}>
              Delete Listing
            </Button>
          </div>

          {/* Report History */}
          <div className="bg-surface-card rounded-2xl border border-border p-5">
            <h3 className="text-sm font-bold text-text-secondary font-sans uppercase mb-3">Report History</h3>
            <p className="text-xs text-text-muted font-sans">No reports for this listing</p>
          </div>
        </div>
      </div>
    </div>
  )
}
