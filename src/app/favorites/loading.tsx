import { Skeleton } from "@/components/ui/Skeleton";

const GRID = "grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5";

export default function FavoritesLoading() {
  return (
    <div className="min-h-dvh bg-background pb-24 lg:pb-12">
      <div className="mx-auto w-full max-w-6xl p-4 sm:px-6">
        {/* Page title */}
        <Skeleton className="mb-4 h-7 w-32" />
        {/* Listing cards */}
        <div className={GRID}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-border bg-surface-card">
              <Skeleton className="aspect-[4/3] rounded-none" />
              <div className="space-y-2 p-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-5 w-2/3" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
