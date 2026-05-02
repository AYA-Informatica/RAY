"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireAuth = requireAuth;
exports.requireAdmin = requireAdmin;
exports.optionalAuth = optionalAuth;
const firebase_1 = require("../services/firebase");
const debug_1 = require("../utils/debug");
/**
 * requireAuth — verifies the Firebase Bearer token on every protected request.
 * Attaches userId, userRole, and firebaseUid to req.
 */
async function requireAuth(req, res, next) {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
        (0, debug_1.debugWarn)('auth.requireAuth', 'Missing bearer token', {
            method: req.method,
            path: req.path,
            hasAuthorizationHeader: !!header,
        });
        res.status(401).json({ success: false, message: 'Missing or invalid auth token' });
        return;
    }
    try {
        const token = header.split('Bearer ')[1];
        const decoded = await firebase_1.auth.verifyIdToken(token);
        req.firebaseUid = decoded.uid;
        req.userId = decoded.uid; // resolved to MongoDB _id in route handlers
        req.userRole = decoded.role ?? 'user';
        (0, debug_1.debugLog)('auth.requireAuth', 'Authenticated request', {
            method: req.method,
            path: req.path,
            userId: req.userId,
            role: req.userRole,
        });
        next();
    }
    catch (err) {
        (0, debug_1.debugError)('auth.requireAuth', 'Token verification failed', {
            method: req.method,
            path: req.path,
            error: err instanceof Error ? err.message : String(err),
        });
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
}
/**
 * requireAdmin — extends requireAuth, restricts to admin roles.
 */
function requireAdmin(roles = ['admin', 'moderator', 'support']) {
    return async (req, res, next) => {
        await requireAuth(req, res, async () => {
            if (!req.userRole || !roles.includes(req.userRole)) {
                (0, debug_1.debugWarn)('auth.requireAdmin', 'Blocked insufficient role', {
                    method: req.method,
                    path: req.path,
                    userId: req.userId,
                    role: req.userRole,
                    allowedRoles: roles,
                });
                res.status(403).json({ success: false, message: 'Insufficient permissions' });
                return;
            }
            (0, debug_1.debugLog)('auth.requireAdmin', 'Authorized admin route', {
                method: req.method,
                path: req.path,
                userId: req.userId,
                role: req.userRole,
            });
            next();
        });
    };
}
/**
 * optionalAuth — attaches user context if token is present, but doesn't block.
 */
async function optionalAuth(req, _res, next) {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
        try {
            const decoded = await firebase_1.auth.verifyIdToken(header.split('Bearer ')[1]);
            req.firebaseUid = decoded.uid;
            req.userId = decoded.uid;
            req.userRole = decoded.role ?? 'user';
            (0, debug_1.debugLog)('auth.optionalAuth', 'Optional auth attached', {
                method: req.method,
                path: req.path,
                userId: req.userId,
            });
        }
        catch (err) {
            (0, debug_1.debugWarn)('auth.optionalAuth', 'Optional auth token invalid', {
                method: req.method,
                path: req.path,
                error: err instanceof Error ? err.message : String(err),
            });
        }
    }
    next();
}
//# sourceMappingURL=auth.js.map