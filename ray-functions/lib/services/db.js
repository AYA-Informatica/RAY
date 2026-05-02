"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = connectDB;
const mongoose_1 = __importDefault(require("mongoose"));
let cached = null;
/**
 * connectDB — cached Mongoose connection for Cloud Functions.
 * Functions are stateless but connections are reused across warm invocations.
 */
async function connectDB() {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
        throw new Error('MONGODB_URI environment variable is not set');
    }
    if (cached && mongoose_1.default.connection.readyState === 1) {
        return cached;
    }
    cached = await mongoose_1.default.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
    });
    mongoose_1.default.connection.on('error', (err) => {
        console.error('[MongoDB] Connection error:', err);
        cached = null;
    });
    mongoose_1.default.connection.on('disconnected', () => {
        console.warn('[MongoDB] Disconnected — will reconnect on next request');
        cached = null;
    });
    console.log('[MongoDB] Connected');
    return cached;
}
//# sourceMappingURL=db.js.map