import { Skeleton } from "@/components/ui/Skeleton";

export default function ListingLoading() {
  return (
    <div className="min-h-dvh bg-background pb-24 lg:pb-12">
      <div className="mx-auto w-full max-w-6xl lg:px-8 lg:py-8">
        <div className="lg:grid lg:grid-cols-2 lg:gap-8">
          {/* Gallery */}
          <div className="relative">
            {/* Back button */}
            <div className="absolute left-3 top-3 z-10">
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
            {/* Favorite button */}
            <div className="absolute right-3 top-3 z-10">
              <Skeleton className="h-9 w-9 rounded-full" />
            </div>
            <Skeleton className="aspect-[4/3] w-full rounded-none lg:rounded-xl" />
          </div>

          {/* Details */}
          <div className="space-y-5 p-4 lg:p-0">
            {/* Title + price */}
            <div>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="mt-2 h-7 w-1/3" />
              {/* Badges */}
              <div className="mt-3 flex gap-2">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              {/* Location + views + time */}
              <div className="mt-2 flex gap-3">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
            </div>

            {/* Specs grid */}
            <div>
              <Skeleton className="mb-2 h-5 w-20" />
              <div className="grid grid-cols-2 gap-3 rounded-md border border-border bg-surface-card p-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <Skeleton className="mb-2 h-5 w-24" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>

            {/* Seller card */}
            <div className="flex items-center gap-3 rounded-md border border-border bg-surface-card p-4">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky chat bar (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface-card p-3 lg:hidden">
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}
