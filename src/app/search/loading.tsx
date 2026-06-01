import { ListingGridSkeleton } from "@/components/listings/ListingGrid";

export default function SearchLoading() {
  return (
    <div className="mx-auto w-full max-w-6xl p-4 sm:px-6">
      <ListingGridSkeleton count={10} />
    </div>
  );
}
