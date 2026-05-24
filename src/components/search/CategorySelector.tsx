"use client";

import { cn } from "@/lib/utils/cn";

export interface CategoryOption {
  slug: string;
  name: string;
  icon: string;
}

/** Large visual category cards used in the Sell flow (step 1) + filters. */
export function CategorySelector({
  categories,
  value,
  onChange,
  columns = 4,
}: {
  categories: CategoryOption[];
  value?: string;
  onChange: (slug: string) => void;
  columns?: 3 | 4;
}) {
  return (
    <div className={cn("grid gap-3", columns === 4 ? "grid-cols-4" : "grid-cols-3")}>
      {categories.map((c) => (
        <button
          key={c.slug}
          onClick={() => onChange(c.slug)}
          className={cn(
            "flex flex-col items-center gap-1.5 rounded-md border p-3 transition-colors",
            value === c.slug
              ? "border-primary bg-primary/10"
              : "border-border bg-surface-card hover:bg-surface-modal",
          )}
        >
          <span className="text-2xl">{c.icon}</span>
          <span className="text-center text-xs font-medium text-text-primary">{c.name}</span>
        </button>
      ))}
    </div>
  );
}
