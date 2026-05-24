import { NextRequest } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { updateListingSchema } from "@/lib/validations/listing.schema";
import { sanitizeObject } from "@/lib/sanitization/sanitize";
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

    const patch = updateListingSchema.parse(await req.json());
    const { images, attributes, ...scalars } = patch;

    if (images && images.length > 7) return fail("Maximum 7 photos", 422);

    // Update scalars, and replace images / attribute values when provided.
    await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.listing.update({
        where: { id: params.id },
        data: sanitizeObject(scalars as Record<string, unknown>),
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
              value: a.value,
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

/** DELETE — owner-only soft remove (status -> REMOVED). */
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireUser();
    const existing = await prisma.listing.findFirst({
      where: { id: params.id, userId: user.id },
      select: { id: true },
    });
    if (!existing) return fail("Listing not found", 404);

    await prisma.listing.update({ where: { id: params.id }, data: { status: "REMOVED" } });
    return ok({ id: params.id, removed: true });
  } catch (err) {
    return handleApiError(err);
  }
}
