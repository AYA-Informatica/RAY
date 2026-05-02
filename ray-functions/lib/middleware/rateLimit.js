"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportLimiter = exports.searchLimiter = exports.listingCreateLimiter = exports.authLimiter = void 0;
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const json429 = (_req, res) => {
    res.status(429).json({
        success: false,
        message: 'Too many requests. Please wait and try again.',
    });
};
/** OTP / auth: 5 requests per 15 minutes per IP */
exports.authLimiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    handler: json429,
});
/** Listing creation: 10 per hour per authenticated user (key by userId header or IP) */
exports.listingCreateLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 10,
    keyGenerator: (req) => req.userId ?? req.ip ?? 'unknown',
    standardHeaders: true,
    legacyHeaders: false,
    handler: json429,
});
/** Search: 100 per minute per IP */
exports.searchLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    handler: json429,
});
/** Reports: 5 per hour per user */
exports.reportLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000,
    max: 5,
    keyGenerator: (req) => req.userId ?? req.ip ?? 'unknown',
    standardHeaders: true,
    legacyHeaders: false,
    handler: json429,
});
//# sourceMappingURL=rateLimit.js.map