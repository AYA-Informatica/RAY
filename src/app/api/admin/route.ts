import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { requireStaff, requireAdmin } from "@/lib/permissions/roles";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { logger } from "@/lib/logger";
import { z } from "zod";

export const dynamic = "force-dynamic";

async function logAction(
  adminId: string,
  action: string,
  targetType: "listing" | "user" | "report" | "config",
  targetId?: string,
  details?: string,
) {
  await prisma.adminAction
    .create({ data: { adminId, action, targetType, targetId, details } })
    .catch(() => null);
}

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("removeListing"), listingId: z.string().min(1) }),
  z.object({ action: z.literal("restoreListing"), listingId: z.string().min(1) }),
  z.object({ action: z.literal("featureListing"), listingId: z.string().min(1) }),
  z.object({ action: z.literal("unfeatureListing"), listingId: z.string().min(1) }),
  // Fix 4: accept outcome so it can be recorded in the audit log.
  z.object({ action: z.literal("resolveReport"), reportId: z.string().min(1), outcome: z.string().optional() }),
  z.object({ action: z.literal("banUser"), userId: z.string().uuid() }),
  z.object({ action: z.literal("unbanUser"), userId: z.string().uuid() }),
]);

/** POST /api/admin — staff/admin moderation actions. Role-gated. */
export async function POST(req: NextRequest) {
  try {
    const user = await requireUser();
    requireStaff(user);

    const body = actionSchema.parse(await req.json());
    logger.debug({ userId: user.id, action: body.action }, "[POST admin] request received");

    switch (body.action) {
      case "removeListing": {
        const listing = await prisma.listing.findUnique({ where: { id: body.listingId }, select: { title: true } });
        if (!listing) {
          logger.warn({ userId: user.id, listingId: body.listingId }, "[POST admin] rejected: listing not found");
          return fail("Listing not found", 404);
        }
        await prisma.listing.update({ where: { id: body.listingId }, data: { status: "REMOVED" } });
        await prisma.report.updateMany({
          where: { listingId: body.listingId, resolved: false },
          data: { resolved: true },
        });
        await logAction(user.id, "remove_listing", "listing", body.listingId, listing.title);
        break;
      }
      case "restoreListing": {
        const listing = await prisma.listing.findUnique({
          where: { id: body.listingId },
          select: { title: true, expiresAt: true },
        });
        if (!listing) {
          logger.warn({ userId: user.id, listingId: body.listingId }, "[POST admin] rejected: listing not found");
          return fail("Listing not found", 404);
        }
        // Fix 3: if the listing's original expiry has already passed, give it a
        // fresh 30-day window so it doesn't go live with a stale expiresAt.
        const freshExpiry = listing.expiresAt < new Date()
          ? (() => { const d = new Date(); d.setDate(d.getDate() + 30); return d; })()
          : undefined;
        await prisma.listing.update({
          where: { id: body.listingId },
          data: { status: "ACTIVE", ...(freshExpiry ? { expiresAt: freshExpiry } : {}) },
        });
        await logAction(user.id, "restore_listing", "listing", body.listingId, listing.title);
        break;
      }
      case "featureListing": {
        const listing = await prisma.listing.findUnique({ where: { id: body.listingId }, select: { title: true } });
        if (!listing) {
          logger.warn({ userId: user.id, listingId: body.listingId }, "[POST admin] rejected: listing not found");
          return fail("Listing not found", 404);
        }
        await prisma.listing.update({ where: { id: body.listingId }, data: { featured: true } });
        await logAction(user.id, "feature_listing", "listing", body.listingId, listing.title);
        break;
      }
      case "unfeatureListing": {
        const listing = await prisma.listing.findUnique({ where: { id: body.listingId }, select: { title: true } });
        if (!listing) {
          logger.warn({ userId: user.id, listingId: body.listingId }, "[POST admin] rejected: listing not found");
          return fail("Listing not found", 404);
        }
        await prisma.listing.update({ where: { id: body.listingId }, data: { featured: false } });
        await logAction(user.id, "unfeature_listing", "listing", body.listingId, listing.title);
        break;
      }
      case "resolveReport": {
        const report = await prisma.report.findUnique({
          where: { id: body.reportId },
          select: { listing: { select: { title: true } } },
        });
        if (!report) {
          logger.warn({ userId: user.id, reportId: body.reportId }, "[POST admin] rejected: report not found");
          return fail("Report not found", 404);
        }
        await prisma.report.update({ where: { id: body.reportId }, data: { resolved: true } });
        // Fix 4: record the outcome in the audit log details so resolutions are distinguishable.
        const outcomeNote = body.outcome ? ` [${body.outcome}]` : "";
        await logAction(user.id, "resolve_report", "report", body.reportId, `${report.listing?.title ?? ""}${outcomeNote}`);
        break;
      }
      case "banUser": {
        requireAdmin(user);
        const target = await prisma.user.findUnique({ where: { id: body.userId }, select: { name: true, email: true } });
        if (!target) {
          logger.warn({ userId: user.id, targetId: body.userId }, "[POST admin] rejected: user not found");
          return fail("User not found", 404);
        }
        await prisma.user.update({ where: { id: body.userId }, data: { isBanned: true } });
        await logAction(user.id, "ban_user", "user", body.userId, target.name ?? target.email);
        break;
      }
      case "unbanUser": {
        requireAdmin(user);
        const target = await prisma.user.findUnique({ where: { id: body.userId }, select: { name: true, email: true } });
        if (!target) {
          logger.warn({ userId: user.id, targetId: body.userId }, "[POST admin] rejected: user not found");
          return fail("User not found", 404);
        }
        await prisma.user.update({ where: { id: body.userId }, data: { isBanned: false } });
        await logAction(user.id, "unban_user", "user", body.userId, target.name ?? target.email);
        break;
      }
      default:
        logger.warn({ userId: user.id }, "[POST admin] rejected: unknown action");
        return fail("Unknown action", 400);
    }

    logger.info({ by: user.id, action: body.action }, "Moderation action");
    return ok({ done: true });
  } catch (err) {
    return handleApiError(err);
  }
}
