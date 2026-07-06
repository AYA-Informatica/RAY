import type { User } from "@prisma/client";
import { AuthError } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

export function isStaff(user: User): boolean {
  return user.role === "ADMIN" || user.role === "MODERATOR";
}

export function isAdmin(user: User): boolean {
  return user.role === "ADMIN";
}

/** Guard for moderator/admin-only server actions. */
export function requireStaff(user: User): User {
  if (!isStaff(user)) {
    logger.warn({ userId: user.id, role: user.role }, "[roles] requireStaff denied");
    throw new AuthError("Forbidden");
  }
  logger.debug({ userId: user.id, role: user.role }, "[roles] requireStaff allowed");
  return user;
}

export function requireAdmin(user: User): User {
  if (!isAdmin(user)) {
    logger.warn({ userId: user.id, role: user.role }, "[roles] requireAdmin denied");
    throw new AuthError("Forbidden");
  }
  logger.debug({ userId: user.id, role: user.role }, "[roles] requireAdmin allowed");
  return user;
}
