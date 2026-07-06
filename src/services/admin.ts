import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/** Dashboard counts for the admin overview. */
export async function getAdminStats() {
  logger.debug({}, "[getAdminStats] called");
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const [users, listings, featured, flagged, openReports, newUsers] = await Promise.all([
    prisma.user.count(),
    prisma.listing.count({ where: { status: "ACTIVE" } }),
    prisma.listing.count({ where: { featured: true } }),
    prisma.listing.count({ where: { status: "FLAGGED" } }),
    prisma.report.count({ where: { resolved: false } }),
    prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
  ]);
  logger.debug({ users, listings, featured, flagged, openReports, newUsers }, "[getAdminStats] result");
  return { users, listings, featured, flagged, openReports, newUsers };
}

const MODERATION_PRIORITY: Record<string, number> = { FLAGGED: 0, REMOVED: 1, ACTIVE: 2, EXPIRED: 3, SOLD: 4 };

/** Recent listings for moderation (flagged first), with thumbnail + reports. */
export async function getModerationListings() {
  logger.debug({}, "[getModerationListings] called");
  const rows = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    select: {
      id: true,
      title: true,
      price: true,
      status: true,
      featured: true,
      city: true,
      createdAt: true,
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
  const sorted = rows.sort(
    (a, b) => (MODERATION_PRIORITY[a.status] ?? 5) - (MODERATION_PRIORITY[b.status] ?? 5),
  );
  logger.debug({ count: sorted.length }, "[getModerationListings] result");
  return sorted;
}

/** Open reports with their target listing. */
export async function getOpenReports() {
  logger.debug({}, "[getOpenReports] called");
  const reports = await prisma.report.findMany({
    where: { resolved: false },
    orderBy: { createdAt: "desc" },
    take: 500,
    include: {
      reporter: { select: { name: true, email: true } },
      listing: { select: { id: true, title: true, status: true } },
    },
  });
  logger.debug({ count: reports.length }, "[getOpenReports] result");
  return reports;
}

/** Category health stats — total listings, new this week, flagged count. */
export async function getCategoryHealth() {
  logger.debug({}, "[getCategoryHealth] called");
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      icon: true,
      _count: { select: { listings: true } },
    },
  });

  const weekCounts = await prisma.$queryRaw<
    { categoryId: string; week_count: bigint; flagged_count: bigint }[]
  >`
    SELECT
      "categoryId",
      COUNT(*) FILTER (WHERE "createdAt" >= ${oneWeekAgo}) AS week_count,
      COUNT(*) FILTER (WHERE status = 'FLAGGED') AS flagged_count
    FROM "Listing"
    GROUP BY "categoryId"
  `;

  const weekMap = Object.fromEntries(
    weekCounts.map((r) => [
      r.categoryId,
      { week: Number(r.week_count), flagged: Number(r.flagged_count) },
    ]),
  );

  const result = categories.map((c) => ({
    id: c.id,
    name: c.name,
    icon: c.icon ?? "📦",
    total: c._count.listings,
    week: weekMap[c.id]?.week ?? 0,
    flagged: weekMap[c.id]?.flagged ?? 0,
  }));
  logger.debug({ count: result.length }, "[getCategoryHealth] result");
  return result;
}

/** All users for management. */
export async function getManagedUsers() {
  logger.debug({}, "[getManagedUsers] called");
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
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
  logger.debug({ count: users.length }, "[getManagedUsers] result");
  return users;
}

