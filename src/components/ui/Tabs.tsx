"use client";

import { cn } from "@/lib/utils/cn";

export interface TabsProps {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
  className?: string;
}

/** Horizontal scrollable chip tabs (used by search filters + category bar). */
export function Tabs({ tabs, active, onChange, className }: TabsProps) {
  return (
    <div className={cn("no-scrollbar flex gap-2 overflow-x-auto", className)}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "shrink-0 rounded-pill px-4 py-2 text-sm font-medium transition-colors",
            active === t.id
              ? "bg-primary text-text-primary"
              : "border border-border bg-surface-card text-text-secondary hover:text-text-primary",
          )}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
