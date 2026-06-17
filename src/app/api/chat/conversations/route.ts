import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { startConversationSchema } from "@/lib/validations/message.schema";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { getInbox } from "@/services/chat";

export const dynamic = "force-dynamic";

/** GET /api/chat/conversations — the current user's inbox. */
export async function GET() {
  try {
    const user = await requireUser();
    const previews = await getInbox(user.id);
    return ok(previews);
  } catch (err) {
    console.error("[GET conversations] ERROR:", err instanceof Error ? err.message : err);
    return handleApiError(err);
  }
}

/** POST /api/chat/conversations — start or reuse a thread for a listing. */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { listingId } = startConversationSchema.parse(await req.json());

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, userId: true },
    });
    if (!listing) return fail("Listing not found", 404);
    if (listing.userId === user.id) return fail("You can't chat on your own listing", 400);

    const convo = await prisma.conversation.upsert({
      where: { listingId_buyerId: { listingId, buyerId: user.id } },
      update: {},
      create: { listingId, buyerId: user.id, sellerId: listing.userId },
      select: { id: true },
    });

    return ok(convo, { status: 201 });
  } catch (err) {
    console.error("[POST conversations] ERROR:", err instanceof Error ? err.message : err);
    return handleApiError(err);
  }
}
