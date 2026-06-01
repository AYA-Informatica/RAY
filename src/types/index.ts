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
  /** Auth-sync trigger sets this on every login; presence ticks refresh it. */
  lastSeenAt: Date;
  listingsCount?: number;
  /** Median first-reply minutes over the last 30 days. Undefined when unknown. */
  responseTimeMins?: number;
};

/** Listing as rendered in the grid (card). */
export type ListingCardData = Pick<
  Listing,
  "id" | "title" | "price" | "negotiable" | "city" | "district" | "neighborhood" | "createdAt" | "status" | "views"
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
