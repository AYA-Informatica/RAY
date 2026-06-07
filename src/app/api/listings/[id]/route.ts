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
  let _step = "start";
  console.log("[PATCH listing] start id=", params.id);
  try {
    _step = "requireUser";
    const user = await requireUser();
    console.log("[PATCH listing] user ok:", user.id);

    _step = "findListing";
    const existing = await prisma.listing.findFirst({
      where: { id: params.id, userId: user.id },
      select: { id: true },
    });
    console.log("[PATCH listing] findFirst result:", existing ? "found" : "NOT FOUND (404)");
    if (!existing) return fail("Listing not found", 404);

    _step = "parseBody";
    const body = await req.json();
    console.log("[PATCH listing] body:", JSON.stringify(body));
    const patch = updateListingSchema.parse(body);
    const { images, attributes, ...scalars } = patch;
    console.log("[PATCH listing] scalars keys:", Object.keys(scalars));

    if (images && images.length > 7) return fail("Maximum 7 photos", 422);

    // For simple status changes, just update status directly
    if (Object.keys(scalars).length === 1 && scalars.status) {
      _step = "updateStatus";
      console.log("[PATCH listing] updateStatus via $executeRaw:", scalars.status);
      await prisma.$executeRaw`
        UPDATE "Listing" SET "status" = ${scalars.status as string}, "updatedAt" = NOW()
        WHERE "id" = ${params.id}
      `;
      console.log("[PATCH listing] updateStatus OK");
      return ok({ id: params.id });
    }

    // Update scalars, and replace images / attribute values when provided.
    _step = "fullUpdate";
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

    console.log("[PATCH listing] fullUpdate OK");
    return ok({ id: params.id });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[PATCH listing] ERROR at step=${_step}:`, msg);
    if (msg.includes("Unauthorized") || msg.includes("Forbidden") || msg.includes("suspended")) {
      return handleApiError(err);
    }
    return fail(`[${_step}] ${msg}`, 500, "DEBUG");
  }
}

/** DELETE — owner-only soft remove (status -> REMOVED).
 * Pass ?permanent=true query param to hard delete from database. */
export async function DELETE(req: NextRequest, { params }: Ctx) {
  console.log("[DELETE listing] start id=", params.id);
  try {
    const user = await requireUser();
    console.log("[DELETE listing] user ok:", user.id);
    const existing = await prisma.listing.findFirst({
      where: { id: params.id, userId: user.id },
      select: { id: true },
    });
    console.log("[DELETE listing] findFirst:", existing ? "found" : "NOT FOUND (404)");
    if (!existing) return fail("Listing not found", 404);

    const url = new URL(req.url);
    const permanent = url.searchParams.get("permanent") === "true";
    console.log("[DELETE listing] permanent=", permanent);

    if (permanent) {
      console.log("[DELETE listing] hard delete start");
      await prisma.$transaction([
        prisma.listingAttributeValue.deleteMany({ where: { listingId: params.id } }),
        prisma.listingImage.deleteMany({ where: { listingId: params.id } }),
        prisma.favorite.deleteMany({ where: { listingId: params.id } }),
        prisma.report.deleteMany({ where: { listingId: params.id } }),
        prisma.listing.delete({ where: { id: params.id }, select: { id: true } }),
      ]);
      console.log("[DELETE listing] hard delete OK");
      return ok({ id: params.id, deleted: true });
    }

    console.log("[DELETE listing] soft delete (REMOVED) via $executeRaw");
    await prisma.$executeRaw`
      UPDATE "Listing" SET "status" = 'REMOVED', "updatedAt" = NOW()
      WHERE "id" = ${params.id}
    `;
    console.log("[DELETE listing] soft delete OK");
    return ok({ id: params.id, removed: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[DELETE listing] ERROR:", msg);
    return handleApiError(err);
  }
}
