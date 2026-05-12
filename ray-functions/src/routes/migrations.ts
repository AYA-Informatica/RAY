import { Router } from 'express'
import { Listing } from '../models/Listing'
import { User }    from '../models/User'
import { requireAdmin } from '../middleware/auth'
import { ok }      from '../utils/response'
import { connectDB } from '../services/db'
import { getCoordsForNeighborhood } from '../utils/neighborhoodCoords'

const router = Router()

/**
 * POST /migrations/backfill-coordinates
 * One-time migration: adds lat/lng to all listings and users
 * that have a displayLabel but no coordinates.
 * Admin only. Idempotent — safe to run multiple times.
 */
router.post('/backfill-coordinates', requireAdmin(['admin']), async (_req, res, next) => {
  try {
    await connectDB()

    // Backfill listings
    const listingsWithoutCoords = await Listing.find({
      'location.displayLabel': { $exists: true },
      $or: [
        { 'location.lat': { $exists: false } },
        { 'location.lat': null },
        { 'location.lat': 0 },
      ],
    }).select('_id location').lean()

    let listingsUpdated = 0
    for (const listing of listingsWithoutCoords) {
      const coords = getCoordsForNeighborhood(listing.location.displayLabel)
      if (!coords) continue
      await Listing.findByIdAndUpdate(listing._id, {
        'location.lat':    coords.lat,
        'location.lng':    coords.lng,
        'location.source': 'manual',
        geoPoint: {
          type:        'Point',
          coordinates: [coords.lng, coords.lat],
        },
      })
      listingsUpdated++
    }

    // Backfill users
    const usersWithoutCoords = await User.find({
      'location.displayLabel': { $exists: true },
      $or: [
        { 'location.lat': { $exists: false } },
        { 'location.lat': null },
        { 'location.lat': 0 },
      ],
    }).select('_id location').lean()

    let usersUpdated = 0
    for (const user of usersWithoutCoords) {
      if (!user.location?.displayLabel) continue
      const coords = getCoordsForNeighborhood(user.location.displayLabel)
      if (!coords) continue
      await User.findByIdAndUpdate(user._id, {
        'location.lat':    coords.lat,
        'location.lng':    coords.lng,
        'location.source': 'manual',
      })
      usersUpdated++
    }

    ok(res, {
      listingsBackfilled: listingsUpdated,
      usersBackfilled:    usersUpdated,
      listingsSkipped:    listingsWithoutCoords.length - listingsUpdated,
      usersSkipped:       usersWithoutCoords.length   - usersUpdated,
    })
  } catch (err) { next(err) }
})

export { router as migrationsRouter }