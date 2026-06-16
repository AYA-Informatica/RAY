import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { requireStaff } from "@/lib/permissions/roles";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { z } from "zod";

async function logConfigAction(adminId: string, active: boolean, text: string) {
  const preview = text.slice(0, 60);
  await prisma.adminAction
    .create({
      data: {
        adminId,
        action: "update_announcement",
        targetType: "config",
        details: `active: ${active}, text: ${preview}`,
      },
    })
    .catch(() => null);
}

export const dynamic = "force-dynamic";

const DEFAULT = { active: false, text: "" };

const patchSchema = z.object({
  active: z.boolean(),
  text: z.string().max(280),
});

/** GET /api/admin/config — returns current announcement config. Staff only. */
export async function GET() {
  try {
    const user = await requireUser();
    requireStaff(user);
    const row = await prisma.siteConfig.findUnique({ where: { key: "announcement" } });
    const config = row ? (JSON.parse(row.value) as typeof DEFAULT) : DEFAULT;
    return ok(config);
  } catch (err) {
    return handleApiError(err);
  }
}

/** PATCH /api/admin/config — update announcement config. Staff only. */
export async function PATCH(req: NextRequest) {
  try {
    const user = await requireUser();
    requireStaff(user);
    const body = patchSchema.safeParse(await req.json());
    if (!body.success) return fail("Invalid body", 400);
    const { active, text } = body.data;
    await prisma.siteConfig.upsert({
      where: { key: "announcement" },
      update: { value: JSON.stringify({ active, text }) },
      create: { key: "announcement", value: JSON.stringify({ active, text }) },
    });
    await logConfigAction(user.id, active, text);
    return ok({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
