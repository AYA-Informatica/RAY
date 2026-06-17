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
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, avatarUrl: true, bio: true, city: true, createdAt: true },
    });
    if (!user) return fail("User not found", 404);
    const listingsCount = await prisma.listing.count({
      where: { userId: params.id, status: "ACTIVE" },
    });
    return ok({ ...user, listingsCount });
  } catch (err) {
    console.error("[GET user] ERROR:", err instanceof Error ? err.message : err);
    return handleApiError(err);
  }
}

/** PATCH /api/users/:id — update own profile only. */
export async function PATCH(req: NextRequest, { params }: Ctx) {
  try {
    const user = await requireUser();
    if (user.id !== params.id) return fail("Forbidden", 403);

    const patch = updateProfileSchema.parse(await req.json());

    const { avatarUrl, ...textFields } = patch;
    const data = {
      ...sanitizeObject(textFields as Record<string, unknown>),
      ...(avatarUrl !== undefined ? { avatarUrl } : {}),
    };

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
      select: { id: true, name: true, bio: true, avatarUrl: true, city: true, district: true },
    });
    return ok(updated);
  } catch (err) {
    console.error("[PATCH user] ERROR:", err instanceof Error ? err.message : err);
    return handleApiError(err);
  }
}
