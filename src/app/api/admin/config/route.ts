import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth/session";
import { requireStaff } from "@/lib/permissions/roles";
import { ok, fail, handleApiError } from "@/lib/utils/api";
import { z } from "zod";
import { logger } from "@/lib/logger";

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
    logger.debug({ userId: user.id }, "[GET admin/config] request received");
    const row = await prisma.siteConfig.findUnique({ where: { key: "announcement" } });
    const config = row ? (JSON.parse(row.value) as typeof DEFAULT) : DEFAULT;
    logger.debug({ active: config.active }, "[GET admin/config] success");
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
    if (!body.success) {
      logger.warn({ userId: user.id }, "[PATCH admin/config] rejected: invalid body");
      return fail("Invalid body", 400);
    }
    const { active, text } = body.data;
    logger.debug({ userId: user.id, active }, "[PATCH admin/config] request received");
    await prisma.siteConfig.upsert({
      where: { key: "announcement" },
      update: { value: JSON.stringify({ active, text }) },
      create: { key: "announcement", value: JSON.stringify({ active, text }) },
    });
    await logConfigAction(user.id, active, text);
    logger.info({ userId: user.id, active }, "[PATCH admin/config] success");
    return ok({ ok: true });
  } catch (err) {
    return handleApiError(err);
  }
}
