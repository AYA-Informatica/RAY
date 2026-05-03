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
Object.defineProperty(exports, "__esModule", { value: true });
exports.admin = exports.messaging = exports.storage = exports.auth = exports.db = void 0;
const admin = __importStar(require("firebase-admin"));
exports.admin = admin;
const storage_1 = require("firebase-admin/storage");
const debug_1 = require("../utils/debug");
if (!admin.apps.length) {
    // Check if we have service account credentials
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        try {
            const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
                storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
            });
            (0, debug_1.debugLog)('firebase.init', 'Initialized with service account', {
                projectId: serviceAccount.project_id,
            });
        }
        catch (err) {
            console.error('Failed to parse FIREBASE_SERVICE_ACCOUNT:', err);
            admin.initializeApp();
        }
    }
    else {
        // Fallback to default credentials (works in Cloud Functions)
        admin.initializeApp();
        (0, debug_1.debugLog)('firebase.init', 'Initialized with default credentials', {});
    }
}
exports.db = admin.firestore();
exports.auth = admin.auth();
exports.storage = (0, storage_1.getStorage)();
exports.messaging = admin.messaging();
//# sourceMappingURL=firebase.js.map