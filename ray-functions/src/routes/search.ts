import { Router } from 'express'
import { Listing } from '../models/Listing'
import { optionalAuth } from '../middleware/auth'
import { ok } from '../utils/response'
import { connectDB } from '../services/db'

const router = Router()

// GET /api/search/suggestions?q=iphone
router.get('/suggestions', optionalAuth, async (req, res, next) => {
  try {
    await connectDB()
    const q = req.query['q'] as string
    if (!q || q.length < 2) {
      ok(res, [])
      return
    }

    const suggestions = await Listing.find({
      status: 'active',
      title: { $regex: new RegExp(`^${q}`, 'i') },
    })
      .select('_id title category price')
      .limit(8)
      .lean()

    ok(res, suggestions)
  } catch (err) {
    next(err)
  }
})

// GET /api/search/trending
router.get('/trending', optionalAuth, async (req, res, next) => {
  try {
    await connectDB()
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000)

    const trending = await Listing.find({
      status: 'active',
      postedAt: { $gte: sevenDaysAgo },
    })
      .sort({ views: -1 })
      .limit(10)
      .lean()

    ok(res, trending)
  } catch (err) {
    next(err)
  }
})

export { router as searchRouter }
