"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const Report_1 = require("../models/Report");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const response_1 = require("../utils/response");
const db_1 = require("../services/db");
const debug_1 = require("../utils/debug");
const router = (0, express_1.Router)();
exports.reportsRouter = router;
const reportSchema = zod_1.z.object({
    type: zod_1.z.enum(['listing', 'user']),
    targetId: zod_1.z.string().min(1),
    reason: zod_1.z.string().min(1),
    details: zod_1.z.string().max(500).optional(),
});
// POST /reports
router.post('/', auth_1.requireAuth, rateLimit_1.reportLimiter, async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const body = reportSchema.parse(req.body);
        (0, debug_1.debugLog)('reports.create', 'Create report request', {
            userId: req.userId,
            type: body.type,
            targetId: body.targetId,
            reason: body.reason,
        });
        // Deduplicate — one report per user per target
        const existing = await Report_1.Report.findOne({
            targetId: body.targetId,
            reportedBy: req.userId,
            type: body.type,
        });
        if (existing) {
            (0, debug_1.debugLog)('reports.create', 'Returning existing deduplicated report', {
                reportId: String(existing.id),
                userId: req.userId,
                targetId: body.targetId,
            });
            (0, response_1.ok)(res, existing);
            return;
        }
        try {
            const report = await Report_1.Report.create({ ...body, reportedBy: req.userId });
            (0, debug_1.debugLog)('reports.create', 'Report created', {
                reportId: String(report.id),
                userId: req.userId,
            });
            (0, response_1.created)(res, report);
        }
        catch (createErr) {
            // Handle duplicate key error (11000)
            if (createErr.code === 11000) {
                (0, debug_1.debugWarn)('reports.create', 'Duplicate key race, returning existing report', {
                    userId: req.userId,
                    targetId: body.targetId,
                    type: body.type,
                });
                const existingReport = await Report_1.Report.findOne({
                    targetId: body.targetId,
                    reportedBy: req.userId,
                    type: body.type,
                });
                (0, response_1.ok)(res, existingReport);
            }
            else {
                (0, debug_1.debugError)('reports.create', 'Unexpected create error', {
                    error: createErr instanceof Error ? createErr.message : String(createErr),
                });
                throw createErr;
            }
        }
    }
    catch (err) {
        next(err);
    }
});
// Admin routes
// GET /reports
router.get('/', (0, auth_1.requireAdmin)(), async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const status = req.query['status'];
        const filter = status && status !== 'all' ? { status } : {};
        const [reports, total] = await Promise.all([
            Report_1.Report.find(filter).sort({ createdAt: -1 }).limit(100).lean(),
            Report_1.Report.countDocuments(filter),
        ]);
        (0, debug_1.debugLog)('reports.admin.list', 'Fetched reports for admin', {
            status,
            total,
        });
        (0, response_1.ok)(res, { reports, total });
    }
    catch (err) {
        next(err);
    }
});
// POST /reports/:id/resolve
router.post('/:id/resolve', (0, auth_1.requireAdmin)(), async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const report = await Report_1.Report.findByIdAndUpdate(req.params['id'], {
            status: 'resolved',
            resolution: req.body.action,
            resolvedBy: req.userId,
            resolvedAt: new Date(),
        }, { new: true });
        (0, debug_1.debugLog)('reports.admin.resolve', 'Resolved report', {
            reportId: req.params['id'],
            action: req.body.action,
            resolvedBy: req.userId,
            found: !!report,
        });
        (0, response_1.ok)(res, report);
    }
    catch (err) {
        next(err);
    }
});
// POST /reports/:id/dismiss
router.post('/:id/dismiss', (0, auth_1.requireAdmin)(), async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const report = await Report_1.Report.findByIdAndUpdate(req.params['id'], {
            status: 'dismissed',
            resolvedBy: req.userId,
            resolvedAt: new Date(),
        }, { new: true });
        (0, debug_1.debugLog)('reports.admin.dismiss', 'Dismissed report', {
            reportId: req.params['id'],
            resolvedBy: req.userId,
            found: !!report,
        });
        (0, response_1.ok)(res, report);
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=reports.js.map