import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { updateProfileSchema } from "@/lib/validations/profile.schema";
import { sanitizeObject } from "@/lib/sanitization/sanitize";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";

const AVATARS_BUCKET = "avatars";

function avatarPathFromUrl(url: string): string | null {
  const marker = `/object/public/${AVATARS_BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/users/:id — public profile + active listing count. */
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    logger.debug({ userId: id }, "[GET user] request received");
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, name: true, avatarUrl: true, bio: true, city: true, createdAt: true },
    });
    if (!user) {
      logger.warn({ userId: id }, "[GET user] rejected: not found");
      return fail("User not found", 404);
    }
    const listingsCount = await prisma.listing.count({
      where: { userId: id, status: "ACTIVE" },
    });
    logger.debug({ userId: id, listingsCount }, "[GET user] success");
    return ok({ ...user, listingsCount });
  } catch (err) {
    logger.error({ err }, "[GET user] ERROR");
    return handleApiError(err);
  }
}

/** PATCH /api/users/:id — update own profile only. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const user = await requireUser();
    if (user.id !== id) {
      logger.warn({ userId: user.id, targetId: id }, "[PATCH user] rejected: forbidden");
      return fail("Forbidden", 403);
    }

    const patch = updateProfileSchema.parse(await req.json());
    logger.debug({ userId: user.id }, "[PATCH user] request received");

    const { avatarUrl, ...textFields } = patch;
    const data = {
      ...sanitizeObject(textFields as Record<string, unknown>),
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    };

    // Capture old avatar path before overwriting so we can delete it after.
    let oldAvatarPath: string | null = null;
    if (avatarUrl !== undefined) {
      const current = await prisma.user.findUnique({
        where: { id: user.id },
        select: { avatarUrl: true },
      });
      if (current?.avatarUrl) {
        oldAvatarPath = avatarPathFromUrl(current.avatarUrl);
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      select: { id: true, name: true, bio: true, avatarUrl: true, city: true, district: true },
    });

    if (oldAvatarPath) {
      const { error: storageError } = await createAdminClient().storage
        .from(AVATARS_BUCKET)
        .remove([oldAvatarPath]);
      if (storageError) {
        logger.error({ err: storageError, userId: user.id }, "[PATCH user] avatar storage cleanup failed");
      }
    }

    logger.debug({ userId: user.id }, "[PATCH user] success");
    return ok(updated);
  } catch (err) {
    logger.error({ err }, "[PATCH user] ERROR");
    return handleApiError(err);
  }
}
