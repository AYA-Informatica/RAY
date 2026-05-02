"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduledJobs = void 0;
const db_1 = require("../services/db");
const Listing_1 = require("../models/Listing");
const User_1 = require("../models/User");
const notificationService_1 = require("../services/notificationService");
exports.scheduledJobs = {
    /**
     * dailyCleanup — runs at 2 AM Kigali time.
     * - Marks expired listings
     * - Sends expiry warning notifications (24h before)
     * - Clears expired featured flags
     * - Recalculates seller trust levels
     */
    dailyCleanup: async () => {
        await (0, db_1.connectDB)();
        const now = new Date();
        // 1. Expire listings past their expiresAt date
        const expired = await Listing_1.Listing.find({
            status: 'active',
            expiresAt: { $lte: now },
        }).select('_id seller title').lean();
        if (expired.length) {
            await Listing_1.Listing.updateMany({ _id: { $in: expired.map((l) => l._id) } }, { status: 'expired' });
            // Decrement active listing counts
            const sellerIds = [...new Set(expired.map((l) => l.seller.id))];
            for (const sellerId of sellerIds) {
                const count = expired.filter((l) => l.seller.id === sellerId).length;
                await User_1.User.findByIdAndUpdate(sellerId, { $inc: { activeListings: -count } });
            }
            console.log(`[Cleanup] Expired ${expired.length} listings`);
        }
        // 2. Warn sellers whose listings expire in the next 24 hours
        const tomorrow = new Date(now.getTime() + 24 * 3600000);
        const expiringSoon = await Listing_1.Listing.find({
            status: 'active',
            expiresAt: { $gte: now, $lte: tomorrow },
        }).select('_id seller title').lean();
        for (const listing of expiringSoon) {
            await (0, notificationService_1.notifyListingExpiring)(listing.seller.id, listing.title, String(listing._id));
        }
        console.log(`[Cleanup] Sent ${expiringSoon.length} expiry warnings`);
        // 3. Clear expired featured flags
        await Listing_1.Listing.updateMany({ isFeatured: true, featuredUntil: { $lte: now } }, { isFeatured: false, $unset: { featuredUntil: 1 } });
        // 4. Recalculate trust levels for active sellers
        const activeSellers = await User_1.User.find({ isBanned: false }).select('_id completedDeals responseRate verificationStatus').lean();
        const bulkOps = activeSellers.map((u) => {
            let trustLevel = 1;
            if (u.verificationStatus === 'id' || u.verificationStatus === 'dealer') {
                trustLevel = 3;
            }
            else if ((u.completedDeals ?? 0) >= 5 || (u.responseRate ?? 0) >= 90) {
                trustLevel = 2;
            }
            return {
                updateOne: {
                    filter: { _id: u._id },
                    update: { $set: { trustLevel } },
                },
            };
        });
        if (bulkOps.length)
            await User_1.User.bulkWrite(bulkOps);
        console.log(`[Cleanup] Recalculated trust levels for ${bulkOps.length} users`);
    },
    /**
     * hourlyTasks — runs every hour.
     * - Updates isOnline flag (users not seen in >15 min = offline)
     * - Syncs activeListings counts
     */
    hourlyTasks: async () => {
        await (0, db_1.connectDB)();
        const fifteenMinutesAgo = new Date(Date.now() - 15 * 60000);
        // Mark stale sessions as offline
        await User_1.User.updateMany({ isOnline: true, lastSeen: { $lte: fifteenMinutesAgo } }, { isOnline: false });
        // Sync activeListings count from source of truth
        const counts = await Listing_1.Listing.aggregate([
            { $match: { status: 'active' } },
            { $group: { _id: '$seller.id', count: { $sum: 1 } } },
        ]);
        const bulkOps = counts.map((c) => ({
            updateOne: {
                filter: { _id: c._id },
                update: { $set: { activeListings: c.count } },
            },
        }));
        if (bulkOps.length)
            await User_1.User.bulkWrite(bulkOps);
        console.log(`[Hourly] Synced listing counts for ${bulkOps.length} sellers`);
    },
};
//# sourceMappingURL=index.js.map