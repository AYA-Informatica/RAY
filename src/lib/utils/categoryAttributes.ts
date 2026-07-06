import { logger } from "@/lib/logger";

/**
 * CategoryAttribute.options is a Json column. For plain SELECT attributes it's
 * a flat string array (e.g. ["Laptop", "TV", ...]). For attributes that should
 * only appear when another attribute (e.g. "Type") has a particular value, it's
 * an object: { values?: string[], showIf: { key, in } }.
 */
export type ShowIf = { key: string; in: string[] };

export function parseAttributeOptions(raw: unknown): { values: string[]; showIf?: ShowIf } {
  if (Array.isArray(raw)) return { values: raw as string[] };
  if (raw && typeof raw === "object") {
    const o = raw as { values?: string[]; showIf?: ShowIf };
    return { values: o.values ?? [], showIf: o.showIf };
  }
  logger.debug("[categoryAttributes] parseAttributeOptions received unexpected shape, defaulting to empty");
  return { values: [] };
}

/** Whether `attr` should be shown given the currently-selected value of the
 *  attribute it depends on (if any). `values` is keyed by attribute id.
 *  `showIf` may be provided directly on `attr`, or embedded in `attr.options`
 *  (the shape stored in the DB for category attribute schemas). */
export function isAttributeVisible<A extends { id: string; key: string; options?: unknown; showIf?: ShowIf }>(
  attr: A,
  allAttrs: A[],
  values: Record<string, string>,
): boolean {
  const showIf = attr.showIf ?? parseAttributeOptions(attr.options).showIf;
  if (!showIf) return true;
  const dependsOn = allAttrs.find((a) => a.key === showIf.key);
  if (!dependsOn) return true;
  const current = values[dependsOn.id];
  const visible = current != null && showIf.in.includes(current);
  logger.debug(
    { attrId: attr.id, dependsOnKey: showIf.key, visible },
    "[categoryAttributes] isAttributeVisible evaluated",
  );
  return visible;
}
