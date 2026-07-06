"use client";

import { createClient } from "@/lib/supabase/client";
import { logger } from "@/lib/logger";

export type Bucket = "listings" | "avatars" | "chat-images";

const MAX_DIMENSION = 1600; // px — cap longest side for low-bandwidth
const QUALITY = 0.8;

/** Returns true for HEIC/HEIF files that the Canvas API cannot decode. */
export function isHeicFile(file: File): boolean {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type === "image/heic" ||
    type === "image/heif" ||
    name.endsWith(".heic") ||
    name.endsWith(".heif")
  );
}

/**
 * Compress an image client-side (canvas -> WebP) before upload.
 * Critical for African low-bandwidth networks (Build Prompt requirement).
 * Throws a clear error for HEIC/HEIF files that createImageBitmap can't decode.
 */
async function compress(file: File): Promise<Blob> {
  logger.debug({ size: file.size, type: file.type }, "[storage/upload] compress start");
  if (isHeicFile(file)) {
    logger.warn({ name: file.name }, "[storage/upload] compress rejected — HEIC/HEIF not supported");
    throw new Error("HEIC_NOT_SUPPORTED");
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    logger.warn("[storage/upload] compress failed — image decode error");
    throw new Error("IMAGE_DECODE_FAILED");
  }
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    logger.debug("[storage/upload] compress — no 2d context, returning original file");
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => {
      logger.debug(
        { width, height, outputSize: blob?.size ?? file.size },
        "[storage/upload] compress complete",
      );
      resolve(blob ?? file);
    }, "image/webp", QUALITY);
  });
}

/**
 * Compress + upload a single image to a Supabase Storage bucket.
 * Returns the public URL. Throws on failure (caller handles UI).
 */
export async function uploadImage(file: File, bucket: Bucket, userId: string): Promise<string> {
  logger.debug({ bucket, userId }, "[storage/upload] uploadImage start");
  const supabase = createClient();
  const compressed = await compress(file);
  const path = `${userId}/${crypto.randomUUID()}.webp`;

  const { error } = await supabase.storage.from(bucket).upload(path, compressed, {
    contentType: "image/webp",
    upsert: false,
  });
  if (error) {
    logger.warn({ bucket, userId, err: error.message }, "[storage/upload] uploadImage failed");
    throw error;
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  logger.debug({ bucket, userId }, "[storage/upload] uploadImage complete");
  return data.publicUrl;
}

/** Upload many images sequentially, enforcing the 7-photo cap for listings. */
export async function uploadImages(
  files: File[],
  bucket: Bucket,
  userId: string,
): Promise<string[]> {
  const capped = bucket === "listings" ? files.slice(0, 7) : files;
  logger.debug(
    { bucket, userId, requested: files.length, capped: capped.length },
    "[storage/upload] uploadImages start",
  );
  const urls: string[] = [];
  for (const f of capped) urls.push(await uploadImage(f, bucket, userId));
  logger.debug({ bucket, userId, uploaded: urls.length }, "[storage/upload] uploadImages complete");
  return urls;
}
