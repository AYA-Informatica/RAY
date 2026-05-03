"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const Listing_1 = require("../models/Listing");
const User_1 = require("../models/User");
const Report_1 = require("../models/Report");
const Boost_1 = require("../models/Boost");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const db_1 = require("../services/db");
const router = (0, express_1.Router)();
exports.adminRouter = router;
// All admin routes gated — specific roles enforced per-endpoint
router.use((0, auth_1.requireAdmin)());
// ─────────────────────────────────────────────
// LISTINGS
// ─────────────────────────────────────────────
router.get('/listings', async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const page = Number(req.query['page'] ?? 1);
        const limit = Number(req.query['limit'] ?? 20);
        const status = req.query['status'];
        const q = req.query['q'];
        console.log('[functions.admin] Fetching listings', { page, limit, status, q });
        const filter = {};
        if (status)
            filter['status'] = status;
        if (q)
            filter['$text'] = { $search: q };
        const [listings, total] = await Promise.all([
            Listing_1.Listing.find(filter).sort({ postedAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
            Listing_1.Listing.countDocuments(filter),
        ]);
        console.log('[functions.admin] Listings fetched', { total, returned: listings.length });
        (0, response_1.ok)(res, { listings, total });
    }
    catch (err) {
        next(err);
    }
});
router.get('/listings/:id', async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const listing = await Listing_1.Listing.findById(req.params['id']).lean();
        if (!listing) {
            (0, response_1.notFound)(res, 'Listing not found');
            return;
        }
        (0, response_1.ok)(res, listing);
    }
    catch (err) {
        next(err);
    }
});
router.post('/listings/:id/approve', async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        console.log('[functions.admin] Approving listing', { listingId: req.params['id'] });
        const listing = await Listing_1.Listing.findByIdAndUpdate(req.params['id'], { status: 'active' }, { new: true });
        if (!listing) {
            (0, response_1.notFound)(res, 'Listing not found');
            return;
        }
        console.log('[functions.admin] Listing approved', { listingId: req.params['id'] });
        (0, response_1.ok)(res, listing);
    }
    catch (err) {
        next(err);
    }
});
router.post('/listings/:id/reject', async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const listing = await Listing_1.Listing.findByIdAndUpdate(req.params['id'], { status: 'rejected', rejectionReason: req.body.reason ?? 'Violates community guidelines' }, { new: true });
        if (!listing) {
            (0, response_1.notFound)(res, 'Listing not found');
            return;
        }
        (0, response_1.ok)(res, listing);
    }
    catch (err) {
        next(err);
    }
});
router.post('/listings/:id/feature', async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const featured = req.body.featured !== false;
        const listing = await Listing_1.Listing.findByIdAndUpdate(req.params['id'], {
            isFeatured: featured,
            featuredUntil: featured ? new Date(Date.now() + 7 * 86400000) : null,
        }, { new: true });
        if (!listing) {
            (0, response_1.notFound)(res, 'Listing not found');
            return;
        }
        (0, response_1.ok)(res, listing);
    }
    catch (err) {
        next(err);
    }
});
router.delete('/listings/:id', async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const listing = await Listing_1.Listing.findByIdAndDelete(req.params['id']);
        if (!listing) {
            (0, response_1.notFound)(res, 'Listing not found');
            return;
        }
        await User_1.User.findByIdAndUpdate(listing.seller.id, { $inc: { activeListings: -1 } });
        (0, response_1.ok)(res, { deleted: true });
    }
    catch (err) {
        next(err);
    }
});
// ─────────────────────────────────────────────
// USERS
// ─────────────────────────────────────────────
router.get('/users', async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const page = Number(req.query['page'] ?? 1);
        const limit = Number(req.query['limit'] ?? 25);
        const q = req.query['q'];
        const segment = req.query['filter'];
        const filter = {};
        if (q)
            filter['$text'] = { $search: q };
        if (segment === 'banned')
            filter['isBanned'] = true;
        if (segment === 'unverified')
            filter['verificationStatus'] = 'phone';
        if (segment === 'dealers')
            filter['verificationStatus'] = 'dealer';
        const [users, total] = await Promise.all([
            User_1.User.find(filter)
                .select('-firebaseUid -fcmToken')
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean(),
            User_1.User.countDocuments(filter),
        ]);
        (0, response_1.ok)(res, { users, total });
    }
    catch (err) {
        next(err);
    }
});
router.get('/users/:id', async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const user = await User_1.User.findById(req.params['id']).select('-firebaseUid -fcmToken').lean();
        if (!user) {
            (0, response_1.notFound)(res, 'User not found');
            return;
        }
        (0, response_1.ok)(res, user);
    }
    catch (err) {
        next(err);
    }
});
router.post('/users/:id/ban', async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        console.log('[functions.admin] Banning user', { userId: req.params['id'], reason: req.body.reason });
        const user = await User_1.User.findByIdAndUpdate(req.params['id'], { isBanned: true, banReason: req.body.reason, bannedAt: new Date() }, { new: true });
        if (!user) {
            (0, response_1.notFound)(res, 'User not found');
            return;
        }
        await Listing_1.Listing.updateMany({ 'seller.id': req.params['id'] }, { status: 'expired' });
        console.log('[functions.admin] User banned', { userId: req.params['id'] });
        (0, response_1.ok)(res, { banned: true });
    }
    catch (err) {
        next(err);
    }
});
router.post('/users/:id/unban', async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const user = await User_1.User.findByIdAndUpdate(req.params['id'], { isBanned: false, $unset: { banReason: 1, bannedAt: 1 } }, { new: true });
        if (!user) {
            (0, response_1.notFound)(res, 'User not found');
            return;
        }
        (0, response_1.ok)(res, { unbanned: true });
    }
    catch (err) {
        next(err);
    }
});
router.post('/users/:id/verify', async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const user = await User_1.User.findByIdAndUpdate(req.params['id'], { verificationStatus: req.body.status ?? 'id' }, { new: true });
        if (!user) {
            (0, response_1.notFound)(res, 'User not found');
            return;
        }
        (0, response_1.ok)(res, user);
    }
    catch (err) {
        next(err);
    }
});
router.post('/users/:id/role', async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const user = await User_1.User.findByIdAndUpdate(req.params['id'], { role: req.body.role }, { new: true });
        if (!user) {
            (0, response_1.notFound)(res, 'User not found');
            return;
        }
        (0, response_1.ok)(res, user);
    }
    catch (err) {
        next(err);
    }
});
// ─────────────────────────────────────────────
// ANALYTICS
// ─────────────────────────────────────────────
router.get('/analytics/dashboard', async (_req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        console.log('[functions.admin] Fetching dashboard analytics');
        const now = new Date();
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const [totalUsers, newUsersToday, totalListings, newListingsToday, activeListings, pendingReports, revenueData,] = await Promise.all([
            User_1.User.countDocuments(),
            User_1.User.countDocuments({ createdAt: { $gte: todayStart } }),
            Listing_1.Listing.countDocuments(),
            Listing_1.Listing.countDocuments({ createdAt: { $gte: todayStart } }),
            Listing_1.Listing.countDocuments({ status: 'active' }),
            Report_1.Report.countDocuments({ status: 'pending' }),
            Boost_1.Boost.aggregate([
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
        ]);
        const totalRevenue = revenueData[0]?.total[0]?.sum ?? 0;
        const revenueThisMonth = revenueData[0]?.thisMonth[0]?.sum ?? 0;
        // Daily activity — last 14 days
        const fourteenDaysAgo = new Date(Date.now() - 14 * 86400000);
        const [dailyListings, dailyRevenue] = await Promise.all([
            Listing_1.Listing.aggregate([
                { $match: { createdAt: { $gte: fourteenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%b %d', date: '$createdAt' } },
                        listings: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
            Boost_1.Boost.aggregate([
                { $match: { createdAt: { $gte: fourteenDaysAgo } } },
                {
                    $group: {
                        _id: { $dateToString: { format: '%b %d', date: '$createdAt' } },
                        revenue: { $sum: '$priceRwf' },
                    },
                },
                { $sort: { _id: 1 } },
            ]),
        ]);
        const revenueMap = new Map(dailyRevenue.map((d) => [d._id, d.revenue]));
        const dailyActivity = dailyListings.map((d) => ({
            date: d._id,
            listings: d.listings,
            users: 0,
            revenue: revenueMap.get(d._id) ?? 0,
        }));
        // Category breakdown
        const catRaw = await Listing_1.Listing.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        const totalActive = catRaw.reduce((s, c) => s + c.count, 0);
        (0, response_1.ok)(res, {
            totalUsers,
            newUsersToday,
            totalListings,
            newListingsToday,
            activeListings,
            totalRevenue,
            revenueThisMonth,
            pendingReports,
            dailyActivity,
            categoryBreakdown: catRaw.map((c) => ({
                name: c._id,
                count: c.count,
                percentage: totalActive > 0 ? Math.round((c.count / totalActive) * 100) : 0,
            })),
            topListings: [],
        });
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=admin.js.map