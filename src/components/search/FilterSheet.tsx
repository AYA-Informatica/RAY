"use client";

import { useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { PriceSlider } from "./PriceSlider";
import { DistanceSelector } from "./DistanceSelector";
import { RWANDA_CITIES } from "@/constants/locations";

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
}: FilterSheetProps) {
  const [filters, setFilters] = useState<SearchFilters>(initial);

  // Dependent location dropdowns sourced from the constants/locations.ts hierarchy.
  const cityRow = useMemo(
    () => RWANDA_CITIES.find((c) => c.city === filters.city),
    [filters.city],
  );
  const districtRow = useMemo(
    () => cityRow?.districts.find((d) => d.name === filters.district),
    [cityRow, filters.district],
  );

  const showBrand = category && category !== "all" && BRAND_CATEGORIES.has(category);

  return (
    <Modal open={open} onClose={onClose} title="Filters">
      <div className="space-y-5">
        {/* Price */}
        <div>
          <p className="mb-2 text-sm font-medium">Price range</p>
          <PriceSlider
            min={filters.minPrice}
            max={filters.maxPrice}
            onMin={(minPrice) => setFilters((f) => ({ ...f, minPrice }))}
            onMax={(maxPrice) => setFilters((f) => ({ ...f, maxPrice }))}
          />
        </div>

        {/* Distance (depends on geolocation) */}
        <div>
          <p className="mb-2 text-sm font-medium">Distance</p>
          <DistanceSelector
            value={filters.radius}
            onChange={(radius) => setFilters((f) => ({ ...f, radius }))}
          />
          <p className="mt-2 text-xs text-text-muted">
            {locating
              ? "Detecting your location…"
              : locationError
                ? `Location unavailable: ${locationError}. Distance filter needs location access.`
                : hasLocation
                  ? "Closest listings ranked first."
                  : "Select a distance to use your current location for closest-first results."}
          </p>
        </div>

        {/* Location (hyperlocal hierarchy) */}
        <div className="space-y-3">
          <Select
            label="City"
            placeholder="Any city"
            value={filters.city}
            onChange={(e) =>
              setFilters((f) => ({ ...f, city: e.target.value, district: "", neighborhood: "" }))
            }
            options={RWANDA_CITIES.map((c) => ({ value: c.city, label: c.city }))}
          />
          {cityRow && (
            <Select
              label="District"
              placeholder="Any district"
              value={filters.district}
              onChange={(e) =>
                setFilters((f) => ({ ...f, district: e.target.value, neighborhood: "" }))
              }
              options={cityRow.districts.map((d) => ({ value: d.name, label: d.name }))}
            />
          )}
          {districtRow && districtRow.neighborhoods.length > 0 && (
            <Select
              label="Neighborhood"
              placeholder="Any neighborhood"
              value={filters.neighborhood}
              onChange={(e) => setFilters((f) => ({ ...f, neighborhood: e.target.value }))}
              options={districtRow.neighborhoods.map((n) => ({ value: n, label: n }))}
            />
          )}
        </div>

        {/* Brand — only for categories whose attribute schema includes one */}
        {showBrand && (
          <Input
            label="Brand"
            placeholder="e.g. Samsung, Toyota"
            value={filters.brand}
            onChange={(e) => setFilters((f) => ({ ...f, brand: e.target.value }))}
          />
        )}

        {/* Condition */}
        <Select
          label="Condition"
          placeholder="Any condition"
          value={filters.condition}
          onChange={(e) => setFilters((f) => ({ ...f, condition: e.target.value }))}
          options={[
            { value: "NEW", label: "New" },
            { value: "LIKE_NEW", label: "Like new" },
            { value: "GOOD", label: "Good" },
            { value: "FAIR", label: "Fair" },
            { value: "USED", label: "Used" },
          ]}
        />

        <div className="flex gap-3 pt-2">
          <Button variant="secondary" fullWidth onClick={() => setFilters(EMPTY_FILTERS)}>
            Reset
          </Button>
          <Button
            fullWidth
            onClick={() => {
              onApply(filters);
              onClose();
            }}
          >
            Apply
          </Button>
        </div>
      </div>
    </Modal>
  );
}
