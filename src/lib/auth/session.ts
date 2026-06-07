import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import type { User } from "@prisma/client";

/** Returns the Supabase auth user or null. Never throws. */
export async function getAuthUser() {
  const supabase = createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) console.error("[session] getAuthUser error:", error.message);
  console.log("[session] getAuthUser:", user ? `uid=${user.id}` : "null");
  return user;
}

/** Returns the full public.User row, or null if unauthenticated. */
export async function getCurrentUser(): Promise<User | null> {
  const authUser = await getAuthUser();
  if (!authUser) return null;
  console.log("[session] getCurrentUser: looking up prisma User for", authUser.id);
  try {
    const user = await prisma.user.findUnique({ where: { id: authUser.id } });
    console.log("[session] getCurrentUser: found=", !!user, user ? `email=${user.email}` : "");
    return user;
  } catch (err) {
    console.error("[session] getCurrentUser prisma error:", err instanceof Error ? err.message : err);
    throw err;
  }
}

/** Throws "Unauthorized" if no session — use to guard protected API routes. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new AuthError("Unauthorized");
  if (user.isBanned) throw new AuthError("Account suspended");
  console.log("[session] requireUser OK: uid=", user.id);
  return user;
}

export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}
