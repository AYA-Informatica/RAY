import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { requireStaff, requireAdmin } from "@/lib/permissions/roles";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("removeListing"), listingId: z.string().min(1) }),
  z.object({ action: z.literal("restoreListing"), listingId: z.string().min(1) }),
  z.object({ action: z.literal("resolveReport"), reportId: z.string().min(1) }),
  z.object({ action: z.literal("banUser"), userId: z.string().uuid() }),
  z.object({ action: z.literal("unbanUser"), userId: z.string().uuid() }),
]);

/** POST /api/admin — staff/admin moderation actions. Role-gated. */
export async function POST(req: NextRequest) {
  console.log("[POST admin] start");
  try {
    const user = await requireUser();
    requireStaff(user);
    console.log("[POST admin] staff check passed uid=", user.id, "role=", user.role);

    const body = actionSchema.parse(await req.json());
    console.log("[POST admin] action=", body.action);

    switch (body.action) {
      case "removeListing":
        await prisma.listing.update({ where: { id: body.listingId }, data: { status: "REMOVED" } });
        console.log("[POST admin] removeListing OK listingId=", body.listingId);
        break;
      case "restoreListing":
        await prisma.listing.update({ where: { id: body.listingId }, data: { status: "ACTIVE" } });
        console.log("[POST admin] restoreListing OK listingId=", body.listingId);
        break;
      case "resolveReport":
        await prisma.report.update({ where: { id: body.reportId }, data: { resolved: true } });
        console.log("[POST admin] resolveReport OK reportId=", body.reportId);
        break;
      case "banUser":
        requireAdmin(user); // banning is admin-only
        await prisma.user.update({ where: { id: body.userId }, data: { isBanned: true } });
        console.log("[POST admin] banUser OK targetUid=", body.userId);
        break;
      case "unbanUser":
        requireAdmin(user);
        await prisma.user.update({ where: { id: body.userId }, data: { isBanned: false } });
        console.log("[POST admin] unbanUser OK targetUid=", body.userId);
        break;
      default:
        return fail("Unknown action", 400);
    }

    logger.info({ by: user.id, action: body.action }, "Moderation action");
    return ok({ done: true });
  } catch (err) {
    console.error("[POST admin] ERROR:", err instanceof Error ? err.message : err);
    return handleApiError(err);
  }
}
