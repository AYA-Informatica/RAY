import { requireUser } from "@/lib/auth/session";
import { getConversationPreview } from "@/services/chat";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/** GET /api/chat/conversations/[id] — a single inbox preview (for Realtime-added rows). */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await requireUser();
    logger.debug({ userId: user.id, conversationId: id }, "[GET conversation] request received");
    const preview = await getConversationPreview(id, user.id);
    if (!preview) {
      logger.warn({ userId: user.id, conversationId: id }, "[GET conversation] rejected: not found");
      return fail("Not found", 404);
    }
    logger.debug({ userId: user.id, conversationId: id }, "[GET conversation] success");
    return ok(preview);
  } catch (err) {
    return handleApiError(err);
  }
}
