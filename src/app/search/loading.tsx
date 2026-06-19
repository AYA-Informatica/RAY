import { Skeleton } from "@/components/ui/Skeleton";
import { ListingGridSkeleton } from "@/components/listings/ListingGrid";

export default function SearchLoading() {
  return (
    <div className="min-h-dvh bg-background pb-24 lg:pb-12">
      <div className="mx-auto w-full max-w-6xl p-4 sm:px-6">
        {/* Search bar */}
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 shrink-0 rounded" />
          <Skeleton className="h-10 flex-1 rounded-md" />
          <Skeleton className="h-10 w-10 shrink-0 rounded-md" />
        </div>

        {/* Category tabs */}
        <div className="mt-3 flex gap-2 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-20 shrink-0 rounded-full" />
          ))}
        </div>

        {/* Results grid */}
        <div className="mt-4">
          <ListingGridSkeleton count={8} />
        </div>
      </div>
    </div>
  );
}
