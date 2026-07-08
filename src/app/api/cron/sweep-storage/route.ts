import { timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

// Files uploaded in the last 2 hours may not yet have a DB record (in-progress
// sell wizard, avatar picker not yet saved). Skip them to avoid false positives.
const GRACE_MS = 2 * 60 * 60 * 1000;

function pathFromUrl(url: string, bucket: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

/** List every file in a bucket, walking all user-id subdirectories. */
async function listAllPaths(bucket: string): Promise<{ path: string; createdAt: number }[]> {
  const supabase = createAdminClient();
  const results: { path: string; createdAt: number }[] = [];

  const { data: rootItems, error: rootError } = await supabase.storage
    .from(bucket)
    .list("", { limit: 1000 });
  if (rootError || !rootItems) return results;

  for (const item of rootItems) {
    if (item.id !== null) {
      // Bare file at bucket root (unexpected but handle it)
      results.push({ path: item.name, createdAt: new Date(item.created_at ?? 0).getTime() });
      continue;
    }
    // It's a user-id folder — paginate through its contents
    let offset = 0;
    while (true) {
      const { data: files, error: filesError } = await supabase.storage
        .from(bucket)
        .list(item.name, { limit: 1000, offset });
      if (filesError || !files || files.length === 0) break;
      for (const file of files) {
        if (file.id !== null) {
          results.push({
            path: `${item.name}/${file.name}`,
            createdAt: new Date(file.created_at ?? 0).getTime(),
          });
        }
      }
      if (files.length < 1000) break;
      offset += 1000;
    }
  }

  return results;
}

/** Delete every file in `bucket` whose path is not in `referencedPaths` and is older than GRACE_MS. */
async function sweepBucket(bucket: string, referencedPaths: Set<string>): Promise<number> {
  const allFiles = await listAllPaths(bucket);
  const now = Date.now();

  const orphans = allFiles
    .filter((f) => !referencedPaths.has(f.path) && now - f.createdAt > GRACE_MS)
    .map((f) => f.path);

  if (orphans.length === 0) return 0;

  // Batch removals — Supabase accepts up to 1000 paths per call
  const BATCH = 500;
  for (let i = 0; i < orphans.length; i += BATCH) {
    const batch = orphans.slice(i, i + BATCH);
    const { error } = await createAdminClient().storage.from(bucket).remove(batch);
    if (error) {
      logger.error({ err: error, bucket, count: batch.length }, "[CRON sweep-storage] remove error");
    }
  }

  return orphans.length;
}

/**
 * GET /api/cron/sweep-storage
 *
 * Scheduled nightly by Vercel Cron. Lists every object in the listings,
 * avatars, and chat-images buckets, cross-references against DB records,
 * and deletes orphaned files older than 2 hours.
 *
 * Covers the draft-abandonment gap: photos uploaded during an abandoned
 * sell-wizard session that never became ListingImage rows.
 */
export async function GET(req: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    if (secret) {
      const provided = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
      const safe =
        provided.length === secret.length &&
        timingSafeEqual(Buffer.from(provided), Buffer.from(secret));
      if (!safe) {
        logger.warn("[CRON sweep-storage] rejected unauthorized request");
        return fail("Unauthorized", 401);
      }
    }

    logger.debug({}, "[CRON sweep-storage] started");

    // Pull every DB-referenced storage path in parallel
    const [listingImages, usersWithAvatars, chatMessages] = await Promise.all([
      prisma.listingImage.findMany({ select: { url: true } }),
      prisma.user.findMany({ where: { avatarUrl: { not: null } }, select: { avatarUrl: true } }),
      prisma.message.findMany({ where: { imageUrl: { not: null } }, select: { imageUrl: true } }),
    ]);

    const listingPaths = new Set(
      listingImages.map((i) => pathFromUrl(i.url, "listings")).filter((p): p is string => p !== null),
    );
    const avatarPaths = new Set(
      usersWithAvatars
        .map((u) => pathFromUrl(u.avatarUrl!, "avatars"))
        .filter((p): p is string => p !== null),
    );
    const chatPaths = new Set(
      chatMessages
        .map((m) => pathFromUrl(m.imageUrl!, "chat-images"))
        .filter((p): p is string => p !== null),
    );

    const [listingsRemoved, avatarsRemoved, chatRemoved] = await Promise.all([
      sweepBucket("listings", listingPaths),
      sweepBucket("avatars", avatarPaths),
      sweepBucket("chat-images", chatPaths),
    ]);

    const total = listingsRemoved + avatarsRemoved + chatRemoved;
    logger.info(
      { listingsRemoved, avatarsRemoved, chatRemoved, total },
      "[CRON sweep-storage] complete",
    );

    return ok({
      removed: { listings: listingsRemoved, avatars: avatarsRemoved, chat: chatRemoved, total },
      ranAt: new Date().toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "[CRON sweep-storage] ERROR");
    return handleApiError(err);
  }
}
