"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.usersRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const User_1 = require("../models/User");
const Listing_1 = require("../models/Listing");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const imageService_1 = require("../services/imageService");
const db_1 = require("../services/db");
const router = (0, express_1.Router)();
exports.usersRouter = router;
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
// ─────────────────────────────────────────────
// GET /users/me
// ─────────────────────────────────────────────
router.get('/me', auth_1.requireAuth, async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        let user = await User_1.User.findOne({ firebaseUid: req.firebaseUid }).lean();
        // Auto-create profile on first login
        if (!user) {
            user = await User_1.User.create({
                firebaseUid: req.firebaseUid,
                phone: req.body.phone ?? '',
                displayName: req.body.displayName ?? 'RAY User',
                verificationStatus: 'phone',
                memberSince: new Date(),
            });
        }
        (0, response_1.ok)(res, user);
    }
    catch (err) {
        next(err);
    }
});
// ─────────────────────────────────────────────
// PATCH /users/me
// ─────────────────────────────────────────────
router.patch('/me', auth_1.requireAuth, async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const allowed = ['displayName', 'location', 'settings', 'fcmToken'];
        const updates = {};
        for (const key of allowed) {
            if (req.body[key] !== undefined)
                updates[key] = req.body[key];
        }
        const user = await User_1.User.findOneAndUpdate({ firebaseUid: req.firebaseUid }, { $set: updates }, { new: true, runValidators: true }).lean();
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
// POST /users/me/avatar
// ─────────────────────────────────────────────
router.post('/me/avatar', auth_1.requireAuth, upload.single('avatar'), async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const file = req.file;
        if (!file) {
            res.status(400).json({ success: false, message: 'No file uploaded' });
            return;
        }
        const user = await User_1.User.findOne({ firebaseUid: req.firebaseUid });
        if (!user) {
            (0, response_1.notFound)(res, 'User not found');
            return;
        }
        const avatarUrl = await (0, imageService_1.uploadAvatar)(file.buffer, String(user._id));
        user.avatar = avatarUrl;
        await user.save();
        (0, response_1.ok)(res, { url: avatarUrl });
    }
    catch (err) {
        next(err);
    }
});
// ─────────────────────────────────────────────
// GET /users/:id
// ─────────────────────────────────────────────
router.get('/:id', async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const user = await User_1.User.findById(req.params['id'])
            .select('-firebaseUid -fcmToken -settings')
            .lean();
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
// GET /users/:id/listings
// ─────────────────────────────────────────────
router.get('/:id/listings', async (req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        const listings = await Listing_1.Listing.find({
            'seller.id': req.params['id'],
            status: 'active',
        }).sort({ postedAt: -1 }).limit(20).lean();
        (0, response_1.ok)(res, listings);
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=users.js.map