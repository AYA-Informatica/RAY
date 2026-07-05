"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { PriceSlider } from "./PriceSlider";
import { DistanceSelector } from "./DistanceSelector";
import { useLocationCascade } from "@/hooks/useLocationCascade";
import { useI18n } from "@/i18n/I18nProvider";

/** Filters applied on the search page. Strings (not nulls) so empty = ignored. */
export interface SearchFilters {
  condition: string;
  minPrice: string;
  maxPrice: string;
  radius: number;
  city: string;
  district: string;
  neighborhood: string;
  brand: string;
}

export const EMPTY_FILTERS: SearchFilters = {
  condition: "",
  minPrice: "",
  maxPrice: "",
  radius: 0,
  city: "",
  district: "",
  neighborhood: "",
  brand: "",
};

interface FilterSheetProps {
  open: boolean;
  onClose: () => void;
  initial: SearchFilters;
  onApply: (f: SearchFilters) => void;
  /** Active category slug (or "all"). Used to decide whether to show the brand input. */
  category?: string;
  /** Whether the device has shared geolocation. Drives the distance helper copy. */
  hasLocation?: boolean;
  /** True while the SearchClient is requesting geolocation. */
  locating?: boolean;
  /** Reason geolocation failed/was denied, surfaced as a hint. */
  locationError?: string | null;
}

// Categories whose attribute schema includes a "brand" key (matches seed.ts).
const BRAND_CATEGORIES = new Set(["phones", "electronics", "cars", "bikes"]);

/**
 * Bottom-sheet filter panel. Adds the previously missing hyperlocal filters
 * (city → district → neighborhood, brand for relevant categories) and the
 * geolocation status that drives the closest-first ranking.
 */
export function FilterSheet({
  open,
  onClose,
  initial,
  onApply,
  category,
  hasLocation = false,
  locating = false,
  locationError = null,
}: Readonly<FilterSheetProps>) {
  const { t } = useI18n();
  const [filters, setFilters] = useState<SearchFilters>(initial);

  const { allDistricts, loadingDistricts, sectors, loadingSectors } = useLocationCascade(filters.district);

  const showBrand = category && category !== "all" && BRAND_CATEGORIES.has(category);

  let locationHint: string;
  if (locating) locationHint = t("filter.locating");
  else if (locationError) locationHint = t("filter.locationError");
  else if (hasLocation) locationHint = t("filter.locationReady");
  else locationHint = t("filter.locationHint");

  const sectorSelect = filters.district && !loadingSectors && sectors.length > 0 ? (
    <Select
      label={t("filter.neighborhood")}
      placeholder={t("filter.anyNeighborhood")}
      value={filters.neighborhood}
      onChange={(e) => setFilters((f) => ({ ...f, neighborhood: e.target.value }))}
      options={sectors.map((s) => ({ value: s, label: s }))}
    />
  ) : null;

  return (
    <Modal open={open} onClose={onClose} title={t("search.filters")}>
      <div className="space-y-5">
        {/* Price */}
        <div>
          <p className="mb-2 text-sm font-medium">{t("filter.priceRange")}</p>
          <PriceSlider
            min={filters.minPrice}
            max={filters.maxPrice}
            onMin={(minPrice) => setFilters((f) => ({ ...f, minPrice }))}
            onMax={(maxPrice) => setFilters((f) => ({ ...f, maxPrice }))}
          />
        </div>

        {/* Distance (depends on geolocation) */}
        <div>
          <p className="mb-2 text-sm font-medium">{t("filter.distance")}</p>
          <DistanceSelector
            value={filters.radius}
            onChange={(radius) => setFilters((f) => ({ ...f, radius }))}
          />
          <p className="mt-2 text-xs text-text-muted">{locationHint}</p>
        </div>

        {/* Location (hyperlocal hierarchy) */}
        <div className="space-y-3">
          <Select
            label={t("filter.district")}
            disabled={loadingDistricts}
            placeholder={loadingDistricts ? t("common.loading") : t("filter.anyDistrict")}
            value={filters.district}
            onChange={(e) =>
              setFilters((f) => ({ ...f, district: e.target.value, neighborhood: "" }))
            }
            options={allDistricts.map((d) => ({ value: d.district, label: d.district }))}
          />
          {sectorSelect}
        </div>

        {/* Brand — only for categories whose attribute schema includes one */}
        {showBrand && (
          <Input
            label={t("filter.brand")}
            placeholder={t("filter.brandPlaceholder")}
            value={filters.brand}
            onChange={(e) => setFilters((f) => ({ ...f, brand: e.target.value }))}
          />
        )}

        {/* Condition */}
        <Select
          label={t("filter.condition")}
          placeholder={t("filter.anyCondition")}
          value={filters.condition}
          onChange={(e) => setFilters((f) => ({ ...f, condition: e.target.value }))}
          options={[
            { value: "NEW", label: t("condition.NEW") },
            { value: "LIKE_NEW", label: t("condition.LIKE_NEW") },
            { value: "GOOD", label: t("condition.GOOD") },
            { value: "FAIR", label: t("condition.FAIR") },
            { value: "USED", label: t("condition.USED") },
          ]}
        />

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={() => setFilters(EMPTY_FILTERS)}>
            {t("filter.reset")}
          </Button>
          <Button
            fullWidth
            onClick={() => {
              onApply(filters);
              onClose();
            }}
          >
            {t("filter.apply")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
