import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

/**
 * Server-side query helpers for the Rwanda administrative hierarchy.
 * All functions hit the RwandaLocation reference table (13,922 villages).
 * Call these from Route Handlers or Server Components only — never from client code.
 */

export async function getRwandaProvinces(): Promise<string[]> {
  const rows = await prisma.rwandaLocation.findMany({
    select: { province: true },
    distinct: ["province"],
    orderBy: { province: "asc" },
  });
  logger.debug({ count: rows.length }, "[location/rwanda] getRwandaProvinces");
  return rows.map((r) => r.province);
}

export async function getRwandaDistricts(province?: string): Promise<string[]> {
  const rows = await prisma.rwandaLocation.findMany({
    where: province ? { province } : undefined,
    select: { district: true },
    distinct: ["district"],
    orderBy: { district: "asc" },
  });
  logger.debug({ province, count: rows.length }, "[location/rwanda] getRwandaDistricts");
  return rows.map((r) => r.district);
}

export async function getRwandaSectors(district: string): Promise<string[]> {
  const rows = await prisma.rwandaLocation.findMany({
    where: { district },
    select: { sector: true },
    distinct: ["sector"],
    orderBy: { sector: "asc" },
  });
  logger.debug({ district, count: rows.length }, "[location/rwanda] getRwandaSectors");
  return rows.map((r) => r.sector);
}

export async function getRwandaCells(district: string, sector: string): Promise<string[]> {
  const rows = await prisma.rwandaLocation.findMany({
    where: { district, sector },
    select: { cell: true },
    distinct: ["cell"],
    orderBy: { cell: "asc" },
  });
  logger.debug({ district, sector, count: rows.length }, "[location/rwanda] getRwandaCells");
  return rows.map((r) => r.cell);
}

export async function getRwandaVillages(
  district: string,
  sector: string,
  cell: string,
): Promise<string[]> {
  const rows = await prisma.rwandaLocation.findMany({
    where: { district, sector, cell },
    select: { village: true },
    orderBy: { village: "asc" },
  });
  logger.debug({ district, sector, cell, count: rows.length }, "[location/rwanda] getRwandaVillages");
  return rows.map((r) => r.village);
}

/** Resolve a free-text neighborhood string to a matching sector or cell name. */
export async function resolveNeighborhood(
  district: string,
  neighborhood: string,
): Promise<{ sector: string; cell: string } | null> {
  const normalized = neighborhood.trim().toLowerCase();

  const bySector = await prisma.rwandaLocation.findFirst({
    where: {
      district,
      sector: { equals: normalized, mode: "insensitive" },
    },
    select: { sector: true, cell: true },
  });
  if (bySector) {
    logger.debug({ district }, "[location/rwanda] resolveNeighborhood matched sector");
    return { sector: bySector.sector, cell: bySector.cell };
  }

  const byCell = await prisma.rwandaLocation.findFirst({
    where: {
      district,
      cell: { equals: normalized, mode: "insensitive" },
    },
    select: { sector: true, cell: true },
  });
  if (byCell) {
    logger.debug({ district }, "[location/rwanda] resolveNeighborhood matched cell");
    return { sector: byCell.sector, cell: byCell.cell };
  }

  logger.debug({ district }, "[location/rwanda] resolveNeighborhood no match");
  return null;
}
