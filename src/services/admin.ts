import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

// Fix 16: single cached DB call shared by layout nav badge + overview card per render.
export const getOpenReportCount = cache(() =>
  prisma.report.count({ where: { resolved: false } }),
);

/** Dashboard counts for the admin overview. */
export async function getAdminStats() {
  logger.debug({}, "[getAdminStats] called");
  const now = new Date();
  const oneWeekAgo = new Date(now);
  oneWeekAgo.setDate(now.getDate() - 7);
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(now.getDate() - 30);

  const [users, listings, featured, flagged, openReports, newUsers, bannedUsers, mau] =
    await Promise.all([
      prisma.user.count(),
      prisma.listing.count({ where: { status: "ACTIVE" } }),
      // Fix 5: only count active featured listings — removed/expired still carry the flag.
      prisma.listing.count({ where: { featured: true, status: "ACTIVE" } }),
      prisma.listing.count({ where: { status: "FLAGGED" } }),
      getOpenReportCount(), // Fix 16
      prisma.user.count({ where: { createdAt: { gte: oneWeekAgo } } }),
      // Fix 10: expose banned-user count directly.
      prisma.user.count({ where: { isBanned: true } }),
      // Fix 9: Monthly Active Users via lastSeenAt (non-banned only).
      prisma.user.count({ where: { lastSeenAt: { gte: thirtyDaysAgo }, isBanned: false } }),
    ]);

  logger.debug(
    { users, listings, featured, flagged, openReports, newUsers, bannedUsers, mau },
    "[getAdminStats] result",
  );
  return { users, listings, featured, flagged, openReports, newUsers, bannedUsers, mau };
}

const listingModerationSelect = {
  id: true,
  title: true,
  price: true,
  status: true,
  featured: true,
  city: true,
  district: true, // Fix 15: include district so search can filter by it.
  createdAt: true,
  user: { select: { id: true, name: true, email: true } },
  category: { select: { name: true } },
  images: { orderBy: { order: "asc" as const }, take: 1 },
  reports: {
    where: { resolved: false },
    orderBy: { createdAt: "desc" as const },
    select: {
      id: true,
      reason: true,
      details: true,
      createdAt: true,
      reporter: { select: { name: true, email: true } },
    },
  },
  // Fix 1: badge must count only open reports, not all-time reports.
  _count: { select: { reports: { where: { resolved: false } } } },
} as const;

/**
 * Fix 2: fetch ALL flagged listings first (no cap), then 200 most-recent others.
 * Previously took 500 by createdAt then sorted in memory — flagged listings older
 * than record 500 were silently absent from the moderation queue.
 */
export async function getModerationListings() {
  logger.debug({}, "[getModerationListings] called");

  const [flaggedListings, recentListings] = await Promise.all([
    prisma.listing.findMany({
      where: { status: "FLAGGED" },
      orderBy: { createdAt: "desc" },
      select: listingModerationSelect,
    }),
    prisma.listing.findMany({
      where: { status: { not: "FLAGGED" } },
      orderBy: { createdAt: "desc" },
      take: 200,
      select: listingModerationSelect,
    }),
  ]);

  const result = [...flaggedListings, ...recentListings];
  logger.debug(
    { flagged: flaggedListings.length, recent: recentListings.length },
    "[getModerationListings] result",
  );
  return result;
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

/** Category health stats — active listings, new this week (non-removed), flagged count. */
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
      // Fix 6: count only ACTIVE listings — dead inventory inflated the "Total" column.
      _count: { select: { listings: { where: { status: "ACTIVE" } } } },
    },
  });

  const weekCounts = await prisma.$queryRaw<
    { categoryId: string; week_count: bigint; flagged_count: bigint }[]
  >`
    SELECT
      "categoryId",
      -- Fix 6/7: exclude REMOVED listings so spam/rejected posts don't
      -- inflate "This week" — only count inventory that reached buyers.
      COUNT(*) FILTER (
        WHERE "createdAt" >= ${oneWeekAgo} AND status <> 'REMOVED'
      ) AS week_count,
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

/** All users for management (active listing count only). */
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
      // Fix 10 (users page): show active listings only so banned spammers with
      // 30 removed posts look identical to power sellers.
      _count: { select: { listings: { where: { status: "ACTIVE" } } } },
    },
  });
  logger.debug({ count: users.length }, "[getManagedUsers] result");
  return users;
}

/** District-level user and listing density for admin geographic view. */
export async function getGeographicStats() {
  logger.debug({}, "[getGeographicStats] called");
  const [usersByDistrict, listingsByDistrict, topNeighborhoods] = await Promise.all([
    // Fix 8: exclude banned users — they skewed the user-density chart and made
    // it incomparable to the listing chart (which already excluded flagged listings).
    prisma.$queryRaw<{ district: string; count: bigint }[]>`
      SELECT district, COUNT(*)::bigint AS count
      FROM "User"
      WHERE district IS NOT NULL AND district <> ''
        AND "isBanned" = false
      GROUP BY district
      ORDER BY count DESC
      LIMIT 30
    `,
    prisma.$queryRaw<{ district: string; count: bigint }[]>`
      SELECT district, COUNT(*)::bigint AS count
      FROM "Listing"
      WHERE status = 'ACTIVE' AND district IS NOT NULL AND district <> ''
      GROUP BY district
      ORDER BY count DESC
      LIMIT 30
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

/** Week-over-week new users and non-removed listings for the last 12 weeks. */
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
    // Fix 7: exclude REMOVED listings so a spam wave or moderation purge doesn't
    // inflate the growth chart and mislead trend analysis.
    prisma.$queryRaw<{ week: Date; count: bigint }[]>`
      SELECT date_trunc('week', "createdAt") AS week, COUNT(*)::bigint AS count
      FROM "Listing"
      WHERE "createdAt" >= ${twelveWeeksAgo}
        AND status <> 'REMOVED'
      GROUP BY week
      ORDER BY week
    `,
  ]);

  const result = {
    userWeeks: userWeeks.map((r) => ({ week: r.week.toISOString().slice(0, 10), count: Number(r.count) })),
    listingWeeks: listingWeeks.map((r) => ({ week: r.week.toISOString().slice(0, 10), count: Number(r.count) })),
  };
  logger.debug(
    { userWeeks: result.userWeeks.length, listingWeeks: result.listingWeeks.length },
    "[getGrowthStats] result",
  );
  return result;
}

/** Platform engagement metrics. */
export async function getEngagementStats() {
  logger.debug({}, "[getEngagementStats] called");
  const [totalConversations, totalMessages, viewStats, listingsWithInquiries] = await Promise.all([
    // Active conversations only (exclude both-sides-hidden / soft-deleted threads).
    prisma.conversation.count({
      where: {
        OR: [{ buyerHiddenAt: null }, { sellerHiddenAt: null }],
      },
    }),
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
  const deadStockPct =
    totalActiveListings > 0
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
