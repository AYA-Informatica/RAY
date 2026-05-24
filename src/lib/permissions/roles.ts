import type { User } from "@prisma/client";
import { AuthError } from "@/lib/auth/session";

export function isStaff(user: User): boolean {
  return user.role === "ADMIN" || user.role === "MODERATOR";
}

export function isAdmin(user: User): boolean {
  return user.role === "ADMIN";
}

/** Guard for moderator/admin-only server actions. */
export function requireStaff(user: User): User {
  if (!isStaff(user)) throw new AuthError("Forbidden");
  return user;
}

export function requireAdmin(user: User): User {
  if (!isAdmin(user)) throw new AuthError("Forbidden");
  return user;
}
