import { Skeleton } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div className="mx-auto max-w-md pb-24">
      <Skeleton className="h-40 w-full rounded-none" />
      <div className="grid grid-cols-4 gap-y-5 px-4 pt-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="mx-auto h-14 w-14 rounded-md" />
        ))}
      </div>
      <div className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    </div>
  );
}
