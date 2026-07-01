/**
 * Multilingual search query expansion.
 *
 * The DB stores all listing data in English. When a user types in Kinyarwanda
 * or French, the raw string won't match anything. This module expands the query
 * with English equivalents so searches like "inzu" or "voiture" still return
 * the right results.
 *
 * Two layers:
 *  1. MANUAL_ALIASES — curated map of common RW/FR everyday terms → category
 *     slugs and/or English keywords. Covers the words that matter most.
 *  2. CATEGORY_I18N_MAP — auto-built from dictionaries.ts so every translated
 *     category name (full or partial match) maps back to its slug. No manual
 *     maintenance needed when categories are added.
 */

import { dictionaries } from "@/i18n/dictionaries";

export interface SearchExpansion {
  /** Category slugs to OR-include in the query. */
  categorySlugs: string[];
  /** Extra English keywords to OR against title + description. */
  extraTerms: string[];
}

/** Convert camelCase i18n key suffix → hyphen slug. */
function camelToSlug(camel: string): string {
  return camel.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
}

/**
 * Built once at module load: every localized category name (in all 3 locales)
 * → its DB slug. Enables "Imodoka" or "Voitures" to resolve to "cars".
 */
const CATEGORY_I18N_MAP = new Map<string, string>();
for (const dict of Object.values(dictionaries)) {
  for (const [key, value] of Object.entries(dict)) {
    if (!key.startsWith("category.")) continue;
    const slug = camelToSlug(key.replace("category.", ""));
    CATEGORY_I18N_MAP.set(value.toLowerCase(), slug);
  }
}

/**
 * Curated aliases for everyday terms that don't match a full category name.
 * Keep entries for the top search intents in RW and FR.
 */
/**
 * Multi-word phrase aliases checked before word-by-word splitting.
 * Kinyarwanda often expresses a single concept as a compound phrase
 * (e.g. "igare rya moteri" = motorcycle, "inzu yo gutunga" = house for rent).
 * Matching the full phrase first avoids ambiguity from individual tokens.
 */
const PHRASE_ALIASES: Record<string, SearchExpansion> = {
  // ── Kinyarwanda compound phrases ─────────────────────────────────────────
  "igare rya moteri":       { categorySlugs: ["bikes"],                    extraTerms: ["motorcycle", "motorbike"] },
  "igare rya motorsikeli":  { categorySlugs: ["bikes"],                    extraTerms: ["motorcycle", "motorbike"] },
  "inzu yo gutunga":        { categorySlugs: ["residential-rentals"],      extraTerms: ["house", "rent", "rental", "apartment"] },
  "amazu yo gutunga":       { categorySlugs: ["residential-rentals"],      extraTerms: ["house", "rent", "rental", "apartment"] },
  "inzu yo kugurisha":      { categorySlugs: ["residential-rentals"],      extraTerms: ["house", "sale", "home"] },
  "imodoka yo kugurisha":   { categorySlugs: ["cars"],                     extraTerms: ["car", "sale", "vehicle"] },
  "imodoka yo gutunga":     { categorySlugs: ["cars"],                     extraTerms: ["car", "rent", "vehicle"] },
  "telefone nshya":         { categorySlugs: ["phones"],                   extraTerms: ["phone", "new", "smartphone"] },
  "akazi kato":             { categorySlugs: ["jobs"],                     extraTerms: ["job", "part-time", "work"] },
  "ibikoresho bya gikoni":  { categorySlugs: ["kitchen"],                  extraTerms: ["kitchen", "appliance"] },
  // ── French compound phrases ───────────────────────────────────────────────
  "à louer":                { categorySlugs: ["residential-rentals", "commercial-spaces", "cars"], extraTerms: ["rent", "rental"] },
  "à vendre":               { categorySlugs: [],                           extraTerms: ["sale", "sell", "selling"] },
  "maison à louer":         { categorySlugs: ["residential-rentals"],      extraTerms: ["house", "rent"] },
  "appartement à louer":    { categorySlugs: ["residential-rentals"],      extraTerms: ["apartment", "flat", "rent"] },
  "voiture à vendre":       { categorySlugs: ["cars"],                     extraTerms: ["car", "sale", "vehicle"] },
  "vélo à vendre":          { categorySlugs: ["bikes"],                    extraTerms: ["bike", "bicycle", "sale"] },
  "offre d'emploi":         { categorySlugs: ["jobs"],                     extraTerms: ["job", "work", "employment"] },
};

