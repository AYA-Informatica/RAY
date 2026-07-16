const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Every id-keyed table in this schema (User, Listing, ...) uses a Postgres
 * `uuid` column. Querying one with a non-UUID string throws a raw Prisma
 * P2023 type-cast error instead of returning "not found" -- callers on
 * public routes (arbitrary URL params) should check this first and treat
 * a non-UUID id as "not found" rather than let the query throw.
 */
export function isValidUuid(id: string): boolean {
  return UUID_RE.test(id);
}
