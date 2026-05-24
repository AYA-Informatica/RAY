import { ListingGridSkeleton } from "@/components/listings/ListingGrid";

export default function SearchLoading() {
  return (
    <div className="mx-auto max-w-md p-4">
      <ListingGridSkeleton count={6} />
    </div>
  );
}
