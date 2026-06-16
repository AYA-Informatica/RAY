import { prisma } from "@/lib/prisma";

/** Dashboard counts for the admin overview. */
export async function getAdminStats() {
  const [users, listings, flagged, openReports] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { status: "FLAGGED" } }),
    prisma.report.count({ where: { resolved: false } }),
  ]);
  return { users, listings, flagged, openReports };
}

const MODERATION_PRIORITY: Record<string, number> = { FLAGGED: 0, REMOVED: 1, ACTIVE: 2, EXPIRED: 3, SOLD: 4 };

/** Recent listings for moderation (flagged first), with thumbnail + reports. */
export async function getModerationListings() {
  const rows = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      user: { select: { id: true, name: true, email: true } },
      category: { select: { name: true } },
      images: { orderBy: { order: "asc" }, take: 1 },
      reports: {
        where: { resolved: false },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          reason: true,
          details: true,
          createdAt: true,
          reporter: { select: { name: true, email: true } },
        },
      },
      _count: { select: { reports: true } },
    },
  });
  return rows.sort(
    (a, b) => (MODERATION_PRIORITY[a.status] ?? 5) - (MODERATION_PRIORITY[b.status] ?? 5),
  );
}

/** Open reports with their target listing. */
export async function getOpenReports() {
  return prisma.report.findMany({
    where: { resolved: false },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      reporter: { select: { name: true, email: true } },
      listing: { select: { id: true, title: true, status: true } },
    },
  });
}

/** All users for management. */
export async function getManagedUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      role: true,
      isBanned: true,
      createdAt: true,
      _count: { select: { listings: true } },
    },
  });
}
