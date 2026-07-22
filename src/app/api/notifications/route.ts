import { getAuthUser } from "@/lib/auth/session";
import { getNotifications, markNotificationsRead } from "@/services/notifications";
import { ok, fail } from "@/lib/utils/api";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

/** GET /api/notifications — fetch the current user's 30 most recent notifications. */
export async function GET() {
  const authUser = await getAuthUser();
  if (!authUser) return fail("Unauthorized", 401);
  logger.debug({ userId: authUser.id }, "[GET notifications] request");
  const notifications = await getNotifications(authUser.id);
  return ok(notifications);
}

/** POST /api/notifications — mark all notifications read. */
export async function POST() {
  const authUser = await getAuthUser();
  if (!authUser) return fail("Unauthorized", 401);
  logger.debug({ userId: authUser.id }, "[POST notifications] mark-read request");
  await markNotificationsRead(authUser.id);
  return ok({ ok: true });
}
