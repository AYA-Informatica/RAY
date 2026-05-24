"use client";

import { Input } from "@/components/ui/Input";

/** Min/max price range inputs (Rwf). */
export function PriceSlider({
  min,
  max,
  onMin,
  onMax,
}: {
  min: string;
  max: string;
  onMin: (v: string) => void;
  onMax: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3">
      <Input
        type="number"
        inputMode="numeric"
        placeholder="Min"
        value={min}
        onChange={(e) => onMin(e.target.value)}
        leftAddon={<span className="text-xs">Rwf</span>}
      />
      <span className="text-text-muted">—</span>
      <Input
        type="number"
        inputMode="numeric"
        placeholder="Max"
        value={max}
        onChange={(e) => onMax(e.target.value)}
        leftAddon={<span className="text-xs">Rwf</span>}
      />
    </div>
  );
}
