"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ok = ok;
exports.created = created;
exports.noContent = noContent;
exports.notFound = notFound;
exports.forbidden = forbidden;
exports.badRequest = badRequest;
exports.errorHandler = errorHandler;
// ─── Typed API response helpers ───────────────
function ok(res, data, message) {
    res.json({ success: true, data, ...(message ? { message } : {}) });
}
function created(res, data) {
    res.status(201).json({ success: true, data });
}
function noContent(res) {
    res.status(204).send();
}
function notFound(res, message = 'Not found') {
    res.status(404).json({ success: false, message });
}
function forbidden(res, message = 'Forbidden') {
    res.status(403).json({ success: false, message });
}
function badRequest(res, message) {
    res.status(400).json({ success: false, message });
}
// ─── Global error handler ─────────────────────
function errorHandler(err, _req, res, _next) {
    console.error('[Error]', err.message, err.stack);
    if (err.name === 'ValidationError') {
        res.status(400).json({ success: false, message: err.message });
        return;
    }
    if (err.name === 'CastError') {
        res.status(400).json({ success: false, message: 'Invalid ID format' });
        return;
    }
    if (err.code === '11000') {
        res.status(409).json({ success: false, message: 'Duplicate entry' });
        return;
    }
    res.status(500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal server error'
            : err.message,
    });
}
//# sourceMappingURL=response.js.map