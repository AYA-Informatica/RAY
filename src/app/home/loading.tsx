import { Skeleton } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div className="min-h-dvh bg-background pb-24 lg:pb-12">
      {/* Location header skeleton (mobile) */}
      <div className="bg-primary px-4 pb-5 pt-4 lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Skeleton className="h-5 w-5 rounded-full bg-text-primary/20" />
            <Skeleton className="h-5 w-24 bg-text-primary/20" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-6 w-12 rounded-full bg-text-primary/20" />
            <Skeleton className="h-5 w-5 rounded-full bg-text-primary/20" />
          </div>
        </div>
        <Skeleton className="mt-4 h-11 w-full rounded-md bg-text-primary/15" />
      </div>

      <div className="mx-auto w-full max-w-6xl">
        {/* Category row skeleton */}
        <div className="px-4 pt-5 sm:px-6 lg:pt-8">
          <div className="mb-3 flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-8 w-8 rounded-xl" />
          </div>
          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex min-w-[64px] flex-col items-center gap-1.5">
                <Skeleton className="h-12 w-12 rounded-2xl" />
                <Skeleton className="h-3 w-10" />
              </div>
            ))}
          </div>
        </div>

        {/* Listings skeleton */}
        <div className="space-y-3 px-4 pb-4 pt-6 sm:px-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-16" />
          </div>
          {/* Mobile: row cards */}
          <div className="space-y-3 sm:hidden">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          {/* Desktop: grid cards */}
          <div className="hidden grid-cols-3 gap-4 sm:grid lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>

      {/* Bottom nav skeleton (mobile) */}
      <div className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-center justify-around border-t border-border bg-surface-card mouse-lg:hidden">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-2.5 w-8" />
          </div>
        ))}
      </div>
    </div>
  );
}
