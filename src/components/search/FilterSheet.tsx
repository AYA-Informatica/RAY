"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { PriceSlider } from "./PriceSlider";
import { DistanceSelector } from "./DistanceSelector";

export interface SearchFilters {
  condition: string;
  minPrice: string;
  maxPrice: string;
  radius: number;
}

/** Bottom-sheet filter panel for the search page. */
export function FilterSheet({
  open,
  onClose,
  initial,
  onApply,
}: {
  open: boolean;
  onClose: () => void;
  initial: SearchFilters;
  onApply: (f: SearchFilters) => void;
}) {
  const [filters, setFilters] = useState<SearchFilters>(initial);

  return (
    <Modal open={open} onClose={onClose} title="Filters">
      <div className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-medium">Price range</p>
          <PriceSlider
            min={filters.minPrice}
            max={filters.maxPrice}
            onMin={(minPrice) => setFilters((f) => ({ ...f, minPrice }))}
            onMax={(maxPrice) => setFilters((f) => ({ ...f, maxPrice }))}
          />
        </div>

        <div>
          <p className="mb-2 text-sm font-medium">Distance</p>
          <DistanceSelector
            value={filters.radius}
            onChange={(radius) => setFilters((f) => ({ ...f, radius }))}
          />
        </div>

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
          <Button
            variant="secondary"
            fullWidth
            onClick={() => setFilters({ condition: "", minPrice: "", maxPrice: "", radius: 0 })}
          >
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
