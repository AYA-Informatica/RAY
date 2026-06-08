import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { updateProfileSchema } from "@/lib/validations/profile.schema";
import { sanitizeObject } from "@/lib/sanitization/sanitize";
import { ok, fail, handleApiError } from "@/lib/utils/api";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

/** GET /api/users/:id — public profile + active listing count. */
export async function GET(_req: NextRequest, { params }: Ctx) {
  console.log("[GET user] id=", params.id);
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, avatarUrl: true, bio: true, city: true, createdAt: true },
    });
    if (!user) {
      console.warn("[GET user] not found id=", params.id);
      return fail("User not found", 404);
    }
    const listingsCount = await prisma.listing.count({
      where: { userId: params.id, status: "ACTIVE" },
    });
    console.log("[GET user] found uid=", params.id, "activeListings=", listingsCount);
    return ok({ ...user, listingsCount });
  } catch (err) {
    console.error("[GET user] ERROR:", err instanceof Error ? err.message : err);
    return handleApiError(err);
  }
}

/** PATCH /api/users/:id — update own profile only. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  console.log("[PATCH user] id=", params.id);
  try {
    const user = await requireUser();
    if (user.id !== params.id) {
      console.warn("[PATCH user] forbidden uid=", user.id, "target=", params.id);
      return fail("Forbidden", 403);
    }

    const patch = updateProfileSchema.parse(await req.json());
    console.log("[PATCH user] patch keys=", Object.keys(patch));
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: sanitizeObject(patch as Record<string, unknown>),
      select: { id: true, name: true, bio: true, avatarUrl: true, city: true, district: true },
    });
    console.log("[PATCH user] updated OK uid=", updated.id);
    return ok(updated);
  } catch (err) {
    console.error("[PATCH user] ERROR:", err instanceof Error ? err.message : err);
    return handleApiError(err);
  }
}
