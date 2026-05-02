"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.searchRouter = void 0;
const express_1 = require("express");
const Listing_1 = require("../models/Listing");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const db_1 = require("../services/db");
const router = (0, express_1.Router)();
exports.searchRouter = router;
// GET /api/search/suggestions?q=iphone
router.get('/suggestions', auth_1.optionalAuth, async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const q = req.query['q'];
        if (!q || q.length < 2) {
            (0, response_1.ok)(res, []);
            return;
        }
        const suggestions = await Listing_1.Listing.find({
            status: 'active',
            title: { $regex: new RegExp(`^${q}`, 'i') },
        })
            .select('_id title category price')
            .limit(8)
            .lean();
        (0, response_1.ok)(res, suggestions);
    }
    catch (err) {
        next(err);
    }
});
// GET /api/search/trending
router.get('/trending', auth_1.optionalAuth, async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
        const trending = await Listing_1.Listing.find({
            status: 'active',
            postedAt: { $gte: sevenDaysAgo },
        })
            .sort({ views: -1 })
            .limit(10)
            .lean();
        (0, response_1.ok)(res, trending);
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=search.js.map