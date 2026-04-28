import { Router } from 'express'
import { Listing } from '../models/Listing'
import { User } from '../models/User'
import { Report } from '../models/Report'
import { Boost } from '../models/Boost'
import { requireAdmin, type AuthRequest } from '../middleware/auth'
import { ok, notFound } from '../utils/response'
import { connectDB } from '../services/db'

const router = Router()

// All admin routes gated — specific roles enforced per-endpoint
router.use(requireAdmin())

// ─────────────────────────────────────────────
// LISTINGS
// ─────────────────────────────────────────────

router.get('/listings', async (req, res, next) => {
  try {
    await connectDB()
    const page   = Number(req.query['page']  ?? 1)
    const limit  = Number(req.query['limit'] ?? 20)
    const status = req.query['status'] as string | undefined
    const q      = req.query['q']      as string | undefined

    const filter: Record<string, unknown> = {}
    if (status) filter['status'] = status
    if (q)      filter['$text']  = { $search: q }

    const [listings, total] = await Promise.all([
      Listing.find(filter).sort({ postedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
      Listing.countDocuments(filter),
    ])
    ok(res, { listings, total })
  } catch (err) { next(err) }
})

router.get('/listings/:id', async (req, res, next) => {
  try {
    await connectDB()
    const listing = await Listing.findById(req.params['id']).lean()
    if (!listing) { notFound(res, 'Listing not found'); return }
    ok(res, listing)
  } catch (err) { next(err) }
})

router.post('/listings/:id/approve', async (req, res, next) => {
  try {
    await connectDB()
    const listing = await Listing.findByIdAndUpdate(
      req.params['id'], { status: 'active' }, { new: true }
    )
    if (!listing) { notFound(res, 'Listing not found'); return }
    ok(res, listing)
  } catch (err) { next(err) }
})

router.post('/listings/:id/reject', async (req, res, next) => {
  try {
    await connectDB()
    const listing = await Listing.findByIdAndUpdate(
      req.params['id'],
      { status: 'rejected', rejectionReason: req.body.reason ?? 'Violates community guidelines' },
      { new: true }
    )
    if (!listing) { notFound(res, 'Listing not found'); return }
    ok(res, listing)
  } catch (err) { next(err) }
})

router.post('/listings/:id/feature', async (req, res, next) => {
  try {
    await connectDB()
    const featured = req.body.featured !== false
    const listing  = await Listing.findByIdAndUpdate(
      req.params['id'],
      {
        isFeatured:    featured,
        featuredUntil: featured ? new Date(Date.now() + 7 * 86400000) : null,
      },
      { new: true }
    )
    if (!listing) { notFound(res, 'Listing not found'); return }
    ok(res, listing)
  } catch (err) { next(err) }
})

router.delete('/listings/:id', async (req, res, next) => {
  try {
    await connectDB()
    const listing = await Listing.findByIdAndDelete(req.params['id'])
    if (!listing) { notFound(res, 'Listing not found'); return }
    await User.findByIdAndUpdate(listing.seller.id, { $inc: { activeListings: -1 } })
    ok(res, { deleted: true })
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────

router.get('/users', async (req, res, next) => {
  try {
    await connectDB()
    const page    = Number(req.query['page']   ?? 1)
    const limit   = Number(req.query['limit']  ?? 25)
    const q       = req.query['q']      as string | undefined
    const segment = req.query['filter'] as string | undefined

    const filter: Record<string, unknown> = {}
    if (q)                       filter['$text']              = { $search: q }
    if (segment === 'banned')    filter['isBanned']           = true
    if (segment === 'unverified') filter['verificationStatus'] = 'phone'
    if (segment === 'dealers')   filter['verificationStatus'] = 'dealer'

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-firebaseUid -fcmToken')
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
      User.countDocuments(filter),
    ])
    ok(res, { users, total })
  } catch (err) { next(err) }
})

router.get('/users/:id', async (req, res, next) => {
  try {
    await connectDB()
    const user = await User.findById(req.params['id']).select('-firebaseUid -fcmToken').lean()
    if (!user) { notFound(res, 'User not found'); return }
    ok(res, user)
  } catch (err) { next(err) }
})

router.post('/users/:id/ban', async (req: AuthRequest, res, next) => {
  try {
    await connectDB()
    const user = await User.findByIdAndUpdate(
      req.params['id'],
      { isBanned: true, banReason: req.body.reason, bannedAt: new Date() },
      { new: true }
    )
    if (!user) { notFound(res, 'User not found'); return }
    await Listing.updateMany({ 'seller.id': req.params['id'] }, { status: 'expired' })
    ok(res, { banned: true })
  } catch (err) { next(err) }
})

router.post('/users/:id/unban', async (req, res, next) => {
  try {
    await connectDB()
    const user = await User.findByIdAndUpdate(
      req.params['id'],
      { isBanned: false, $unset: { banReason: 1, bannedAt: 1 } },
      { new: true }
    )
    if (!user) { notFound(res, 'User not found'); return }
    ok(res, { unbanned: true })
  } catch (err) { next(err) }
})

router.post('/users/:id/verify', async (req, res, next) => {
  try {
    await connectDB()
    const user = await User.findByIdAndUpdate(
      req.params['id'],
      { verificationStatus: req.body.status ?? 'id' },
      { new: true }
    )
    if (!user) { notFound(res, 'User not found'); return }
    ok(res, user)
  } catch (err) { next(err) }
})

router.post('/users/:id/role', async (req, res, next) => {
  try {
    await connectDB()
    const user = await User.findByIdAndUpdate(
      req.params['id'], { role: req.body.role }, { new: true }
    )
    if (!user) { notFound(res, 'User not found'); return }
    ok(res, user)
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────

router.get('/analytics/dashboard', async (_req, res, next) => {
  try {
    await connectDB()

    const now        = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalUsers, newUsersToday,
      totalListings, newListingsToday,
      activeListings, pendingReports,
      revenueData,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: todayStart } }),
      Listing.countDocuments(),
      Listing.countDocuments({ createdAt: { $gte: todayStart } }),
      Listing.countDocuments({ status: 'active' }),
      Report.countDocuments({ status: 'pending' }),
      Boost.aggregate([
        {
          $facet: {
            total: [{ $group: { _id: null, sum: { $sum: '$priceRwf' } } }],
            thisMonth: [
              { $match: { createdAt: { $gte: monthStart } } },
              { $group: { _id: null, sum: { $sum: '$priceRwf' } } },
            ],
          },
        },
      ]),
    ])

    const totalRevenue = revenueData[0]?.total[0]?.sum ?? 0
    const revenueThisMonth = revenueData[0]?.thisMonth[0]?.sum ?? 0

    // Daily activity — last 14 days
    const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000)
    const [dailyListings, dailyRevenue] = await Promise.all([
      Listing.aggregate([
        { $match: { createdAt: { $gte: fourteenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%b %d', date: '$createdAt' } },
            listings: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Boost.aggregate([
        { $match: { createdAt: { $gte: fourteenDaysAgo } } },
        {
          $group: {
            _id: { $dateToString: { format: '%b %d', date: '$createdAt' } },
            revenue: { $sum: '$priceRwf' },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ])

    const revenueMap = new Map(dailyRevenue.map((d: { _id: string; revenue: number }) => [d._id, d.revenue]))
    const dailyActivity = dailyListings.map((d: { _id: string; listings: number }) => ({
      date: d._id,
      listings: d.listings,
      users: 0,
      revenue: revenueMap.get(d._id) ?? 0,
    }))

    // Category breakdown
    const catRaw = await Listing.aggregate([
      { $match: { status: 'active' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    const totalActive = catRaw.reduce((s: number, c: { count: number }) => s + c.count, 0)

    ok(res, {
      totalUsers,
      newUsersToday,
      totalListings,
      newListingsToday,
      activeListings,
      totalRevenue,
      revenueThisMonth,
      pendingReports,
      dailyActivity,
      categoryBreakdown: catRaw.map((c: { _id: string; count: number }) => ({
        name: c._id,
        count: c.count,
        percentage: totalActive > 0 ? Math.round((c.count / totalActive) * 100) : 0,
      })),
      topListings: [],
    })
  } catch (err) { next(err) }
})

export { router as adminRouter }
