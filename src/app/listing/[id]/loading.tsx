import { Skeleton } from "@/components/ui/Skeleton";

export default function ListingLoading() {
  return (
    <div className="mx-auto max-w-md pb-24">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-3 p-4">
        <Skeleton className="h-7 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    </div>
  );
}
