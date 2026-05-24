import type {
  Listing,
  ListingImage,
  Category,
  CategoryAttribute,
  ListingAttributeValue,
  User,
  Condition,
  ListingStatus,
} from "@prisma/client";

export type { Condition, ListingStatus };

/** Public seller summary attached to listing cards/detail. */
export type SellerSummary = Pick<
  User,
  "id" | "name" | "avatarUrl" | "city" | "createdAt"
> & {
  listingsCount?: number;
};

/** Listing as rendered in the grid (card). */
export type ListingCardData = Pick<
  Listing,
  "id" | "title" | "price" | "negotiable" | "city" | "district" | "neighborhood" | "createdAt" | "status"
> & {
  coverImage: string | null;
  category: Pick<Category, "slug" | "name" | "icon">;
  distanceKm?: number | null;
  featured?: boolean;
  isFavorite?: boolean;
};

/** Full listing for the detail page. */
export type ListingDetailData = Listing & {
  images: ListingImage[];
  category: Category;
  user: SellerSummary;
  attributeValues: (ListingAttributeValue & { attribute: CategoryAttribute })[];
  isFavorite?: boolean;
};

export type CategoryWithAttributes = Category & { attributes: CategoryAttribute[] };

export type Paginated<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
  hasMore: boolean;
};
