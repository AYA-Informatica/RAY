import { Router } from 'express'
import { z } from 'zod'
import { Report } from '../models/Report'
import { requireAuth, requireAdmin, type AuthRequest } from '../middleware/auth'
import { reportLimiter } from '../middleware/rateLimit'
import { ok, created } from '../utils/response'
import { connectDB } from '../services/db'
import { debugError, debugLog, debugWarn } from '../utils/debug'

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
    debugLog('reports.create', 'Create report request', {
      userId: req.userId,
      type: body.type,
      targetId: body.targetId,
      reason: body.reason,
    })

    // Deduplicate — one report per user per target
    const existing = await Report.findOne({
      targetId:   body.targetId,
      reportedBy: req.userId,
      type:       body.type,
    })
    if (existing) {
      debugLog('reports.create', 'Returning existing deduplicated report', {
        reportId: String(existing.id),
        userId: req.userId,
        targetId: body.targetId,
      })
      ok(res, existing); return
    }

    try {
      const report = await Report.create({ ...body, reportedBy: req.userId })
      debugLog('reports.create', 'Report created', {
        reportId: String(report.id),
        userId: req.userId,
      })
      created(res, report)
    } catch (createErr: any) {
      // Handle duplicate key error (11000)
      if (createErr.code === 11000) {
        debugWarn('reports.create', 'Duplicate key race, returning existing report', {
          userId: req.userId,
          targetId: body.targetId,
          type: body.type,
        })
        const existingReport = await Report.findOne({
          targetId:   body.targetId,
          reportedBy: req.userId,
          type:       body.type,
        })
        ok(res, existingReport)
      } else {
        debugError('reports.create', 'Unexpected create error', {
          error: createErr instanceof Error ? createErr.message : String(createErr),
        })
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
    debugLog('reports.admin.list', 'Fetched reports for admin', {
      status,
      total,
    })
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
    debugLog('reports.admin.resolve', 'Resolved report', {
      reportId: req.params['id'],
      action: req.body.action,
      resolvedBy: req.userId,
      found: !!report,
    })
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
    debugLog('reports.admin.dismiss', 'Dismissed report', {
      reportId: req.params['id'],
      resolvedBy: req.userId,
      found: !!report,
    })
    ok(res, report)
  } catch (err) { next(err) }
})

export { router as reportsRouter }
