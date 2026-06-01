import { Skeleton } from "@/components/ui/Skeleton";

/** Global route loading fallback. */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-4 p-4 sm:px-6">
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 lg:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
