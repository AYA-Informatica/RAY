import { Router } from 'express'
import multer from 'multer'
import { z } from 'zod'
import { v4 as uuidv4 } from 'uuid'
import { Listing } from '../models/Listing'
import { User } from '../models/User'
import { requireAuth, optionalAuth, type AuthRequest } from '../middleware/auth'
import { listingCreateLimiter } from '../middleware/rateLimit'
import { ok, created, notFound, badRequest } from '../utils/response'
import { uploadListingImage } from '../services/imageService'
import { notifyListingMilestone } from '../services/notificationService'
import { connectDB } from '../services/db'
import { debugLog, debugWarn } from '../utils/debug'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

// ─── Zod schemas ─────────────────────────────
const createSchema = z.object({
  title:       z.string().min(5).max(100),
  description: z.string().max(500).optional(),
  price:       z.coerce.number().positive(),
  negotiable:  z.coerce.boolean().default(false),
  condition:   z.enum(['new', 'like_new', 'good', 'fair']),
  category:    z.string().min(1),
  subcategory: z.string().optional(),
  neighborhood:z.string().min(1),
  phone:       z.string().min(10),
  hidePhone:   z.coerce.boolean().default(false),
  makeFeatured:z.coerce.boolean().default(false),
  locationLat: z.coerce.number().optional(),
  locationLng: z.coerce.number().optional(),
  locationSource: z.enum(['gps', 'manual']).optional(),
})

const searchSchema = z.object({
  query:      z.string().optional(),
  category:   z.string().optional(),
  minPrice:   z.coerce.number().optional(),
  maxPrice:   z.coerce.number().optional(),
  condition:  z.array(z.string()).optional(),
  district:   z.string().optional(),
  meta:       z.record(z.string()).optional(),
  distanceKm: z.coerce.number().optional(),
  userLat:    z.coerce.number().optional(),
  userLng:    z.coerce.number().optional(),
  sortBy:     z.enum(['newest', 'price_asc', 'price_desc', 'nearest']).default('newest'),
  page:       z.coerce.number().default(1),
  limit:      z.coerce.number().min(1).max(50).default(20),
})

interface SearchParams {
  query?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  condition?: string[]
  district?: string
  meta?: Record<string, string>
  distanceKm?: number
  userLat?: number
  userLng?: number
  sortBy: 'newest' | 'price_asc' | 'price_desc' | 'nearest'
  page: number
  limit: number
}

