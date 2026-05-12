"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
console.log('=== DATABASE CONNECTION DEBUG ===');
console.log('MONGODB_URI available:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI length:', process.env.MONGODB_URI?.length || 0);
let isConnected = false;
const connectDB = async () => {
    if (isConnected) {
        console.log('✓ Already connected to MongoDB');
        return;
    }
    try {
        console.log('⏳ Attempting to connect to MongoDB...');
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        isConnected = true;
        console.log('✓ Successfully connected to MongoDB');
    }
    catch (error) {
        console.error('❌ Failed to connect to MongoDB:', error);
        throw error;
    }
    console.log('=== END DATABASE CONNECTION DEBUG ===');
};
exports.connectDB = connectDB;
//# sourceMappingURL=db.js.map