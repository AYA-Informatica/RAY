import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { getSellerResponseTime } from "./chat";
import { isValidUuid } from "@/lib/utils/uuid";

export interface PublicUserProfile {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  city: string | null;
  district: string | null;
  province: string | null;
  createdAt: Date;
  lastSeenAt: Date;
  listingsCount: number;
  responseTimeMins?: number;
}

/** Public-safe seller profile, used by GET /api/users/[id] and /user/[id]. */
export async function getPublicUserProfile(id: string): Promise<PublicUserProfile | null> {
  logger.debug({ userId: id }, "[getPublicUserProfile] called");
  if (!isValidUuid(id)) {
    logger.debug({ userId: id }, "[getPublicUserProfile] not a valid UUID, skipping query");
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      avatarUrl: true,
      bio: true,
      city: true,
      district: true,
      province: true,
      createdAt: true,
      lastSeenAt: true,
      deletedAt: true,
    },
  });
  if (!user || user.deletedAt) {
    logger.debug({ userId: id }, "[getPublicUserProfile] not found or deleted");
    return null;
  }

  const [listingsCount, responseTimeMins] = await Promise.all([
    prisma.listing.count({ where: { userId: id, status: "ACTIVE" } }),
    getSellerResponseTime(id),
  ]);

  logger.debug({ userId: id, listingsCount }, "[getPublicUserProfile] result");
  const { deletedAt: _deletedAt, ...publicFields } = user;
  return { ...publicFields, listingsCount, responseTimeMins };
}
