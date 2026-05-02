"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listingsRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const zod_1 = require("zod");
const uuid_1 = require("uuid");
const Listing_1 = require("../models/Listing");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const rateLimit_1 = require("../middleware/rateLimit");
const response_1 = require("../utils/response");
const imageService_1 = require("../services/imageService");
const notificationService_1 = require("../services/notificationService");
const db_1 = require("../services/db");
const debug_1 = require("../utils/debug");
const router = (0, express_1.Router)();
exports.listingsRouter = router;
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
// ─── Zod schemas ─────────────────────────────
const createSchema = zod_1.z.object({
    title: zod_1.z.string().min(5).max(100),
    description: zod_1.z.string().max(500).optional(),
    price: zod_1.z.coerce.number().positive(),
    negotiable: zod_1.z.coerce.boolean().default(false),
    condition: zod_1.z.enum(['new', 'like_new', 'good', 'fair']),
    category: zod_1.z.string().min(1),
    subcategory: zod_1.z.string().optional(),
    neighborhood: zod_1.z.string().min(1),
    phone: zod_1.z.string().min(10),
    hidePhone: zod_1.z.coerce.boolean().default(false),
    makeFeatured: zod_1.z.coerce.boolean().default(false),
});
const searchSchema = zod_1.z.object({
    query: zod_1.z.string().optional(),
    category: zod_1.z.string().optional(),
    minPrice: zod_1.z.coerce.number().optional(),
    maxPrice: zod_1.z.coerce.number().optional(),
    condition: zod_1.z.array(zod_1.z.string()).optional(),
    district: zod_1.z.string().optional(),
    distanceKm: zod_1.z.coerce.number().optional(),
    sortBy: zod_1.z.enum(['newest', 'price_asc', 'price_desc', 'nearest']).default('newest'),
    page: zod_1.z.coerce.number().default(1),
    limit: zod_1.z.coerce.number().max(50).default(20),
});
// ─────────────────────────────────────────────
// POST /listings/search
// ─────────────────────────────────────────────
router.post('/search', auth_1.optionalAuth, async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const parsed = searchSchema.parse(req.body);
        (0, debug_1.debugLog)('listings.search', 'Search request', {
            userId: req.userId,
            query: parsed.query,
            category: parsed.category,
            page: parsed.page,
            limit: parsed.limit,
            sortBy: parsed.sortBy,
        });
        const filter = { status: 'active' };
        if (parsed.query) {
            filter.$text = { $search: parsed.query };
        }
        if (parsed.category)
            filter.category = parsed.category;
        if (parsed.district)
            filter['location.district'] = parsed.district;
        if (parsed.minPrice !== undefined || parsed.maxPrice !== undefined) {
            filter.price = {
                ...(parsed.minPrice !== undefined ? { $gte: parsed.minPrice } : {}),
                ...(parsed.maxPrice !== undefined ? { $lte: parsed.maxPrice } : {}),
            };
        }
        if (parsed.condition?.length) {
            filter.condition = { $in: parsed.condition };
        }
        const sortMap = {
            newest: { isFeatured: -1, postedAt: -1 },
            price_asc: { price: 1 },
            price_desc: { price: -1 },
            nearest: { isFeatured: -1, postedAt: -1 }, // geo sort needs 2dsphere index
        };
        const skip = (parsed.page - 1) * parsed.limit;
        const sort = sortMap[parsed.sortBy];
        const [listings, total] = await Promise.all([
            Listing_1.Listing.find(filter).sort(sort).skip(skip).limit(parsed.limit).lean(),
            Listing_1.Listing.countDocuments(filter),
        ]);
        (0, response_1.ok)(res, {
            listings,
            total,
            page: parsed.page,
            hasMore: skip + listings.length < total,
        });
        (0, debug_1.debugLog)('listings.search', 'Search response', {
            total,
            returned: listings.length,
            page: parsed.page,
        });
    }
    catch (err) {
        next(err);
    }
});
// ─────────────────────────────────────────────
// GET /listings/fresh   GET /listings/popular   GET /listings/best-deals
// ─────────────────────────────────────────────
router.get('/fresh', auth_1.optionalAuth, async (_req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const listings = await Listing_1.Listing.find({ status: 'active' })
            .sort({ isFeatured: -1, postedAt: -1 })
            .limit(10)
            .lean();
        (0, response_1.ok)(res, listings);
    }
    catch (err) {
        next(err);
    }
});
router.get('/popular', async (_req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const listings = await Listing_1.Listing.find({ status: 'active' })
            .sort({ views: -1, chatCount: -1 })
            .limit(12)
            .lean();
        (0, response_1.ok)(res, listings);
    }
    catch (err) {
        next(err);
    }
});
router.get('/best-deals', async (_req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const listings = await Listing_1.Listing.find({ status: 'active', condition: { $in: ['new', 'like_new'] } })
            .sort({ price: 1, postedAt: -1 })
            .limit(10)
            .lean();
        (0, response_1.ok)(res, listings);
    }
    catch (err) {
        next(err);
    }
});
// ─────────────────────────────────────────────
// GET /listings/:id
// ─────────────────────────────────────────────
router.get('/:id', auth_1.optionalAuth, async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const listing = await Listing_1.Listing.findById(req.params['id']).lean();
        if (!listing) {
            (0, response_1.notFound)(res, 'Listing not found');
            return;
        }
        (0, debug_1.debugLog)('listings.getById', 'Listing fetched', {
            listingId: req.params['id'],
            viewerUserId: req.userId,
            currentViews: listing.views ?? 0,
        });
        // Increment view count (fire-and-forget)
        Listing_1.Listing.findByIdAndUpdate(req.params['id'], { $inc: { views: 1 } }).exec();
        // Notify seller at view milestones
        const newViews = (listing.views ?? 0) + 1;
        if ([100, 500, 1000].includes(newViews)) {
            (0, notificationService_1.notifyListingMilestone)(listing.seller.id, listing.title, newViews, String(listing._id));
        }
        (0, response_1.ok)(res, listing);
    }
    catch (err) {
        next(err);
    }
});
// ─────────────────────────────────────────────
// GET /listings/:id/similar
// ─────────────────────────────────────────────
router.get('/:id/similar', async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const listing = await Listing_1.Listing.findById(req.params['id']).lean();
        if (!listing) {
            (0, response_1.notFound)(res);
            return;
        }
        const similar = await Listing_1.Listing.find({
            status: 'active',
            category: listing.category,
            _id: { $ne: listing._id },
        }).sort({ postedAt: -1 }).limit(8).lean();
        (0, response_1.ok)(res, similar);
    }
    catch (err) {
        next(err);
    }
});
// ─────────────────────────────────────────────
// POST /listings  (create with image upload)
// ─────────────────────────────────────────────
router.post('/', auth_1.requireAuth, rateLimit_1.listingCreateLimiter, upload.array('images', 10), async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const body = createSchema.parse(req.body);
        const files = req.files;
        (0, debug_1.debugLog)('listings.create', 'Create listing request', {
            userId: req.userId,
            firebaseUid: req.firebaseUid,
            imageCount: files?.length ?? 0,
            title: body.title,
            category: body.category,
        });
        if (!files?.length) {
            (0, response_1.badRequest)(res, 'At least one image is required');
            return;
        }
        // Get seller info
        const seller = await User_1.User.findOne({ firebaseUid: req.firebaseUid }).lean();
        if (!seller) {
            (0, response_1.badRequest)(res, 'User profile not found');
            return;
        }
        // Check if user is banned
        if (seller.isBanned) {
            (0, debug_1.debugWarn)('listings.create', 'Blocked banned user', {
                userId: req.userId,
                firebaseUid: req.firebaseUid,
            });
            res.status(403).json({ success: false, message: 'Your account has been suspended' });
            return;
        }
        // Upload all images in parallel
        const tempListingId = (0, uuid_1.v4)();
        const uploadResults = await Promise.all(files.map((f) => (0, imageService_1.uploadListingImage)(f.buffer, String(seller._id), tempListingId)));
        const images = uploadResults.map((r) => r.full);
        const coverImage = images[0];
        // Build location from neighborhood string
        const location = {
            district: body.neighborhood.split(', ')[1] ?? 'Kigali',
            neighborhood: body.neighborhood.split(', ')[0],
            displayLabel: body.neighborhood,
        };
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30-day listing lifetime
        const listing = await Listing_1.Listing.create({
            title: body.title,
            description: body.description,
            price: body.price,
            negotiable: body.negotiable,
            condition: body.condition,
            category: body.category,
            subcategory: body.subcategory,
            images,
            coverImage,
            location,
            seller: {
                id: seller._id,
                displayName: seller.displayName,
                avatar: seller.avatar,
                trustLevel: seller.trustLevel,
                verificationStatus: seller.verificationStatus,
                responseRate: seller.responseRate,
            },
            status: body.makeFeatured ? 'active' : 'active',
            isFeatured: body.makeFeatured,
            featuredUntil: body.makeFeatured ? new Date(Date.now() + 7 * 86400000) : undefined,
            postedAt: new Date(),
            expiresAt,
        });
        // Update seller's active listing count
        await User_1.User.findByIdAndUpdate(seller._id, { $inc: { activeListings: 1 } });
        (0, debug_1.debugLog)('listings.create', 'Listing created', {
            listingId: String(listing.id),
            sellerId: String(seller._id),
        });
        (0, response_1.created)(res, listing);
    }
    catch (err) {
        next(err);
    }
});
// ─────────────────────────────────────────────
// PATCH /listings/:id
// ─────────────────────────────────────────────
router.patch('/:id', auth_1.requireAuth, async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const seller = await User_1.User.findOne({ firebaseUid: req.firebaseUid }).lean();
        const listing = await Listing_1.Listing.findById(req.params['id']);
        if (!listing) {
            (0, response_1.notFound)(res, 'Listing not found');
            return;
        }
        if (String(listing.seller.id) !== String(seller?._id)) {
            (0, debug_1.debugWarn)('listings.update', 'Blocked non-owner update attempt', {
                listingId: req.params['id'],
                requesterUserId: req.userId,
            });
            res.status(403).json({ success: false, message: 'Not your listing' });
            return;
        }
        const allowed = ['title', 'description', 'price', 'negotiable', 'condition'];
        for (const key of allowed) {
            if (req.body[key] !== undefined)
                listing[key] = req.body[key];
        }
        await listing.save();
        (0, debug_1.debugLog)('listings.update', 'Listing updated', {
            listingId: req.params['id'],
            requesterUserId: req.userId,
        });
        (0, response_1.ok)(res, listing);
    }
    catch (err) {
        next(err);
    }
});
// ─────────────────────────────────────────────
// DELETE /listings/:id
// ─────────────────────────────────────────────
router.delete('/:id', auth_1.requireAuth, async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const seller = await User_1.User.findOne({ firebaseUid: req.firebaseUid }).lean();
        const listing = await Listing_1.Listing.findById(req.params['id']);
        if (!listing) {
            (0, response_1.notFound)(res, 'Listing not found');
            return;
        }
        const isAdmin = ['admin', 'moderator'].includes(req.userRole ?? '');
        const isOwner = String(listing.seller.id) === String(seller?._id);
        if (!isOwner && !isAdmin) {
            (0, debug_1.debugWarn)('listings.delete', 'Blocked delete attempt (not owner/admin)', {
                listingId: req.params['id'],
                requesterUserId: req.userId,
                role: req.userRole,
            });
            res.status(403).json({ success: false, message: 'Not authorised' });
            return;
        }
        await listing.deleteOne();
        if (isOwner) {
            await User_1.User.findByIdAndUpdate(seller?._id, { $inc: { activeListings: -1 } });
        }
        (0, debug_1.debugLog)('listings.delete', 'Listing deleted', {
            listingId: req.params['id'],
            requesterUserId: req.userId,
            isOwner,
            isAdmin,
        });
        (0, response_1.ok)(res, { deleted: true });
    }
    catch (err) {
        next(err);
    }
});
// ─────────────────────────────────────────────
// POST /listings/:id/boost
// ─────────────────────────────────────────────
router.post('/:id/boost', auth_1.requireAuth, async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const listing = await Listing_1.Listing.findById(req.params['id']);
        if (!listing) {
            (0, response_1.notFound)(res, 'Listing not found');
            return;
        }
        const daysMap = { featured: 7, top_ad: 3, elite_seller: 30 };
        const days = daysMap[req.body.packageId ?? 'featured'] ?? 7;
        listing.isFeatured = true;
        listing.featuredUntil = new Date(Date.now() + days * 86400000);
        await listing.save();
        (0, response_1.ok)(res, listing);
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=listings.js.map