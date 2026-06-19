import { Skeleton } from "@/components/ui/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="min-h-dvh bg-background pb-24 lg:pb-12">
      <div className="mx-auto w-full max-w-2xl">
        {/* Orange header with avatar */}
        <div className="bg-primary px-4 pb-5 pt-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-7 w-20 bg-text-primary/20" />
            <Skeleton className="h-6 w-6 rounded bg-text-primary/20" />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Skeleton className="h-16 w-16 rounded-full bg-text-primary/20" />
            <div className="space-y-2">
              <Skeleton className="h-5 w-32 bg-text-primary/20" />
              <Skeleton className="h-3 w-40 bg-text-primary/20" />
              <Skeleton className="h-3 w-20 bg-text-primary/20" />
            </div>
          </div>
        </div>

        {/* Stats card */}
        <div className="px-4 pt-4">
          <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border bg-surface-card">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center gap-1 py-3">
                <Skeleton className="h-6 w-8" />
                <Skeleton className="h-3 w-14" />
              </div>
            ))}
          </div>
        </div>

        {/* Menu rows */}
        <div className="mt-4 divide-y divide-border border-y border-border">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5">
              <Skeleton className="h-5 w-5 rounded" />
              <Skeleton className="h-4 flex-1 max-w-[160px]" />
              <Skeleton className="ml-auto h-4 w-4 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
