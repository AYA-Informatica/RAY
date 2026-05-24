"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { ListingGrid, ListingGridSkeleton } from "@/components/listings/ListingGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { FilterSheet, type SearchFilters } from "@/components/search/FilterSheet";
import { useI18n } from "@/i18n/I18nProvider";
import type { ListingCardData, Paginated } from "@/types";

interface SearchCategory {
  slug: string;
  name: string;
  icon: string;
}

const EMPTY_FILTERS: SearchFilters = { condition: "", minPrice: "", maxPrice: "", radius: 0 };

/** Search UI: query bar + category chips + filter sheet + results grid. */
export function SearchClient({ categories }: { categories: SearchCategory[] }) {
  const router = useRouter();
  const params = useSearchParams();
  const { t } = useI18n();

  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState(params.get("category") ?? "all");
  const [filters, setFilters] = useState<SearchFilters>(EMPTY_FILTERS);
  const [filterOpen, setFilterOpen] = useState(false);

  const [result, setResult] = useState<Paginated<ListingCardData> | null>(null);
  const [loading, setLoading] = useState(true);
  const debounce = useRef<ReturnType<typeof setTimeout>>();

  const run = useCallback(async () => {
    setLoading(true);
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (category && category !== "all") sp.set("category", category);
    if (filters.condition) sp.set("condition", filters.condition);
    if (filters.minPrice) sp.set("minPrice", filters.minPrice);
    if (filters.maxPrice) sp.set("maxPrice", filters.maxPrice);
    if (filters.radius) sp.set("radius", String(filters.radius));
    try {
      const res = await fetch(`/api/search?${sp.toString()}`);
      const json = (await res.json()) as { data?: Paginated<ListingCardData> };
      setResult(json.data ?? null);
    } catch {
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [query, category, filters]);

  // Debounced re-search whenever inputs change.
  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => void run(), 300);
    return () => clearTimeout(debounce.current);
  }, [run]);

  const activeFilterCount =
    (filters.condition ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.radius ? 1 : 0);

  return (
    <div className="flex min-h-dvh flex-col">
      {/* Search bar */}
      <div className="sticky top-0 z-10 space-y-3 bg-background px-4 pb-3 pt-4">
        <div className="flex items-center gap-2">
          <button onClick={() => router.push("/home")} aria-label="Back" className="text-text-secondary">
            <ArrowLeft size={22} />
          </button>
          <div className="flex flex-1 items-center gap-2 rounded-md border border-border bg-surface-modal px-3">
            <SearchIcon size={18} className="text-text-secondary" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("search.placeholder")}
              className="h-11 w-full bg-transparent text-text-primary placeholder:text-text-muted focus:outline-none"
            />
          </div>
          <button
            onClick={() => setFilterOpen(true)}
            aria-label="Filters"
            className="relative grid h-11 w-11 place-items-center rounded-md border border-border bg-surface-card text-text-secondary"
          >
            <SlidersHorizontal size={18} />
            {activeFilterCount > 0 && (
              <span className="absolute -right-1 -top-1 grid h-4 w-4 place-items-center rounded-pill bg-primary text-[10px] font-bold text-text-primary">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>

        <Tabs
          tabs={categories.map((c) => ({ id: c.slug, label: c.name }))}
          active={category}
          onChange={setCategory}
        />
      </div>

      {/* Results */}
      <div className="flex-1 px-4 pb-4">
        {loading ? (
          <ListingGridSkeleton />
        ) : !result || result.items.length === 0 ? (
          <EmptyState
            icon={<SearchIcon size={36} />}
            title={t("search.noResults")}
            description={t("search.noResultsSub")}
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery("");
                  setCategory("all");
                  setFilters(EMPTY_FILTERS);
                }}
              >
                {t("search.clear")}
              </Button>
            }
          />
        ) : (
          <>
            <p className="py-3 text-sm text-text-secondary">{t("search.found")} {result.total} {t("search.results")}</p>
            <ListingGrid listings={result.items} />
          </>
        )}
      </div>

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        initial={filters}
        onApply={setFilters}
      />
    </div>
  );
}
