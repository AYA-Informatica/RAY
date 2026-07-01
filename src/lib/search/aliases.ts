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
const MANUAL_ALIASES: Record<string, Omit<SearchExpansion, never>> = {
  // ── Kinyarwanda ──────────────────────────────────────────────────────────
  inzu:       { categorySlugs: ["residential-rentals", "commercial-spaces"], extraTerms: ["house", "home", "apartment", "room", "studio"] },
  amazu:      { categorySlugs: ["residential-rentals"],                      extraTerms: ["house", "home", "apartment"] },
  gutunga:    { categorySlugs: [],                                           extraTerms: ["rent", "rental"] },
  kugurisha:  { categorySlugs: [],                                           extraTerms: ["sale", "sell"] },
  imodoka:    { categorySlugs: ["cars"],                                     extraTerms: ["car", "vehicle"] },
  motosikal:  { categorySlugs: ["bikes"],                                    extraTerms: ["motorcycle", "motorbike"] },
  igisiga:    { categorySlugs: ["bikes"],                                    extraTerms: ["bike", "bicycle"] },
  ibisiga:    { categorySlugs: ["bikes"],                                    extraTerms: ["bike", "bicycle"] },
  imyambaro:  { categorySlugs: ["fashion"],                                  extraTerms: ["clothes", "clothing"] },
  akazi:      { categorySlugs: ["jobs"],                                     extraTerms: ["job", "work", "employment"] },
  serivisi:   { categorySlugs: ["services"],                                 extraTerms: ["service"] },
  imbago:     { categorySlugs: ["furniture"],                                extraTerms: ["furniture"] },
  telefone:   { categorySlugs: ["phones"],                                   extraTerms: ["phone", "smartphone"] },
  igikoni:     { categorySlugs: ["kitchen"],                                  extraTerms: ["kitchen", "appliance"] },
  ibyubwiza:  { categorySlugs: ["beauty"],                                   extraTerms: ["beauty", "care"] },
  abana:      { categorySlugs: ["kids"],                                     extraTerms: ["kids", "baby", "children", "toys"] },
  imashini:   { categorySlugs: ["machinery"],                                extraTerms: ["machine", "machinery", "equipment"] },
  elekitoronike: { categorySlugs: ["electronics"],                         extraTerms: ["electronics", "laptop", "tv"] },

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
export function expandSearchQuery(query: string): SearchExpansion {
  const result: SearchExpansion = { categorySlugs: [], extraTerms: [] };
  if (!query || query.trim().length < 2) return result;

  const addSlug = (slug: string) => {
    if (slug && !result.categorySlugs.includes(slug)) result.categorySlugs.push(slug);
  };
  const addTerm = (term: string) => {
    if (term && !result.extraTerms.includes(term)) result.extraTerms.push(term);
  };

  const words = query.toLowerCase().trim().split(/\s+/);

  for (const word of words) {
    if (word.length < 2) continue;

    // 1. Manual alias exact match
    const manual = MANUAL_ALIASES[word];
    if (manual) {
      manual.categorySlugs.forEach(addSlug);
      manual.extraTerms.forEach(addTerm);
    }

    // 2. Category i18n map — match if the translated name contains this word
    //    or this word contains the translated name (guards against single-char hits)
    if (word.length >= 3) {
      for (const [name, slug] of CATEGORY_I18N_MAP.entries()) {
        if (name.includes(word) || word.includes(name)) {
          addSlug(slug);
        }
      }
    }
  }

  return result;
}
