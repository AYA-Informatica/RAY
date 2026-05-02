"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeTrustLevels = exports.updateUserOnlineStatus = exports.expireFeaturedBoosts = exports.notifyExpiringListings = exports.expireListings = void 0;
const functions = __importStar(require("firebase-functions"));
const db_1 = require("./services/db");
const Listing_1 = require("./models/Listing");
const User_1 = require("./models/User");
const notificationService_1 = require("./services/notificationService");
const firebase_1 = require("./services/firebase");
/**
 * expireListings — runs every hour.
 * Marks listings past their expiresAt as 'expired' and updates seller counts.
 */
exports.expireListings = functions.pubsub
    .schedule('every 60 minutes')
    .onRun(async () => {
    await (0, db_1.connectDB)();
    const now = new Date();
    const expired = await Listing_1.Listing.find({
        status: 'active',
        expiresAt: { $lte: now },
    }).select('_id seller.id').lean();
    if (expired.length === 0)
        return;
    const ids = expired.map((l) => l._id);
    const sellerIds = [...new Set(expired.map((l) => l.seller.id))];
    await Listing_1.Listing.updateMany({ _id: { $in: ids } }, { status: 'expired' });
    // Decrement each seller's active listing count
    await Promise.all(sellerIds.map((sid) => {
        const count = expired.filter((l) => l.seller.id === sid).length;
        return User_1.User.findByIdAndUpdate(sid, { $inc: { activeListings: -count } });
    }));
    // Send Firestore notifications
    const batch = firebase_1.db.batch();
    for (const listing of expired) {
        const notifRef = firebase_1.db.collection('notifications').doc();
        batch.set(notifRef, {
            userId: listing.seller.id,
            type: 'listing_expiring',
            title: 'Listing expired',
            body: `Your listing has expired. Repost it to continue getting buyers.`,
            read: false,
            createdAt: new Date().toISOString(),
        });
    }
    await batch.commit();
    console.log(`[expireListings] Expired ${expired.length} listings`);
});
/**
 * notifyExpiringListings — runs daily at 9 AM EAT (UTC+3 = 06:00 UTC).
 * Warns sellers 24 hours before their listing expires.
 */
exports.notifyExpiringListings = functions.pubsub
    .schedule('0 6 * * *')
    .timeZone('Africa/Kigali')
    .onRun(async () => {
    await (0, db_1.connectDB)();
    const in24h = new Date(Date.now() + 24 * 3600000);
    const in25h = new Date(Date.now() + 25 * 3600000);
    const expiring = await Listing_1.Listing.find({
        status: 'active',
        expiresAt: { $gte: in24h, $lte: in25h },
    }).select('_id title seller.id').lean();
    await Promise.all(expiring.map((l) => (0, notificationService_1.notifyListingExpiring)(l.seller.id, l.title, String(l._id))));
    console.log(`[notifyExpiringListings] Notified ${expiring.length} sellers`);
});
/**
 * expireFeaturedBoosts — runs every 30 minutes.
 * Removes featured status from listings whose featuredUntil has passed.
 */
exports.expireFeaturedBoosts = functions.pubsub
    .schedule('every 30 minutes')
    .onRun(async () => {
    await (0, db_1.connectDB)();
    const { modifiedCount } = await Listing_1.Listing.updateMany({ isFeatured: true, featuredUntil: { $lte: new Date() } }, { isFeatured: false });
    console.log(`[expireFeaturedBoosts] Expired ${modifiedCount} featured boosts`);
});
/**
 * updateUserOnlineStatus — runs every 5 minutes.
 * Marks users as offline if lastSeen > 10 minutes ago.
 */
exports.updateUserOnlineStatus = functions.pubsub
    .schedule('every 5 minutes')
    .onRun(async () => {
    await (0, db_1.connectDB)();
    const tenMinutesAgo = new Date(Date.now() - 10 * 60000);
    await User_1.User.updateMany({ isOnline: true, lastSeen: { $lte: tenMinutesAgo } }, { isOnline: false });
});
/**
 * computeTrustLevels — runs daily at midnight.
 * Recomputes trust levels based on updated metrics.
 */
exports.computeTrustLevels = functions.pubsub
    .schedule('0 0 * * *')
    .timeZone('Africa/Kigali')
    .onRun(async () => {
    await (0, db_1.connectDB)();
    // Level 3: verified or dealer status
    const level3 = await User_1.User.updateMany({ verificationStatus: { $in: ['id', 'dealer'] } }, { trustLevel: 3 });
    // Level 2: 5+ completed deals or 90%+ response rate
    const level2 = await User_1.User.updateMany({
        verificationStatus: { $nin: ['id', 'dealer'] },
        $or: [
            { completedDeals: { $gte: 5 } },
            { responseRate: { $gte: 90 } },
        ],
    }, { trustLevel: 2 });
    // Level 1: everyone else
    const level1 = await User_1.User.updateMany({
        verificationStatus: { $nin: ['id', 'dealer'] },
        completedDeals: { $lt: 5 },
        responseRate: { $lt: 90 },
    }, { trustLevel: 1 });
    console.log(`[computeTrustLevels] Level 3: ${level3.modifiedCount}, Level 2: ${level2.modifiedCount}, Level 1: ${level1.modifiedCount}`);
});
//# sourceMappingURL=scheduled.js.map