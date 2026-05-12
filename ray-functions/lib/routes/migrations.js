"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrationsRouter = void 0;
const express_1 = require("express");
const Listing_1 = require("../models/Listing");
const User_1 = require("../models/User");
const auth_1 = require("../middleware/auth");
const response_1 = require("../utils/response");
const db_1 = require("../services/db");
const neighborhoodCoords_1 = require("../utils/neighborhoodCoords");
const router = (0, express_1.Router)();
exports.migrationsRouter = router;
/**
 * POST /migrations/backfill-coordinates
 * One-time migration: adds lat/lng to all listings and users
 * that have a displayLabel but no coordinates.
 * Admin only. Idempotent — safe to run multiple times.
 */
router.post('/backfill-coordinates', (0, auth_1.requireAdmin)(['admin']), async (_req, res, next) => {
    try {
        await (0, db_1.connectDB)();
        // Backfill listings
        const listingsWithoutCoords = await Listing_1.Listing.find({
            'location.displayLabel': { $exists: true },
            $or: [
                { 'location.lat': { $exists: false } },
                { 'location.lat': null },
                { 'location.lat': 0 },
            ],
        }).select('_id location').lean();
        let listingsUpdated = 0;
        for (const listing of listingsWithoutCoords) {
            const coords = (0, neighborhoodCoords_1.getCoordsForNeighborhood)(listing.location.displayLabel);
            if (!coords)
                continue;
            await Listing_1.Listing.findByIdAndUpdate(listing._id, {
                'location.lat': coords.lat,
                'location.lng': coords.lng,
                'location.source': 'manual',
                geoPoint: {
                    type: 'Point',
                    coordinates: [coords.lng, coords.lat],
                },
            });
            listingsUpdated++;
        }
        // Backfill users
        const usersWithoutCoords = await User_1.User.find({
            'location.displayLabel': { $exists: true },
            $or: [
                { 'location.lat': { $exists: false } },
                { 'location.lat': null },
                { 'location.lat': 0 },
            ],
        }).select('_id location').lean();
        let usersUpdated = 0;
        for (const user of usersWithoutCoords) {
            if (!user.location?.displayLabel)
                continue;
            const coords = (0, neighborhoodCoords_1.getCoordsForNeighborhood)(user.location.displayLabel);
            if (!coords)
                continue;
            await User_1.User.findByIdAndUpdate(user._id, {
                'location.lat': coords.lat,
                'location.lng': coords.lng,
                'location.source': 'manual',
            });
            usersUpdated++;
        }
        (0, response_1.ok)(res, {
            listingsBackfilled: listingsUpdated,
            usersBackfilled: usersUpdated,
            listingsSkipped: listingsWithoutCoords.length - listingsUpdated,
            usersSkipped: usersWithoutCoords.length - usersUpdated,
        });
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=migrations.js.map