import { requireUser } from "@/lib/auth/session";
import { getConversationPreview } from "@/services/chat";
import { ok, fail, handleApiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

/** GET /api/chat/conversations/[id] — a single inbox preview (for Realtime-added rows). */
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  try {
    const user = await requireUser();
    const preview = await getConversationPreview(params.id, user.id);
    if (!preview) return fail("Not found", 404);
    return ok(preview);
  } catch (err) {
    return handleApiError(err);
  }
}
