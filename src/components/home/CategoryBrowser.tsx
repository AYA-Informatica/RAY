"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { useI18n } from "@/i18n/I18nProvider";

type Category = { id: string; slug: string; icon: string | null; name: string };

export function CategoryBrowser({ categories }: { categories: Category[] }) {
  const [expanded, setExpanded] = useState(false);
  const { t } = useI18n();

  function tCategory(slug: string, fallback: string): string {
    const key = `category.${slug.replace(/-([a-z])/g, (_, l: string) => l.toUpperCase())}`;
    const r = t(key);
    return r === key ? fallback : r;
  }

  return (
    <section className="px-4 pt-5 sm:px-6 lg:pt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold lg:text-xl">{t("home.browseCategories")}</h2>

        <button
          onClick={() => setExpanded((v) => !v)}
          aria-label={expanded ? "Show less" : "Show all categories"}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-200",
            "bg-surface-card ring-1 ring-white/10",
            "shadow-[0_0_10px_2px_rgba(255,255,255,0.05)]",
            "hover:ring-white/20 hover:shadow-[0_0_14px_3px_rgba(255,255,255,0.10)]",
            expanded && "ring-white/20 shadow-[0_0_14px_3px_rgba(255,255,255,0.10)]",
          )}
        >
          {expanded ? (
            <ChevronUp size={15} className="text-text-secondary" />
          ) : (
            <LayoutGrid size={14} className="text-text-secondary" />
          )}
        </button>
      </div>

      <div
        className={cn(
          expanded
            ? "grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8"
            : "flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        )}
      >
        {categories.map((c) => (
          <Link
            key={c.id}
            href={`/search?category=${c.slug}`}
            className={cn(
              "flex flex-col items-center gap-1.5 rounded-xl p-1 transition-colors hover:bg-surface-card/60 active:scale-95",
              !expanded && "min-w-[64px]",
            )}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-card text-2xl">
              {c.icon}
            </span>
            <span className="text-center text-[10px] font-medium leading-tight text-text-secondary">
              {tCategory(c.slug, c.name)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
