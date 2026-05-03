"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
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
exports.app = app;
app.use((0, cors_1.default)({
    origin: [
        'http://localhost:5173',
        'http://localhost:5174',
        'https://ray.rw',
        'https://admin.ray.rw',
        /\.ray\.rw$/,
        /\.vercel\.app$/,
    ],
    credentials: true,
}));
app.use(express_1.default.json({ limit: '2mb' }));
app.use(express_1.default.urlencoded({ extended: true }));
// Health check
app.get('/health', (_req, res) => {
    res.json({ status: 'ok', ts: new Date().toISOString() });
});
app.get('/', (_req, res) => {
    res.json({
        name: 'RAY API',
        version: '1.0.0',
        status: 'running',
        env: {
            nodeEnv: process.env.NODE_ENV,
            hasMongoUri: !!process.env.MONGODB_URI,
            hasStorageBucket: !!process.env.FIREBASE_STORAGE_BUCKET,
        },
        endpoints: [
            '/api/listings',
            '/api/users',
            '/api/conversations',
            '/api/reports',
            '/api/search',
            '/admin'
        ]
    });
});
// ─── API routes (static imports) ─────────────
app.use('/api/listings', listings_1.listingsRouter);
app.use('/api/users', users_1.usersRouter);
app.use('/api/conversations', conversations_1.conversationsRouter);
app.use('/api/reports', reports_1.reportsRouter);
app.use('/api/search', rateLimit_1.searchLimiter, search_1.searchRouter);
app.use('/admin', admin_1.adminRouter);
// ─── Global error handler ─────────────────────
app.use(response_1.errorHandler);
// For local development
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`🚀 RAY API running on port ${PORT}`);
    });
}
//# sourceMappingURL=index-vercel.js.map