/** District-level user and listing density for admin geographic view. */
export async function getGeographicStats() {
  logger.debug({}, "[getGeographicStats] called");
  const [usersByDistrict, listingsByDistrict, topNeighborhoods] = await Promise.all([
    prisma.$queryRaw<{ district: string; count: bigint }[]>`
      SELECT district, COUNT(*)::bigint AS count
      FROM "User"
      WHERE district IS NOT NULL AND district <> ''
      GROUP BY district
      ORDER BY count DESC
      LIMIT 20
    `,
    prisma.$queryRaw<{ district: string; count: bigint }[]>`
      SELECT district, COUNT(*)::bigint AS count
      FROM "Listing"
      WHERE status = 'ACTIVE' AND district IS NOT NULL AND district <> ''
      GROUP BY district
      ORDER BY count DESC
      LIMIT 20
    `,
    prisma.$queryRaw<{ neighborhood: string; district: string; count: bigint }[]>`
      SELECT neighborhood, district, COUNT(*)::bigint AS count
      FROM "Listing"
      WHERE status = 'ACTIVE'
        AND neighborhood IS NOT NULL AND neighborhood <> ''
      GROUP BY neighborhood, district
      ORDER BY count DESC
      LIMIT 15
    `,
  ]);

  const result = {
    usersByDistrict: usersByDistrict.map((r) => ({ district: r.district, count: Number(r.count) })),
    listingsByDistrict: listingsByDistrict.map((r) => ({ district: r.district, count: Number(r.count) })),
    topNeighborhoods: topNeighborhoods.map((r) => ({
      neighborhood: r.neighborhood,
      district: r.district,
      count: Number(r.count),
    })),
  };
  logger.debug(
    {
      districts: result.usersByDistrict.length,
      listingDistricts: result.listingsByDistrict.length,
      neighborhoods: result.topNeighborhoods.length,
    },
    "[getGeographicStats] result",
  );
  return result;
}

/** Week-over-week new users and listings for the last 12 weeks. */
export async function getGrowthStats() {
  logger.debug({}, "[getGrowthStats] called");
  const twelveWeeksAgo = new Date();
  twelveWeeksAgo.setDate(twelveWeeksAgo.getDate() - 84);

  const [userWeeks, listingWeeks] = await Promise.all([
    prisma.$queryRaw<{ week: Date; count: bigint }[]>`
      SELECT date_trunc('week', "createdAt") AS week, COUNT(*)::bigint AS count
      FROM "User"
      WHERE "createdAt" >= ${twelveWeeksAgo}
      GROUP BY week
      ORDER BY week
    `,
    prisma.$queryRaw<{ week: Date; count: bigint }[]>`
      SELECT date_trunc('week', "createdAt") AS week, COUNT(*)::bigint AS count
      FROM "Listing"
      WHERE "createdAt" >= ${twelveWeeksAgo}
      GROUP BY week
      ORDER BY week
    `,
  ]);

  const result = {
    userWeeks: userWeeks.map((r) => ({ week: r.week.toISOString().slice(0, 10), count: Number(r.count) })),
    listingWeeks: listingWeeks.map((r) => ({ week: r.week.toISOString().slice(0, 10), count: Number(r.count) })),
  };
  logger.debug({ userWeeks: result.userWeeks.length, listingWeeks: result.listingWeeks.length }, "[getGrowthStats] result");
  return result;
}

/** Platform engagement metrics. */
export async function getEngagementStats() {
  logger.debug({}, "[getEngagementStats] called");
  const [totalConversations, totalMessages, viewStats, listingsWithInquiries] = await Promise.all([
    prisma.conversation.count(),
    prisma.message.count(),
    prisma.listing.aggregate({
      where: { status: "ACTIVE" },
      _avg: { views: true },
      _sum: { views: true },
      _count: true,
    }),
    prisma.listing.count({
      where: {
        status: "ACTIVE",
        conversations: { some: {} },
      },
    }),
  ]);

  const totalActiveListings = viewStats._count;
  const listingsWithNoInquiries = totalActiveListings - listingsWithInquiries;
  const deadStockPct = totalActiveListings > 0
    ? Math.round((listingsWithNoInquiries / totalActiveListings) * 100)
    : 0;

  const result = {
    totalConversations,
    totalMessages,
    totalViews: viewStats._sum.views ?? 0,
    avgViewsPerListing: Math.round(viewStats._avg.views ?? 0),
    totalActiveListings,
    listingsWithInquiries,
    listingsWithNoInquiries,
    deadStockPct,
  };
  logger.debug(result, "[getEngagementStats] result");
  return result;
}
