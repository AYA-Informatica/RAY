import * as functions from 'firebase-functions'
import { connectDB } from './services/db'
import { Listing } from './models/Listing'
import { User } from './models/User'
import { notifyListingExpiring } from './services/notificationService'
import { db } from './services/firebase'

/**
 * expireListings — runs every hour.
 * Marks listings past their expiresAt as 'expired' and updates seller counts.
 */
export const expireListings = functions.pubsub
  .schedule('every 60 minutes')
  .onRun(async () => {
    await connectDB()
    const now = new Date()

    const expired = await Listing.find({
      status:    'active',
      expiresAt: { $lte: now },
    }).select('_id seller.id').lean()

    if (expired.length === 0) return

    const ids      = expired.map((l) => l._id)
    const sellerIds = [...new Set(expired.map((l) => l.seller.id))]

    await Listing.updateMany({ _id: { $in: ids } }, { status: 'expired' })

    // Decrement each seller's active listing count
    await Promise.all(
      sellerIds.map((sid) => {
        const count = expired.filter((l) => l.seller.id === sid).length
        return User.findByIdAndUpdate(sid, { $inc: { activeListings: -count } })
      })
    )

    // Send Firestore notifications
    const batch = db.batch()
    for (const listing of expired) {
      const notifRef = db.collection('notifications').doc()
      batch.set(notifRef, {
        userId: listing.seller.id,
        type: 'listing_expiring',
        title: 'Listing expired',
        body: `Your listing has expired. Repost it to continue getting buyers.`,
        read: false,
        createdAt: new Date().toISOString(),
      })
    }
    await batch.commit()

    console.log(`[expireListings] Expired ${expired.length} listings`)
  })

/**
 * notifyExpiringListings — runs daily at 9 AM EAT (UTC+3 = 06:00 UTC).
 * Warns sellers 24 hours before their listing expires.
 */
export const notifyExpiringListings = functions.pubsub
  .schedule('0 6 * * *')
  .timeZone('Africa/Kigali')
  .onRun(async () => {
    await connectDB()

    const in24h    = new Date(Date.now() + 24 * 3600000)
    const in25h    = new Date(Date.now() + 25 * 3600000)

    const expiring = await Listing.find({
      status:    'active',
      expiresAt: { $gte: in24h, $lte: in25h },
    }).select('_id title seller.id').lean()

    await Promise.all(
      expiring.map((l) =>
        notifyListingExpiring(l.seller.id, l.title, l._id as string)
      )
    )

    console.log(`[notifyExpiringListings] Notified ${expiring.length} sellers`)
  })

/**
 * expireFeaturedBoosts — runs every 30 minutes.
 * Removes featured status from listings whose featuredUntil has passed.
 */
export const expireFeaturedBoosts = functions.pubsub
  .schedule('every 30 minutes')
  .onRun(async () => {
    await connectDB()
    const { modifiedCount } = await Listing.updateMany(
      { isFeatured: true, featuredUntil: { $lte: new Date() } },
      { isFeatured: false }
    )
    console.log(`[expireFeaturedBoosts] Expired ${modifiedCount} featured boosts`)
  })

/**
 * updateUserOnlineStatus — runs every 5 minutes.
 * Marks users as offline if lastSeen > 10 minutes ago.
 */
export const updateUserOnlineStatus = functions.pubsub
  .schedule('every 5 minutes')
  .onRun(async () => {
    await connectDB()
    const tenMinutesAgo = new Date(Date.now() - 10 * 60000)
    await User.updateMany(
      { isOnline: true, lastSeen: { $lte: tenMinutesAgo } },
      { isOnline: false }
    )
  })

/**
 * computeTrustLevels — runs daily at midnight.
 * Recomputes trust levels based on updated metrics.
 */
export const computeTrustLevels = functions.pubsub
  .schedule('0 0 * * *')
  .timeZone('Africa/Kigali')
  .onRun(async () => {
    await connectDB()

    // Level 3: verified or dealer status
    const level3 = await User.updateMany(
      { verificationStatus: { $in: ['id', 'dealer'] } },
      { trustLevel: 3 }
    )

    // Level 2: 5+ completed deals or 90%+ response rate
    const level2 = await User.updateMany(
      {
        verificationStatus: { $nin: ['id', 'dealer'] },
        $or: [
          { completedDeals: { $gte: 5 } },
          { responseRate:   { $gte: 90 } },
        ],
      },
      { trustLevel: 2 }
    )

    // Level 1: everyone else
    const level1 = await User.updateMany(
      {
        verificationStatus: { $nin: ['id', 'dealer'] },
        completedDeals: { $lt: 5 },
        responseRate:   { $lt: 90 },
      },
      { trustLevel: 1 }
    )

    console.log(`[computeTrustLevels] Level 3: ${level3.modifiedCount}, Level 2: ${level2.modifiedCount}, Level 1: ${level1.modifiedCount}`)
  })