// ─────────────────────────────────────────────
// POST /listings/search
// ─────────────────────────────────────────────
router.post('/search', optionalAuth, async (req, res, next) => {
  console.log('=== LISTINGS SEARCH REQUEST DEBUG ===')
  console.log('Request body:', req.body)
  console.log('User ID from auth:', (req as any).userId)
  console.log('Environment check - NODE_ENV:', process.env.NODE_ENV)
  console.log('Environment check - FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID)
  
  try {
    await connectDB()
    const parsed = searchSchema.parse(req.body) as SearchParams
    console.log('Parsed search parameters:', parsed)
    
    const filter: Record<string, unknown> = { status: 'active' }

    if (parsed.query) {
      filter.$text = { $search: parsed.query }
    }
    if (parsed.category)  filter.category = parsed.category
    if (parsed.district)  filter['location.district'] = parsed.district
    if (parsed.minPrice !== undefined || parsed.maxPrice !== undefined) {
      filter.price = {
        ...(parsed.minPrice !== undefined ? { $gte: parsed.minPrice } : {}),
        ...(parsed.maxPrice !== undefined ? { $lte: parsed.maxPrice } : {}),
      }
    }
    if (parsed.condition?.length) {
      filter.condition = { $in: parsed.condition }
    }

    // Filter by meta fields (e.g. brand, make, year)
    if (parsed.meta && typeof parsed.meta === 'object') {
      for (const [key, value] of Object.entries(parsed.meta)) {
        if (value !== undefined && value !== '') {
          (filter as Record<string, unknown>)[`meta.${key}`] = value
        }
      }
    }

    // Distance filter with geospatial query
    const hasDistance =
      parsed.distanceKm !== undefined &&
      parsed.userLat !== undefined &&
      parsed.userLng !== undefined

    if (hasDistance) {
      // $nearSphere requires the 2dsphere index
      // It automatically sorts by distance when used as the only sort
      filter['geoPoint'] = {
        $nearSphere: {
          $geometry: {
            type:        'Point',
            coordinates: [parsed.userLng!, parsed.userLat!],   // lng, lat
          },
          $maxDistance: parsed.distanceKm! * 1000,   // metres
        },
      }
    }

    type SortMap = Record<string, Record<string, number>>
    const sortMap: SortMap = {
      newest:     { isFeatured: -1, postedAt: -1 },
      price_asc:  { price: 1 },
      price_desc: { price: -1 },
      nearest:    { isFeatured: -1, postedAt: -1 }, // geo sort needs 2dsphere index
    }

    const skip  = (parsed.page - 1) * parsed.limit
    // Only apply sort if distance filter is NOT active ($nearSphere already sorts by distance)
    const query = Listing.find(filter)
    if (!hasDistance) {
      const sort = sortMap[parsed.sortBy] as Record<string, 1 | -1>
      query.sort(sort)
    }
    
    const [docs, total] = await Promise.all([
      query.skip(skip).limit(parsed.limit).lean(),
      Listing.countDocuments(filter),
    ])

    const result = {
      listings: docs.map(doc => ({
        id: doc._id.toString(),
        ...doc.toObject(),
      })),
      hasMore: skip + docs.length < total,
      total,
    }

    console.log('✓ Search completed successfully, returning', result.listings.length, 'listings')
    console.log('=== END LISTINGS SEARCH REQUEST DEBUG ===')
    
    ok(res, result)
  } catch (err) {
    console.error('❌ Search request failed:', err)
    console.log('=== END LISTINGS SEARCH REQUEST DEBUG (ERROR) ===')
    next(err)
  }
})

// ─────────────────────────────────────────────
// GET /listings/fresh   GET /listings/popular   GET /listings/best-deals
// ─────────────────────────────────────────────
router.get('/fresh', optionalAuth, async (_req, res, next) => {
  try {
    await connectDB()
    const listings = await Listing.find({ status: 'active' })
      .sort({ isFeatured: -1, postedAt: -1 })
      .limit(10)
      .lean()
    ok(res, listings)
  } catch (err) { next(err) }
})

router.get('/popular', async (_req, res, next) => {
  try {
    await connectDB()
    const listings = await Listing.find({ status: 'active' })
      .sort({ views: -1, chatCount: -1 })
      .limit(12)
      .lean()
    ok(res, listings)
  } catch (err) { next(err) }
})

router.get('/best-deals', async (_req, res, next) => {
  try {
    await connectDB()
    const listings = await Listing.find({ status: 'active', condition: { $in: ['new', 'like_new'] } })
      .sort({ price: 1, postedAt: -1 })
      .limit(10)
      .lean()
    ok(res, listings)
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────
// GET /listings/:id
// ─────────────────────────────────────────────
router.get('/:id', optionalAuth, async (req, res, next) => {
  try {
    await connectDB()
    const listing = await Listing.findById(req.params['id']).lean()
    if (!listing) { notFound(res, 'Listing not found'); return }
    debugLog('listings.getById', 'Listing fetched', {
      listingId: req.params['id'],
      viewerUserId: (req as AuthRequest).userId,
      currentViews: listing.views ?? 0,
    })

    // Increment view count (fire-and-forget)
    Listing.findByIdAndUpdate(req.params['id'], { $inc: { views: 1 } }).exec()

    // Notify seller at view milestones
    const newViews = (listing.views ?? 0) + 1
    if ([100, 500, 1000].includes(newViews)) {
      notifyListingMilestone(listing.seller.id, listing.title, newViews, String(listing._id as any))
    }

    ok(res, listing)
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────
// GET /listings/:id/similar
// ─────────────────────────────────────────────
router.get('/:id/similar', async (req, res, next) => {
  try {
    await connectDB()
    const listing = await Listing.findById(req.params['id']).lean()
    if (!listing) { notFound(res); return }

    const similar = await Listing.find({
      status: 'active',
      category: listing.category,
      _id: { $ne: listing._id },
    }).sort({ postedAt: -1 }).limit(8).lean()

    ok(res, similar)
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────
// POST /listings  (create with image upload)
// ─────────────────────────────────────────────
router.post(
  '/',
  requireAuth,
  listingCreateLimiter,
  upload.array('images', 10),
  async (req: AuthRequest, res, next) => {
    try {
      await connectDB()

      const body   = createSchema.parse(req.body)
      const files  = req.files as Express.Multer.File[]
      debugLog('listings.create', 'Create listing request', {
        userId: req.userId,
        firebaseUid: req.firebaseUid,
        imageCount: files?.length ?? 0,
        title: body.title,
        category: body.category,
      })
      if (!files?.length) { badRequest(res, 'At least one image is required'); return }

      // Parse meta field from form body
      let meta: Record<string, string | number | boolean> = {}
      if (req.body.meta) {
        try {
          meta = JSON.parse(req.body.meta)
        } catch {
          meta = {}
        }
      }

      // Get seller info
      const seller = await User.findOne({ firebaseUid: req.firebaseUid }).lean()
      if (!seller) { badRequest(res, 'User profile not found'); return }
      
      // Check if user is banned
      if (seller.isBanned) {
        debugWarn('listings.create', 'Blocked banned user', {
          userId: req.userId,
          firebaseUid: req.firebaseUid,
        })
        res.status(403).json({ success: false, message: 'Your account has been suspended' })
        return
      }

      // Upload all images in parallel
      const tempListingId = uuidv4()
      const uploadResults = await Promise.all(
        files.map((f) => uploadListingImage(f.buffer, String(seller._id as any), tempListingId))
      )

      const images    = uploadResults.map((r) => r.full)
      const coverImage = images[0]

      // Build location from neighborhood string
      const location = {
        district: body.neighborhood.split(', ')[1] ?? 'Kigali',
        neighborhood: body.neighborhood.split(', ')[0],
        displayLabel: body.neighborhood,
      }

      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + 30) // 30-day listing lifetime

      const listing = await Listing.create({
        title:       body.title,
        description: body.description,
        price:       body.price,
        negotiable:  body.negotiable,
        condition:   body.condition,
        category:    body.category,
        subcategory: body.subcategory,
        images,
        coverImage,
        location,
        seller: {
          id:                 seller._id,
          displayName:        seller.displayName,
          avatar:             seller.avatar,
          trustLevel:         seller.trustLevel,
          verificationStatus: seller.verificationStatus,
          responseRate:       seller.responseRate,
        },
        status:     body.makeFeatured ? 'active' : 'active',
        isFeatured: body.makeFeatured,
        featuredUntil: body.makeFeatured ? new Date(Date.now() + 7 * 86400000) : undefined,
        meta,
        postedAt:   new Date(),
        expiresAt,
      })

      // Update seller's active listing count
      await User.findByIdAndUpdate(seller._id, { $inc: { activeListings: 1 } })
      debugLog('listings.create', 'Listing created', {
        listingId: String(listing.id),
        sellerId: String(seller._id),
      })

      created(res, listing)
    } catch (err) { next(err) }
  }
)

// ─────────────────────────────────────────────
// PATCH /listings/:id
// ─────────────────────────────────────────────
router.patch('/:id', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    await connectDB()
    const seller  = await User.findOne({ firebaseUid: req.firebaseUid }).lean()
    const listing = await Listing.findById(req.params['id'])

    if (!listing)                           { notFound(res, 'Listing not found'); return }
    if (String(listing.seller.id) !== String(seller?._id)) {
      debugWarn('listings.update', 'Blocked non-owner update attempt', {
        listingId: req.params['id'],
        requesterUserId: req.userId,
      })
      res.status(403).json({ success: false, message: 'Not your listing' })
      return
    }

    const allowed = ['title', 'description', 'price', 'negotiable', 'condition'] as const
    for (const key of allowed) {
      if (req.body[key] !== undefined) (listing as any)[key] = req.body[key]
    }
    await listing.save()
    debugLog('listings.update', 'Listing updated', {
      listingId: req.params['id'],
      requesterUserId: req.userId,
    })
    ok(res, listing)
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────
// DELETE /listings/:id
// ─────────────────────────────────────────────
router.delete('/:id', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    await connectDB()
    const seller  = await User.findOne({ firebaseUid: req.firebaseUid }).lean()
    const listing = await Listing.findById(req.params['id'])

    if (!listing) { notFound(res, 'Listing not found'); return }

    const isAdmin = ['admin', 'moderator'].includes(req.userRole ?? '')
    const isOwner = String(listing.seller.id) === String(seller?._id)
    if (!isOwner && !isAdmin) {
      debugWarn('listings.delete', 'Blocked delete attempt (not owner/admin)', {
        listingId: req.params['id'],
        requesterUserId: req.userId,
        role: req.userRole,
      })
      res.status(403).json({ success: false, message: 'Not authorised' }); return
    }

    await listing.deleteOne()
    if (isOwner) {
      await User.findByIdAndUpdate(seller?._id, { $inc: { activeListings: -1 } })
    }
    debugLog('listings.delete', 'Listing deleted', {
      listingId: req.params['id'],
      requesterUserId: req.userId,
      isOwner,
      isAdmin,
    })
    ok(res, { deleted: true })
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────
// POST /listings/:id/boost
// ─────────────────────────────────────────────
router.post('/:id/boost', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    await connectDB()
    const listing = await Listing.findById(req.params['id'])
    if (!listing) { notFound(res, 'Listing not found'); return }

    const daysMap: Record<string, number> = { featured: 7, top_ad: 3, elite_seller: 30 }
    const days = daysMap[req.body.packageId ?? 'featured'] ?? 7

    listing.isFeatured    = true
    listing.featuredUntil = new Date(Date.now() + days * 86400000)
    await listing.save()

    ok(res, listing)
  } catch (err) { next(err) }
})

export { router as listingsRouter }
