import { timingSafeEqual } from "node:crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";

const CHAT_IMAGES_BUCKET = "chat-images";

function chatImagePathFromUrl(url: string): string | null {
  const marker = `/object/public/${CHAT_IMAGES_BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

/**
 * GET /api/cron/purge-messages
 *
 * Scheduled by Vercel Cron (see vercel.json). Purges chat messages from
 * conversations whose listing was deleted/removed/expired more than 30 days
 * ago, honouring the privacy promise in /privacy:
 *   "Chat messages are retained for 30 days after a listing is deleted,
 *    then permanently erased."
 *
 * Secured by CRON_SECRET — same pattern as expire-listings.
 */
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const secret = process.env.CRON_SECRET;
    if (secret) {
      const provided = req.headers.get("authorization")?.replace("Bearer ", "") ?? "";
      const safe =
        provided.length === secret.length &&
        timingSafeEqual(Buffer.from(provided), Buffer.from(secret));
      if (!safe) {
        logger.warn("Rejected unauthorized cron request to purge-messages");
        return fail("Unauthorized", 401);
      }
    }

    logger.debug({}, "[CRON purge-messages] request received");
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 30);

    // Find conversations on listings that have been REMOVED/EXPIRED/SOLD
    // for more than 30 days.
    const staleConversations = await prisma.conversation.findMany({
      where: {
        listing: {
          status: { in: ["REMOVED", "EXPIRED", "SOLD"] },
          updatedAt: { lt: cutoff },
        },
      },
      select: { id: true },
    });

    if (staleConversations.length === 0) {
      logger.info("Message purge: no stale conversations found");
      return ok({ purged: 0, ranAt: new Date().toISOString() });
    }

    const conversationIds = staleConversations.map((c) => c.id);

    // Collect image URLs before deletion so we can clean up storage after.
    const messagesWithImages = await prisma.message.findMany({
      where: { conversationId: { in: conversationIds }, imageUrl: { not: null } },
      select: { imageUrl: true },
    });

    const result = await prisma.message.deleteMany({
      where: { conversationId: { in: conversationIds } },
    });

    const chatImagePaths = messagesWithImages
      .map((m) => chatImagePathFromUrl(m.imageUrl!))
      .filter((p): p is string => p !== null);

    if (chatImagePaths.length > 0) {
      const { error: storageError } = await createAdminClient().storage
        .from(CHAT_IMAGES_BUCKET)
        .remove(chatImagePaths);
      if (storageError) {
        logger.error({ err: storageError }, "[CRON purge-messages] storage cleanup failed");
      } else {
        logger.info({ files: chatImagePaths.length }, "[CRON purge-messages] chat images removed from storage");
      }
    }

    logger.info(
      { purged: result.count, conversations: conversationIds.length },
      "Message purge complete",
    );

    return ok({
      purged: result.count,
      conversations: conversationIds.length,
      ranAt: new Date().toISOString(),
    });
  } catch (err) {
    logger.error({ err }, "[CRON purge-messages] ERROR");
    return handleApiError(err);
  }
}
