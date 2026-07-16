import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { updateProfileSchema } from "@/lib/validations/profile.schema";
import { sanitizeObject } from "@/lib/sanitization/sanitize";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { logger } from "@/lib/logger";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPublicUserProfile } from "@/services/users";

const AVATARS_BUCKET = "avatars";
const LISTINGS_BUCKET = "listings";

function storagePathFromUrl(bucket: string, url: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

function avatarPathFromUrl(url: string): string | null {
  return storagePathFromUrl(AVATARS_BUCKET, url);
}

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

/** GET /api/users/:id — public profile + active listing count. */
export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    logger.debug({ userId: id }, "[GET user] request received");
    const profile = await getPublicUserProfile(id);
    if (!profile) {
      logger.warn({ userId: id }, "[GET user] rejected: not found");
      return fail("User not found", 404);
    }
    logger.debug({ userId: id }, "[GET user] success");
    return ok(profile);
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
      select: { id: true, name: true, bio: true, avatarUrl: true, city: true, district: true, neighborhood: true, province: true },
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

/**
 * DELETE /api/users/:id — anonymize-in-place. Always: hard-deletes the
 * caller's own listings (cascades declared on Listing in schema.prisma take
 * care of images, attribute values, conversations + their messages, reports,
 * and favorites tied to those listings) plus their listing/avatar storage
 * objects, then scrubs PII on the User row and sets deletedAt.
 *
 * The User row itself is kept (not a literal DELETE) rather than reassigned
 * or cascaded, so it still satisfies the non-cascading FKs from
 * Message.sender / Conversation.buyer|seller / Report.reporter / AdminAction —
 * a deleted user's messages in someone else's conversation keep resolving to
 * a (now-anonymised) sender instead of a dangling reference, and the other
 * participant doesn't lose their thread. requireUser() rejects any session
 * where deletedAt is set, so the account can't be used again either way.
 *
 * ?permanent=true additionally revokes the Supabase Auth identity so the
 * account can never sign back in — irreversible, mirrors the same query
 * param on DELETE /api/listings/[id]. Mobile's default call omits this.
 */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const user = await requireUser();
    if (user.id !== id) {
      logger.warn({ userId: user.id, targetId: id }, "[DELETE user] rejected: forbidden");
      return fail("Forbidden", 403);
    }

    const permanent = new URL(req.url).searchParams.get("permanent") === "true";
    logger.debug({ userId: id, permanent }, "[DELETE user] request received");

    const [listings, current] = await Promise.all([
      prisma.listing.findMany({
        where: { userId: id },
        select: { images: { select: { url: true } } },
      }),
      prisma.user.findUnique({ where: { id }, select: { avatarUrl: true } }),
    ]);

    // Hard-delete the user's listings; DB-level cascades handle their children.
    await prisma.listing.deleteMany({ where: { userId: id } });

    const imagePaths = listings
      .flatMap((l) => l.images)
      .map((img) => storagePathFromUrl(LISTINGS_BUCKET, img.url))
      .filter((p): p is string => p !== null);
    if (imagePaths.length > 0) {
      const { error } = await createAdminClient().storage.from(LISTINGS_BUCKET).remove(imagePaths);
      if (error) logger.error({ err: error, userId: id }, "[DELETE user] listing image cleanup failed");
    }

    const avatarPath = current?.avatarUrl ? avatarPathFromUrl(current.avatarUrl) : null;
    if (avatarPath) {
      const { error } = await createAdminClient().storage.from(AVATARS_BUCKET).remove([avatarPath]);
      if (error) logger.error({ err: error, userId: id }, "[DELETE user] avatar cleanup failed");
    }

    await prisma.user.update({
      where: { id },
      data: {
        name: null,
        avatarUrl: null,
        bio: null,
        pushToken: null,
        email: `deleted-${id}@ray.invalid`,
        deletedAt: new Date(),
      },
      select: { id: true },
    });

    if (permanent) {
      const { error } = await createAdminClient().auth.admin.deleteUser(id);
      if (error) logger.error({ err: error, userId: id }, "[DELETE user] Auth identity revocation failed");
    }

    logger.info({ userId: id, permanent }, "[DELETE user] account deleted");
    return ok({ id, deleted: true, permanent });
  } catch (err) {
    logger.error({ err }, "[DELETE user] ERROR");
    return handleApiError(err);
  }
}
