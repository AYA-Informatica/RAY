"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { useRecentlyViewed } from "@/lib/recentlyViewed";
import { formatPrice } from "@/lib/utils/format";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Recently Viewed section — shown on the home feed when the user has
 * browsed at least one listing. Purely localStorage-backed; no DB queries.
 */
export function RecentlyViewed() {
  const { t } = useI18n();
  const items = useRecentlyViewed();
  if (items.length === 0) return null;

  return (
    <section className="px-4 pb-2 pt-4 sm:px-6">
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg font-bold lg:text-xl">
        <Clock size={18} className="text-text-secondary" />
        {t("home.recentlyViewed")}
      </h2>
      <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/listing/${item.id}`}
            className="w-32 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-card sm:w-36"
          >
            <div className="relative aspect-square w-full bg-surface-modal">
              {item.coverImage ? (
                <Image
                  src={item.coverImage}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="144px"
                />
              ) : (
                <span className="grid h-full w-full place-items-center text-2xl">📦</span>
              )}
            </div>
            <div className="p-2">
              <p className="line-clamp-1 text-xs text-text-primary">{item.title}</p>
              <p className="mt-0.5 font-display text-sm font-bold text-text-primary">
                {formatPrice(item.price)}
              </p>
              <p className="truncate text-[10px] text-text-muted">{item.city}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
