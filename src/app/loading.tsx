import { Skeleton } from "@/components/ui/Skeleton";

/** Global route loading fallback. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-md space-y-4 p-4">
      <Skeleton className="h-32 w-full" />
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square" />
        ))}
      </div>
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
