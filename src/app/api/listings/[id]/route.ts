import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { updateListingSchema } from "@/lib/validations/listing.schema";
import { sanitizeText } from "@/lib/sanitization/sanitize";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { getListing } from "@/services/listings";

type Ctx = { params: { id: string } };

export async function GET(_req: NextRequest, { params }: Ctx) {
  try {
    const listing = await getListing(params.id);
    if (!listing) return fail("Listing not found", 404);
    return ok(listing);
  } catch (err) {
    return handleApiError(err);
  }
}

/** PATCH — owner-only edit (strict UUID isolation). */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireUser();
    const existing = await prisma.listing.findFirst({
      where: { id: params.id, userId: user.id },
      select: { id: true },
    });
    if (!existing) return fail("Listing not found", 404);

    const body = await req.json();
    const patch = updateListingSchema.parse(body);
    const { images, attributes, ...scalars } = patch;

    if (images && images.length > 7) return fail("Maximum 7 photos", 422);

    // For simple status changes, just update status directly
    if (Object.keys(scalars).length === 1 && scalars.status) {
      await prisma.listing.update({
        where: { id: params.id },
        data: { status: scalars.status },
        select: { id: true },
      });
      return ok({ id: params.id });
    }

    // Update scalars, and replace images / attribute values when provided.
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Only sanitize text fields, not status enum
      const safeScalars: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(scalars)) {
        if (typeof value === "string" && key !== "status") {
          safeScalars[key] = sanitizeText(value);
        } else {
          safeScalars[key] = value;
        }
      }
      
      await tx.listing.update({
        where: { id: params.id },
        data: safeScalars,
        select: { id: true },
      });

      if (images) {
        await tx.listingImage.deleteMany({ where: { listingId: params.id } });
        if (images.length > 0) {
          await tx.listingImage.createMany({
            data: images.map((url, order) => ({ listingId: params.id, url, order })),
          });
        }
      }

      if (attributes) {
        await tx.listingAttributeValue.deleteMany({ where: { listingId: params.id } });
        if (attributes.length > 0) {
          await tx.listingAttributeValue.createMany({
            data: attributes.map((a) => ({
              listingId: params.id,
              attributeId: a.attributeId,
              value: sanitizeText(a.value),
            })),
          });
        }
      }
    });

    return ok({ id: params.id });
  } catch (err) {
    return handleApiError(err);
  }
}

/** DELETE — owner-only soft remove (status -> REMOVED).
 * Pass ?permanent=true query param to hard delete from database. */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireUser();
    const existing = await prisma.listing.findFirst({
      where: { id: params.id, userId: user.id },
      select: { id: true },
    });
    if (!existing) return fail("Listing not found", 404);

    const url = new URL(req.url);
    const permanent = url.searchParams.get("permanent") === "true";

    if (permanent) {
      // Hard delete - remove from database entirely
      await prisma.$transaction([
        prisma.listingAttributeValue.deleteMany({ where: { listingId: params.id } }),
        prisma.listingImage.deleteMany({ where: { listingId: params.id } }),
        prisma.favorite.deleteMany({ where: { listingId: params.id } }),
        prisma.report.deleteMany({ where: { listingId: params.id } }),
        prisma.listing.delete({ where: { id: params.id } }),
      ]);
      return ok({ id: params.id, deleted: true });
    }

    // Soft delete - set status to REMOVED (can be reposted later)
    await prisma.listing.update({ where: { id: params.id }, data: { status: "REMOVED" } });
    return ok({ id: params.id, removed: true });
  } catch (err) {
    return handleApiError(err);
  }
}
