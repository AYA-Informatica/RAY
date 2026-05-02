"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadListingImage = uploadListingImage;
exports.uploadAvatar = uploadAvatar;
exports.deleteStorageFile = deleteStorageFile;
const sharp_1 = __importDefault(require("sharp"));
const uuid_1 = require("uuid");
const firebase_1 = require("./firebase");
const BUCKET = process.env.FIREBASE_STORAGE_BUCKET ?? '';
async function uploadBuffer(buffer, storagePath, contentType = 'image/webp') {
    const bucket = firebase_1.storage.bucket(BUCKET);
    const file = bucket.file(storagePath);
    await file.save(buffer, {
        metadata: {
            contentType,
            cacheControl: 'public, max-age=31536000',
        },
    });
    await file.makePublic();
    return {
        url: `https://storage.googleapis.com/${BUCKET}/${storagePath}`,
        path: storagePath,
    };
}
/**
 * Process and upload a listing image.
 * Produces: full (1200px WebP) + thumbnail (400x300 WebP).
 * Returns { full, thumb } — both are public CDN URLs.
 */
async function uploadListingImage(inputBuffer, userId, listingId) {
    const fileName = (0, uuid_1.v4)();
    const basePath = `listings/${userId}/${listingId}`;
    const [fullBuffer, thumbBuffer] = await Promise.all([
        (0, sharp_1.default)(inputBuffer)
            .resize(1200, 1080, { fit: 'inside', withoutEnlargement: true })
            .webp({ quality: 82, effort: 4 })
            .toBuffer(),
        (0, sharp_1.default)(inputBuffer)
            .resize(400, 300, { fit: 'cover', position: 'centre' })
            .webp({ quality: 75, effort: 4 })
            .toBuffer(),
    ]);
    const [full, thumb] = await Promise.all([
        uploadBuffer(fullBuffer, `${basePath}/${fileName}.webp`),
        uploadBuffer(thumbBuffer, `${basePath}/thumb_${fileName}.webp`),
    ]);
    return { full: full.url, thumb: thumb.url };
}
/**
 * Upload a user avatar.
 * 400x400 square crop, WebP, 80% quality.
 */
async function uploadAvatar(inputBuffer, userId) {
    const processed = await (0, sharp_1.default)(inputBuffer)
        .resize(400, 400, { fit: 'cover', position: 'centre' })
        .webp({ quality: 80, effort: 4 })
        .toBuffer();
    const storagePath = `avatars/${userId}/${(0, uuid_1.v4)()}.webp`;
    const result = await uploadBuffer(processed, storagePath);
    return result.url;
}
/**
 * Delete a Storage file by its public URL.
 * Non-fatal — logs warning on failure.
 */
async function deleteStorageFile(url) {
    try {
        const path = url.split(`${BUCKET}/`)[1];
        if (!path)
            return;
        await firebase_1.storage.bucket(BUCKET).file(path).delete();
    }
    catch {
        console.warn('[Storage] Could not delete:', url);
    }
}
//# sourceMappingURL=imageService.js.map