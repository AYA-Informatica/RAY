"use client";

import { DISTANCE_RADII } from "@/constants/locations";
import { cn } from "@/lib/utils/cn";

/** Smart Location Radius chips — RAY's hyperlocal differentiator. */
export function DistanceSelector({
  value,
  onChange,
}: {
  value: number;
  onChange: (km: number) => void;
}) {
  return (
    <div className="no-scrollbar flex gap-2 overflow-x-auto">
      {DISTANCE_RADII.map((r) => (
        <button
          key={r.value}
          onClick={() => onChange(r.value)}
          className={cn(
            "shrink-0 rounded-pill border px-3 py-1.5 text-sm",
            value === r.value
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-surface-card text-text-secondary",
          )}
        >
          {r.label}
        </button>
      ))}
    </div>
  );
}
