import { Skeleton } from "@/components/ui/Skeleton";

/** Global route loading fallback — matches the AppShell reading-width layout. */
export default function Loading() {
  return (
    <div className="min-h-dvh bg-background pb-24 lg:pb-12">
      <div className="mx-auto w-full max-w-2xl space-y-4 p-4 sm:px-6">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-px w-full bg-border" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
