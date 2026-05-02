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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onUserDeleted = exports.onUserCreated = exports.onMessageCreated = exports.computeTrustLevels = exports.updateUserOnlineStatus = exports.expireFeaturedBoosts = exports.notifyExpiringListings = exports.expireListings = exports.api = void 0;
const functions = __importStar(require("firebase-functions"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const listings_1 = require("./routes/listings");
const users_1 = require("./routes/users");
const conversations_1 = require("./routes/conversations");
const reports_1 = require("./routes/reports");
const admin_1 = require("./routes/admin");
const search_1 = require("./routes/search");
const response_1 = require("./utils/response");
const rateLimit_1 = require("./middleware/rateLimit");
// ─────────────────────────────────────────────
// Express app
// ─────────────────────────────────────────────
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://ray.rw',
        'https://admin.ray.rw',
        /\.ray\.rw$/,
    ],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '2mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', ts: new Date().toISOString() });
});
// ─── API routes ──────────────────────────────
app.use('/api/listings', listings_1.listingsRouter);
app.use('/api/users/me', rateLimit_1.authLimiter, users_1.usersRouter);
app.use('/api/users', users_1.usersRouter);
app.use('/api/conversations', conversations_1.conversationsRouter);
app.use('/api/reports', reports_1.reportsRouter);
app.use('/api/search', rateLimit_1.searchLimiter, search_1.searchRouter);
app.use('/admin', admin_1.adminRouter);
// ─── Global error handler ─────────────────────
app.use(response_1.errorHandler);
// ─────────────────────────────────────────────
// Export HTTP function
// ─────────────────────────────────────────────
exports.api = functions
    .runWith({ timeoutSeconds: 60, memory: '512MB' })
    .https.onRequest(app);
// ─────────────────────────────────────────────
// Scheduled functions
// ─────────────────────────────────────────────
var scheduled_1 = require("./scheduled");
Object.defineProperty(exports, "expireListings", { enumerable: true, get: function () { return scheduled_1.expireListings; } });
Object.defineProperty(exports, "notifyExpiringListings", { enumerable: true, get: function () { return scheduled_1.notifyExpiringListings; } });
Object.defineProperty(exports, "expireFeaturedBoosts", { enumerable: true, get: function () { return scheduled_1.expireFeaturedBoosts; } });
Object.defineProperty(exports, "updateUserOnlineStatus", { enumerable: true, get: function () { return scheduled_1.updateUserOnlineStatus; } });
Object.defineProperty(exports, "computeTrustLevels", { enumerable: true, get: function () { return scheduled_1.computeTrustLevels; } });
// ─────────────────────────────────────────────
// Firestore + Auth triggers
// ─────────────────────────────────────────────
var triggers_1 = require("./triggers");
Object.defineProperty(exports, "onMessageCreated", { enumerable: true, get: function () { return triggers_1.onMessageCreated; } });
Object.defineProperty(exports, "onUserCreated", { enumerable: true, get: function () { return triggers_1.onUserCreated; } });
Object.defineProperty(exports, "onUserDeleted", { enumerable: true, get: function () { return triggers_1.onUserDeleted; } });
//# sourceMappingURL=index.js.map