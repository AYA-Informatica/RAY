import { Skeleton } from "@/components/ui/Skeleton";

export default function HomeLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl pb-24 lg:pb-12">
      <Skeleton className="h-40 w-full rounded-none lg:hidden" />
      <div className="grid grid-cols-4 gap-y-5 px-4 pt-5 sm:grid-cols-6 sm:px-6 lg:grid-cols-8 lg:pt-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="mx-auto h-14 w-14 rounded-md" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-3 sm:px-6 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full sm:aspect-[4/3] sm:h-auto" />
        ))}
      </div>
    </div>
  );
}
