"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Search as SearchIcon, SlidersHorizontal } from "lucide-react";
import { Tabs } from "@/components/ui/Tabs";
import { ListingGrid, ListingGridSkeleton } from "@/components/listings/ListingGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { PermissionPrompt } from "@/components/shared/PermissionPrompt";
import { FilterSheet, EMPTY_FILTERS, type SearchFilters } from "@/components/search/FilterSheet";
import { useI18n } from "@/i18n/I18nProvider";
import { formatResultCount } from "@/lib/utils/format";
import type { ListingCardData, Paginated } from "@/types";
import { logger } from "@/lib/logger";

interface SearchCategory {
  slug: string;
  name: string;
  icon: string;
}

interface Coords {
  lat: number;
  lng: number;
}

/** Small dismissable chip for active filters. */
function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1 rounded-pill border border-primary/40 bg-primary/10 px-2.5 py-1 text-xs text-primary">
      {label}
      <button onClick={onRemove} aria-label={`Remove ${label} filter`} className="ml-0.5 opacity-70 hover:opacity-100">×</button>
    </span>
  );
}

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

  // Geolocation — only requested when the user opts into a distance radius,
  // so we never prompt on first paint. Coords are cached for the session.
  const [coords, setCoords] = useState<Coords | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Show RAY's PermissionPrompt before the OS dialog.
  const [showLocationPrompt, setShowLocationPrompt] = useState(false);

  useEffect(() => {
    if (filters.radius <= 0 || coords || locating || showLocationPrompt) return;
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocationError("Not supported on this device");
      return;
    }
    setShowLocationPrompt(true);
  }, [filters.radius, coords, locating, showLocationPrompt]);

  function requestLocation() {
    setShowLocationPrompt(false);
    setLocating(true);
    setLocationError(null);
    logger.debug("[SearchClient] requesting location for radius filter");
    navigator.geolocation.getCurrentPosition(
      (pos) => { setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLocating(false); },
      (err) => {
        logger.warn({ code: err.code }, "[SearchClient] geolocation failed");
        setLocationError(err.code === err.PERMISSION_DENIED ? "permission denied" : "unavailable");
        setLocating(false);
        setFilters((f) => ({ ...f, radius: 0 }));
      },
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 5 * 60_000 },
    );
  }

  const run = useCallback(async () => {
    setLoading(true);
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (category && category !== "all") sp.set("category", category);
    if (filters.condition) sp.set("condition", filters.condition);
    if (filters.minPrice) sp.set("minPrice", filters.minPrice);
    if (filters.maxPrice) sp.set("maxPrice", filters.maxPrice);
    if (filters.radius) sp.set("radius", String(filters.radius));
    if (filters.city) sp.set("city", filters.city);
    if (filters.district) sp.set("district", filters.district);
    if (filters.neighborhood) sp.set("neighborhood", filters.neighborhood);
    if (filters.brand) sp.set("brand", filters.brand);
    if (coords) {
      sp.set("lat", String(coords.lat));
      sp.set("lng", String(coords.lng));
    }
    try {
      const res = await fetch(`/api/search?${sp.toString()}`);
      const json = (await res.json()) as { data?: Paginated<ListingCardData> };
      logger.debug({ query, category, total: json.data?.total ?? 0 }, "[SearchClient] search completed");
      setResult(json.data ?? null);
    } catch (err) {
      logger.warn({ message: err instanceof Error ? err.message : String(err) }, "[SearchClient] search request failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, [query, category, filters, coords]);

  // Debounced re-search whenever inputs change.
  useEffect(() => {
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => void run(), 300);
    return () => clearTimeout(debounce.current);
  }, [run]);

  const activeFilterCount =
    (filters.condition ? 1 : 0) +
    (filters.minPrice || filters.maxPrice ? 1 : 0) +
    (filters.radius ? 1 : 0) +
    (filters.city ? 1 : 0) +
    (filters.district ? 1 : 0) +
    (filters.neighborhood ? 1 : 0) +
    (filters.brand ? 1 : 0);

  return (
    <div className="flex min-h-dvh flex-col">
      <h1 className="sr-only">{t("nav.search")}</h1>
      {showLocationPrompt && (
        <PermissionPrompt
          type="location"
          onAllow={requestLocation}
          onDismiss={() => {
            setShowLocationPrompt(false);
            setFilters((f) => ({ ...f, radius: 0 }));
          }}
        />
      )}
      {/* Search bar */}
      <div className="sticky top-0 z-10 space-y-3 bg-background px-4 pb-3 pt-4 sm:px-6 lg:top-16">
        <div className="flex items-center gap-2">
          <button onClick={() => router.back()} aria-label="Back" className="text-text-secondary">
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
          tabs={[
            { id: "all", label: t("search.all") },
            ...categories.map((c) => {
              const key = `category.${c.slug.replace(/-([a-z])/g, (_, l: string) => l.toUpperCase())}`;
              const label = t(key);
              return { id: c.slug, label: label === key ? c.name : label };
            }),
          ]}
          active={category}
          onChange={setCategory}
        />

        {/* Active filter chips — each individually dismissable */}
        {activeFilterCount > 0 && (
          <div className="no-scrollbar flex flex-wrap gap-2 pt-1">
            {filters.city && (
              <FilterChip label={filters.city} onRemove={() => setFilters((f) => ({ ...f, city: "", district: "", neighborhood: "" }))} />
            )}
            {filters.district && (
              <FilterChip label={filters.district} onRemove={() => setFilters((f) => ({ ...f, district: "", neighborhood: "" }))} />
            )}
            {filters.neighborhood && (
              <FilterChip label={filters.neighborhood} onRemove={() => setFilters((f) => ({ ...f, neighborhood: "" }))} />
            )}
            {filters.brand && (
              <FilterChip label={filters.brand} onRemove={() => setFilters((f) => ({ ...f, brand: "" }))} />
            )}
            {filters.condition && (
              <FilterChip label={filters.condition.replace("_", " ")} onRemove={() => setFilters((f) => ({ ...f, condition: "" }))} />
            )}
            {(filters.minPrice || filters.maxPrice) && (
              <FilterChip
                label={[filters.minPrice && `Rwf ${filters.minPrice}+`, filters.maxPrice && `≤ ${filters.maxPrice}`].filter(Boolean).join(" ")}
                onRemove={() => setFilters((f) => ({ ...f, minPrice: "", maxPrice: "" }))}
              />
            )}
            {filters.radius > 0 && (
              <FilterChip label={`Within ${filters.radius}km`} onRemove={() => setFilters((f) => ({ ...f, radius: 0 }))} />
            )}
            <button
              onClick={() => { setFilters(EMPTY_FILTERS); setCategory("all"); }}
              className="rounded-pill px-3 py-1 text-xs text-text-muted hover:text-danger"
            >
              {t("search.clear")}
            </button>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 px-4 pb-4 sm:px-6">
        {locationError && (
          <div
            role="status"
            className="mb-3 flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning"
          >
            <span className="leading-tight">
              {t("search.locationDenied").replace("{reason}", locationError)}
            </span>
            <button
              onClick={() => setLocationError(null)}
              aria-label="Dismiss"
              className="ml-auto text-warning/80 hover:text-warning"
            >
              ✕
            </button>
          </div>
        )}
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
            <p className="py-3 text-sm font-medium text-text-primary">
              {formatResultCount(result.total)} {t("search.results")}
              {query && <span className="font-normal text-text-secondary"> {t("search.for")} &ldquo;{query}&rdquo;</span>}
            </p>
            <ListingGrid listings={result.items} />
          </>
        )}
      </div>

      <FilterSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        initial={filters}
        onApply={setFilters}
        category={category}
        hasLocation={coords !== null}
        locating={locating}
        locationError={locationError}
      />
    </div>
  );
}
