import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { hideConversationsSchema } from "@/lib/validations/message.schema";
import { ok, handleApiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

/** POST /api/chat/conversations/hide — remove conversations from the current user's inbox. */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    const { conversationIds } = hideConversationsSchema.parse(await req.json());
    const now = new Date();

    // `updatedAt` is `@updatedAt` (auto-bumped on any row update) and drives
    // whether a hidden conversation has "new activity" since it was hidden
    // (buyerHiddenAt/sellerHiddenAt >= updatedAt). Pass the existing updatedAt
    // back explicitly so hiding doesn't bump it and immediately un-hide itself.
    const convos = await prisma.conversation.findMany({
      where: { id: { in: conversationIds }, OR: [{ buyerId: user.id }, { sellerId: user.id }] },
      select: { id: true, buyerId: true, sellerId: true, updatedAt: true },
    });

    await prisma.$transaction(
      convos.map((c) =>
        prisma.conversation.update({
          where: { id: c.id },
          data: {
            ...(c.buyerId === user.id ? { buyerHiddenAt: now } : {}),
            ...(c.sellerId === user.id ? { sellerHiddenAt: now } : {}),
            updatedAt: c.updatedAt,
          },
        }),
      ),
    );

    return ok({ hidden: convos.length });
  } catch (err) {
    return handleApiError(err);
  }
}
