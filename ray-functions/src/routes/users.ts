import { Router } from 'express'
import multer from 'multer'
import { User } from '../models/User'
import { Listing } from '../models/Listing'
import { requireAuth, type AuthRequest } from '../middleware/auth'
import { ok, notFound } from '../utils/response'
import { uploadAvatar } from '../services/imageService'
import { connectDB } from '../services/db'

const router = Router()
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } })

// ─────────────────────────────────────────────
// GET /users/me
// ─────────────────────────────────────────────
router.get('/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    await connectDB()
    let user = await User.findOne({ firebaseUid: req.firebaseUid }).lean() as any

    // Auto-create profile on first login
    if (!user) {
      user = await User.create({
        firebaseUid: req.firebaseUid,
        phone:       req.body.phone ?? '',
        displayName: req.body.displayName ?? 'RAY User',
        verificationStatus: 'phone',
        memberSince: new Date(),
      })
    }

    ok(res, user)
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────
// PATCH /users/me
// ─────────────────────────────────────────────
router.patch('/me', requireAuth, async (req: AuthRequest, res, next) => {
  try {
    await connectDB()
    const allowed = ['displayName', 'location', 'settings', 'fcmToken'] as const
    const updates: Record<string, unknown> = {}
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key]
    }

    const user = await User.findOneAndUpdate(
      { firebaseUid: req.firebaseUid },
      { $set: updates },
      { new: true, runValidators: true }
    ).lean()

    if (!user) { notFound(res, 'User not found'); return }
    ok(res, user)
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────
// POST /users/me/avatar
// ─────────────────────────────────────────────
router.post('/me/avatar', requireAuth, upload.single('avatar'), async (req: AuthRequest, res, next) => {
  try {
    await connectDB()
    const file = req.file
    if (!file) { res.status(400).json({ success: false, message: 'No file uploaded' }); return }

    const user = await User.findOne({ firebaseUid: req.firebaseUid })
    if (!user) { notFound(res, 'User not found'); return }

    const avatarUrl = await uploadAvatar(file.buffer, String(user._id))
    user.avatar = avatarUrl
    await user.save()

    ok(res, { url: avatarUrl })
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────
// GET /users/:id
// ─────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
  try {
    await connectDB()
    const user = await User.findById(req.params['id'])
      .select('-firebaseUid -fcmToken -settings')
      .lean()
    if (!user) { notFound(res, 'User not found'); return }
    ok(res, user)
  } catch (err) { next(err) }
})

// ─────────────────────────────────────────────
// GET /users/:id/listings
// ─────────────────────────────────────────────
router.get('/:id/listings', async (req, res, next) => {
  try {
    await connectDB()
    const listings = await Listing.find({
      'seller.id': req.params['id'],
      status: 'active',
    }).sort({ postedAt: -1 }).limit(20).lean()
    ok(res, listings)
  } catch (err) { next(err) }
})

export { router as usersRouter }
