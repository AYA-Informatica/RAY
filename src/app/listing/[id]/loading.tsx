import { Skeleton } from "@/components/ui/Skeleton";

export default function ListingLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl pb-24 lg:px-8 lg:py-8 lg:pb-12">
      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        <Skeleton className="aspect-square w-full rounded-none lg:rounded-xl" />
        <div className="space-y-3 p-4 lg:p-0">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-9 w-1/2" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    </div>
  );
}
