import { PrismaClient } from "@prisma/client";
import { logger } from "@/lib/logger";

/** Singleton Prisma client. Prevents exhausting DB connections during dev HMR. */
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const reused = Boolean(globalForPrisma.prisma);
logger.debug({ reused }, "[prisma] client resolved");

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

// Cache the instance in dev to survive HMR hot-reloads.
// In production (Vercel serverless) each function invocation gets its own process,
// so caching is not needed and connections are managed by Prisma's pool automatically.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
