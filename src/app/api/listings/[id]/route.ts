import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { updateListingSchema } from "@/lib/validations/listing.schema";
import { sanitizeText } from "@/lib/sanitization/sanitize";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { getListing } from "@/services/listings";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

const LISTINGS_BUCKET = "listings";

/** Extract the storage object path (e.g. "<userId>/<uuid>.webp") from a public Supabase URL. */
function storagePathFromUrl(url: string): string | null {
  const marker = `/object/public/${LISTINGS_BUCKET}/`;
  const idx = url.indexOf(marker);
  return idx === -1 ? null : url.slice(idx + marker.length);
}

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const listing = await getListing(id);
    if (!listing) return fail("Listing not found", 404);
    return ok(listing);
  } catch (err) {
    return handleApiError(err);
  }
}

/** PATCH — owner-only edit (strict UUID isolation). */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const user = await requireUser();

    const existing = await prisma.listing.findFirst({
      where: { id, userId: user.id },
      select: { id: true, expiresAt: true },
    });
    if (!existing) return fail("Listing not found", 404);

    const body = await req.json();
    const patch = updateListingSchema.parse(body);
    const { images, attributes, ...scalars } = patch;

    if (images && images.length > 7) return fail("Maximum 7 photos", 422);

    // For simple status changes, just update status directly
    if (Object.keys(scalars).length === 1 && scalars.status) {
      // Reactivating a listing whose 30-day window already lapsed needs a fresh expiresAt
      if (scalars.status === "ACTIVE" && existing.expiresAt < new Date()) {
        const newExpiresAt = new Date();
        newExpiresAt.setDate(newExpiresAt.getDate() + 30);
        await prisma.$executeRaw`
          UPDATE "Listing" SET "status" = ${scalars.status as string}::"ListingStatus", "expiresAt" = ${newExpiresAt}, "updatedAt" = NOW()
          WHERE "id" = ${id}
        `;
        return ok({ id });
      }
      await prisma.$executeRaw`
        UPDATE "Listing" SET "status" = ${scalars.status as string}::"ListingStatus", "updatedAt" = NOW()
        WHERE "id" = ${id}
      `;
      return ok({ id });
    }

    // Update scalars, and replace images / attribute values when provided.
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const safeScalars: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(scalars)) {
        if (typeof value === "string" && key !== "status") {
          safeScalars[key] = sanitizeText(value);
        } else {
          safeScalars[key] = value;
        }
      }
      await tx.listing.update({
        where: { id },
        data: safeScalars,
        select: { id: true },
      });
      if (images) {
        await tx.listingImage.deleteMany({ where: { listingId: id } });
        if (images.length > 0) {
          await tx.listingImage.createMany({
            data: images.map((url, order) => ({ listingId: id, url, order })),
          });
        }
      }
      if (attributes) {
        await tx.listingAttributeValue.deleteMany({ where: { listingId: id } });
        if (attributes.length > 0) {
          await tx.listingAttributeValue.createMany({
            data: attributes.map((a) => ({
              listingId: id,
              attributeId: a.attributeId,
              value: sanitizeText(a.value),
            })),
          });
        }
      }
    });

    return ok({ id });
  } catch (err) {
    logger.error({ err }, "[PATCH listing] ERROR");
    return handleApiError(err);
  }
}

/** DELETE — owner-only soft remove (status -> REMOVED).
 * Pass ?permanent=true query param to hard delete from database. */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const { id } = await params;
    const user = await requireUser();
    const existing = await prisma.listing.findFirst({
      where: { id, userId: user.id },
      select: { id: true, images: { select: { url: true } } },
    });
    if (!existing) return fail("Listing not found", 404);

    const url = new URL(req.url);
    const permanent = url.searchParams.get("permanent") === "true";

    if (permanent) {
      await prisma.$transaction([
        prisma.listingAttributeValue.deleteMany({ where: { listingId: id } }),
        prisma.listingImage.deleteMany({ where: { listingId: id } }),
        prisma.favorite.deleteMany({ where: { listingId: id } }),
        prisma.report.deleteMany({ where: { listingId: id } }),
        prisma.listing.delete({ where: { id }, select: { id: true } }),
      ]);

      const paths = existing.images.map((img) => storagePathFromUrl(img.url)).filter((p): p is string => p !== null);
      if (paths.length > 0) {
        const { error: storageError } = await createAdminClient().storage.from(LISTINGS_BUCKET).remove(paths);
        if (storageError) {
          logger.error({ err: storageError }, "[DELETE listing] storage cleanup failed");
        }
      }

      return ok({ id, deleted: true });
    }

    await prisma.$executeRaw`
      UPDATE "Listing" SET "status" = 'REMOVED', "updatedAt" = NOW()
      WHERE "id" = ${id}
    `;
    return ok({ id, removed: true });
  } catch (err) {
    logger.error({ err }, "[DELETE listing] ERROR");
    return handleApiError(err);
  }
}
