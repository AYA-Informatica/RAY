import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, ArrowLeft } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { ListingGrid } from "@/components/listings/ListingGrid";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { FavoritesProvider } from "@/components/shared/FavoritesProvider";
import { getCurrentUser } from "@/lib/auth/session";
import { getFavoriteListings } from "@/services/favorites";

export const metadata = { title: "Favourites" };

/** Saved listings (favorites). Auth required. */
export default async function FavoritesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirect=/favorites");

  const listings = await getFavoriteListings(user.id);

  return (
    <AppShell width="wide">
      <FavoritesProvider initialIds={listings.map((l) => l.id)} />
      <header className="flex items-center gap-3 border-b border-border px-4 py-4 lg:hidden">
        <Link href="/home" aria-label="Back" className="text-text-secondary">
          <ArrowLeft size={22} />
        </Link>
        <h1 className="font-display text-xl font-bold">Favourites</h1>
      </header>
      <h1 className="hidden px-4 py-4 font-display text-xl font-bold lg:block">Favourites</h1>

      <div className="p-4">
        {listings.length === 0 ? (
          <EmptyState
            icon={<Heart size={36} />}
            title="No favourites yet"
            description="Tap the heart on any listing to save it here for later."
            action={
              <Link href="/search">
                <Button>Browse listings</Button>
              </Link>
            }
          />
        ) : (
          <ListingGrid listings={listings} />
        )}
      </div>
    </AppShell>
  );
}
