import { redirect, notFound } from "next/navigation";
import type { ListingImage, CategoryAttribute, ListingAttributeValue } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth/session";
import { getOwnedListing } from "@/services/listings";
import { parseAttributeOptions } from "@/lib/utils/categoryAttributes";
import { EditListingForm } from "./EditListingForm";
import { logger } from "@/lib/logger";

export const metadata = { title: "Edit ad" };

type Params = { params: Promise<{ id: string }> };

/** Edit an owned listing. Auth + ownership enforced. */
export default async function EditListingPage({ params }: Params) {
  const { id } = await params;
  logger.debug({ listingId: id }, "[EditListingPage] rendering");
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirect=/profile/ads/${id}/edit`);

  const listing = await getOwnedListing(id, user.id);
  if (!listing) {
    logger.debug({ listingId: id, userId: user.id }, "[EditListingPage] listing not found or not owned");
    notFound();
  }

  // Serialize for the client form.
  const initial = {
    id: listing.id,
    title: listing.title,
    description: listing.description,
    price: String(listing.price),
    negotiable: listing.negotiable,
    condition: listing.condition,
    city: listing.city,
    district: listing.district,
    neighborhood: listing.neighborhood ?? "",
    images: listing.images.map((i: ListingImage) => i.url),
    categoryName: listing.category.name,
    categorySlug: listing.category.slug,
    categoryIcon: listing.category.icon ?? "📦",
    attributes: (listing.category.attributes ?? []).map((a: CategoryAttribute) => {
      const { values, showIf } = parseAttributeOptions(a.options);
      return {
        id: a.id,
        label: a.label,
        key: a.key,
        type: a.type,
        required: a.required,
        placeholder: a.placeholder ?? "",
        options: values,
        showIf,
        value:
          (listing.attributeValues ?? []).find(
            (av: ListingAttributeValue) => av.attributeId === a.id,
          )?.value ?? "",
      };
    }),
  };

  return <EditListingForm userId={user.id} initial={initial} />;
}
