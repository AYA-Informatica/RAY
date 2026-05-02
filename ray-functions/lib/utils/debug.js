"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debugLog = debugLog;
exports.debugWarn = debugWarn;
exports.debugError = debugError;
const isDebugEnabled = process.env.DEBUG_LOGS === 'true';
function debugLog(scope, message, meta) {
    if (!isDebugEnabled)
        return;
    if (meta) {
        console.log(`[${scope}] ${message}`, meta);
        return;
    }
    console.log(`[${scope}] ${message}`);
}
function debugWarn(scope, message, meta) {
    if (!isDebugEnabled)
        return;
    if (meta) {
        console.warn(`[${scope}] ${message}`, meta);
        return;
    }
    console.warn(`[${scope}] ${message}`);
}
function debugError(scope, message, meta) {
    if (!isDebugEnabled)
        return;
    if (meta) {
        console.error(`[${scope}] ${message}`, meta);
        return;
    }
    console.error(`[${scope}] ${message}`);
}
//# sourceMappingURL=debug.js.map