/**
 * Single-word aliases — each key maps to category slugs and English keywords.
 */
const MANUAL_ALIASES: Record<string, SearchExpansion> = {
  // ── Kinyarwanda ──────────────────────────────────────────────────────────
  inzu:         { categorySlugs: ["residential-rentals", "commercial-spaces"], extraTerms: ["house", "home", "apartment", "room", "studio"] },
  amazu:        { categorySlugs: ["residential-rentals"],                      extraTerms: ["house", "home", "apartment"] },
  gutunga:      { categorySlugs: [],                                           extraTerms: ["rent", "rental"] },
  kugurisha:    { categorySlugs: [],                                           extraTerms: ["sale", "sell"] },
  imodoka:      { categorySlugs: ["cars"],                                     extraTerms: ["car", "vehicle"] },
  motosikal:    { categorySlugs: ["bikes"],                                    extraTerms: ["motorcycle", "motorbike"] },
  motorsikeli:  { categorySlugs: ["bikes"],                                    extraTerms: ["motorcycle", "motorbike"] },
  igare:        { categorySlugs: ["bikes"],                                    extraTerms: ["bike", "bicycle", "motorcycle"] },
  moteri:       { categorySlugs: ["bikes"],                                    extraTerms: ["motorcycle", "motorbike", "engine"] },
  igisiga:      { categorySlugs: ["bikes"],                                    extraTerms: ["bike", "bicycle"] },
  ibisiga:      { categorySlugs: ["bikes"],                                    extraTerms: ["bike", "bicycle"] },
  imyambaro:    { categorySlugs: ["fashion"],                                  extraTerms: ["clothes", "clothing"] },
  akazi:        { categorySlugs: ["jobs"],                                     extraTerms: ["job", "work", "employment"] },
  serivisi:     { categorySlugs: ["services"],                                 extraTerms: ["service"] },
  imbago:       { categorySlugs: ["furniture"],                                extraTerms: ["furniture"] },
  telefone:     { categorySlugs: ["phones"],                                   extraTerms: ["phone", "smartphone"] },
  igikoni:      { categorySlugs: ["kitchen"],                                  extraTerms: ["kitchen", "appliance"] },
  ibyubwiza:    { categorySlugs: ["beauty"],                                   extraTerms: ["beauty", "care"] },
  abana:        { categorySlugs: ["kids"],                                     extraTerms: ["kids", "baby", "children", "toys"] },
  imashini:     { categorySlugs: ["machinery"],                                extraTerms: ["machine", "machinery", "equipment"] },
  elekitoronike:{ categorySlugs: ["electronics"],                             extraTerms: ["electronics", "laptop", "tv"] },
  ubucuruzi:    { categorySlugs: ["commercial-spaces"],                        extraTerms: ["office", "commercial", "business"] },
  inyubako:     { categorySlugs: ["construction"],                             extraTerms: ["construction", "building", "materials"] },

  // ── French ───────────────────────────────────────────────────────────────
  maison:       { categorySlugs: ["residential-rentals"],  extraTerms: ["house", "home", "apartment"] },
  appartement:  { categorySlugs: ["residential-rentals"],  extraTerms: ["apartment", "flat"] },
  louer:        { categorySlugs: [],                        extraTerms: ["rent", "rental"] },
  location:     { categorySlugs: ["residential-rentals", "commercial-spaces"], extraTerms: ["rent", "rental"] },
  vendre:       { categorySlugs: [],                        extraTerms: ["sale", "sell"] },
  voiture:      { categorySlugs: ["cars"],                  extraTerms: ["car", "vehicle"] },
  vélo:         { categorySlugs: ["bikes"],                 extraTerms: ["bike", "bicycle"] },
  velo:         { categorySlugs: ["bikes"],                 extraTerms: ["bike", "bicycle"] },
  moto:         { categorySlugs: ["bikes"],                 extraTerms: ["motorcycle", "motorbike"] },
  vêtements:    { categorySlugs: ["fashion"],               extraTerms: ["clothes", "clothing"] },
  vetements:    { categorySlugs: ["fashion"],               extraTerms: ["clothes", "clothing"] },
  emploi:       { categorySlugs: ["jobs"],                  extraTerms: ["job", "work"] },
  meuble:       { categorySlugs: ["furniture"],             extraTerms: ["furniture"] },
  téléphone:    { categorySlugs: ["phones"],                extraTerms: ["phone", "smartphone"] },
  telephone:    { categorySlugs: ["phones"],                extraTerms: ["phone", "smartphone"] },
  cuisine:      { categorySlugs: ["kitchen"],               extraTerms: ["kitchen", "appliance"] },
  beauté:       { categorySlugs: ["beauty"],                extraTerms: ["beauty", "care"] },
  beaute:       { categorySlugs: ["beauty"],                extraTerms: ["beauty", "care"] },
  enfant:       { categorySlugs: ["kids"],                  extraTerms: ["kids", "baby", "children"] },
  bureau:       { categorySlugs: ["commercial-spaces"],     extraTerms: ["office", "commercial"] },
};

