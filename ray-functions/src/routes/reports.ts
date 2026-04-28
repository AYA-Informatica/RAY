import { Router } from 'express'
import { z } from 'zod'
import { Report } from '../models/Report'
import { requireAuth, requireAdmin, type AuthRequest } from '../middleware/auth'
import { reportLimiter } from '../middleware/rateLimit'
import { ok, created } from '../utils/response'
import { connectDB } from '../services/db'

const router = Router()

const reportSchema = z.object({
  type:     z.enum(['listing', 'user']),
  targetId: z.string().min(1),
  reason:   z.string().min(1),
  details:  z.string().max(500).optional(),
})

// POST /reports
router.post('/', requireAuth, reportLimiter, async (req: AuthRequest, res, next) => {
  try {
    await connectDB()
    const body = reportSchema.parse(req.body)

    // Deduplicate — one report per user per target
    const existing = await Report.findOne({
      targetId:   body.targetId,
      reportedBy: req.userId,
      type:       body.type,
    })
    if (existing) {
      ok(res, existing); return
    }

    try {
      const report = await Report.create({ ...body, reportedBy: req.userId })
      created(res, report)
    } catch (createErr: any) {
      // Handle duplicate key error (11000)
      if (createErr.code === 11000) {
        const existingReport = await Report.findOne({
          targetId:   body.targetId,
          reportedBy: req.userId,
          type:       body.type,
        })
        ok(res, existingReport)
      } else {
        throw createErr
      }
    }
  } catch (err) { next(err) }
})

// Admin routes
// GET /reports
router.get('/', requireAdmin(), async (req, res, next) => {
  try {
    await connectDB()
    const status = req.query['status'] as string | undefined
    const filter = status && status !== 'all' ? { status } : {}
    const [reports, total] = await Promise.all([
      Report.find(filter).sort({ createdAt: -1 }).limit(100).lean(),
      Report.countDocuments(filter),
    ])
    ok(res, { reports, total })
  } catch (err) { next(err) }
})

// POST /reports/:id/resolve
router.post('/:id/resolve', requireAdmin(), async (req: AuthRequest, res, next) => {
  try {
    await connectDB()
    const report = await Report.findByIdAndUpdate(req.params['id'], {
      status:     'resolved',
      resolution: req.body.action,
      resolvedBy: req.userId,
      resolvedAt: new Date(),
    }, { new: true })
    ok(res, report)
  } catch (err) { next(err) }
})

// POST /reports/:id/dismiss
router.post('/:id/dismiss', requireAdmin(), async (req: AuthRequest, res, next) => {
  try {
    await connectDB()
    const report = await Report.findByIdAndUpdate(req.params['id'], {
      status:     'dismissed',
      resolvedBy: req.userId,
      resolvedAt: new Date(),
    }, { new: true })
    ok(res, report)
  } catch (err) { next(err) }
})

export { router as reportsRouter }
