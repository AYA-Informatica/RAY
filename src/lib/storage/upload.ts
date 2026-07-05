"use client";

import { createClient } from "@/lib/supabase/client";

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
  if (isHeicFile(file)) {
    throw new Error("HEIC_NOT_SUPPORTED");
  }
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    throw new Error("IMAGE_DECODE_FAILED");
  }
  const scale = Math.min(1, MAX_DIMENSION / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, width, height);

  return new Promise<Blob>((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? file), "image/webp", QUALITY);
  });
}

/**
 * Compress + upload a single image to a Supabase Storage bucket.
 * Returns the public URL. Throws on failure (caller handles UI).
 */
export async function uploadImage(file: File, bucket: Bucket, userId: string): Promise<string> {
  const supabase = createClient();
  const compressed = await compress(file);
  const path = `${userId}/${crypto.randomUUID()}.webp`;

  const { error } = await supabase.storage.from(bucket).upload(path, compressed, {
    contentType: "image/webp",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

/** Upload many images sequentially, enforcing the 7-photo cap for listings. */
export async function uploadImages(
  files: File[],
  bucket: Bucket,
  userId: string,
): Promise<string[]> {
  const capped = bucket === "listings" ? files.slice(0, 7) : files;
  const urls: string[] = [];
  for (const f of capped) urls.push(await uploadImage(f, bucket, userId));
  return urls;
}