/**
 * Given the raw search query, return extra category slugs and English keywords
 * to include in the OR clause. Returns empty arrays when the query is already
 * English or not in the alias table.
 */
function mergeExpansion(into: SearchExpansion, from: SearchExpansion) {
  for (const slug of from.categorySlugs) {
    if (!into.categorySlugs.includes(slug)) into.categorySlugs.push(slug);
  }
  for (const term of from.extraTerms) {
    if (!into.extraTerms.includes(term)) into.extraTerms.push(term);
  }
}

function applyNgrams(words: string[], into: SearchExpansion) {
  for (let i = 0; i < words.length; i++) {
    const bigram = words.slice(i, i + 2).join(" ");
    if (PHRASE_ALIASES[bigram]) mergeExpansion(into, PHRASE_ALIASES[bigram]);
    const trigram = words.slice(i, i + 3).join(" ");
    if (PHRASE_ALIASES[trigram]) mergeExpansion(into, PHRASE_ALIASES[trigram]);
  }
}

function applyCategoryMap(word: string, into: SearchExpansion) {
  for (const [name, slug] of CATEGORY_I18N_MAP.entries()) {
    if (name.includes(word) || word.includes(name)) {
      if (!into.categorySlugs.includes(slug)) into.categorySlugs.push(slug);
    }
  }
}

export function expandSearchQuery(query: string): SearchExpansion {
  const result: SearchExpansion = { categorySlugs: [], extraTerms: [] };
  if (!query || query.trim().length < 2) return result;

  const normalized = query.toLowerCase().trim();
  const words = normalized.split(/\s+/);

  // Full phrase match first — catches compound concepts like "igare rya moteri"
  if (PHRASE_ALIASES[normalized]) mergeExpansion(result, PHRASE_ALIASES[normalized]);

  // Sliding 2- and 3-word windows — catches phrases embedded in longer sentences
  if (words.length > 1) applyNgrams(words, result);

  // Word-by-word lookup
  for (const word of words) {
    if (word.length < 2) continue;
    if (MANUAL_ALIASES[word]) mergeExpansion(result, MANUAL_ALIASES[word]);
    if (word.length >= 3) applyCategoryMap(word, result);
  }

  return result;
}
