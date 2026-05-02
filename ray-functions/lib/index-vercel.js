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
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
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
// ─── API routes (lazy loaded) ─────────────────
app.use('/api/listings', (req, res, next) => {
    Promise.resolve().then(() => __importStar(require('./routes/listings'))).then(({ listingsRouter }) => {
        listingsRouter(req, res, next);
    }).catch(next);
});
app.use('/api/users', (req, res, next) => {
    Promise.resolve().then(() => __importStar(require('./routes/users'))).then(({ usersRouter }) => {
        usersRouter(req, res, next);
    }).catch(next);
});
app.use('/api/conversations', (req, res, next) => {
    Promise.resolve().then(() => __importStar(require('./routes/conversations'))).then(({ conversationsRouter }) => {
        conversationsRouter(req, res, next);
    }).catch(next);
});
app.use('/api/reports', (req, res, next) => {
    Promise.resolve().then(() => __importStar(require('./routes/reports'))).then(({ reportsRouter }) => {
        reportsRouter(req, res, next);
    }).catch(next);
});
app.use('/api/search', rateLimit_1.searchLimiter, (req, res, next) => {
    Promise.resolve().then(() => __importStar(require('./routes/search'))).then(({ searchRouter }) => {
        searchRouter(req, res, next);
    }).catch(next);
});
app.use('/admin', (req, res, next) => {
    Promise.resolve().then(() => __importStar(require('./routes/admin'))).then(({ adminRouter }) => {
        adminRouter(req, res, next);
    }).catch(next);
});
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