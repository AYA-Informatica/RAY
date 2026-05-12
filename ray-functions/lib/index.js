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
// ─────────────────────────────────────────────
// Environment variable loading for local development
// ─────────────────────────────────────────────
// Load .env file only in development when running locally
if (process.env.NODE_ENV === 'development' && !process.env.FIREBASE_PROJECT_ID) {
    try {
        require('dotenv').config();
        console.log('✓ Loaded environment variables from .env');
    }
    catch (error) {
        console.warn('⚠️ Could not load .env file:', error?.message || error);
    }
}
// Verify critical environment variables are present
const requiredVars = ['FIREBASE_PROJECT_ID', 'MONGODB_URI'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars);
    console.error('Functions may not work correctly without these variables');
}
// ─────────────────────────────────────────────
// Express app
// ─────────────────────────────────────────────
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://ray.vercel.app',
        'https://ray-production.web.app',
        'https://ray-production.firebaseapp.com',
    ],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10mb' }));
// ─── Health check ─────────────────────────────
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        envLoaded: !!process.env.MONGODB_URI,
        projectId: process.env.FIREBASE_PROJECT_ID
    });
});
// ─── API routes ───────────────────────────────
const listings_1 = require("./routes/listings");
const users_1 = require("./routes/users");
const conversations_1 = require("./routes/conversations");
const reports_1 = require("./routes/reports");
const admin_1 = require("./routes/admin");
const search_1 = require("./routes/search");
const migrations_1 = require("./routes/migrations");
const response_1 = require("./utils/response");
const rateLimit_1 = require("./middleware/rateLimit");
app.use('/listings', listings_1.listingsRouter);
app.use('/users', users_1.usersRouter);
app.use('/conversations', conversations_1.conversationsRouter);
app.use('/reports', reports_1.reportsRouter);
app.use('/search', rateLimit_1.searchLimiter, search_1.searchRouter);
app.use('/admin', admin_1.adminRouter);
app.use('/migrations', migrations_1.migrationsRouter);
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