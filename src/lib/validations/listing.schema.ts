import { z } from "zod";

export const ConditionEnum = z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR", "USED"]);

/** Create-listing payload. Image count <= 7 enforced separately on upload. */
export const createListingSchema = z.object({
  title: z.string().trim().min(3, "Title is too short").max(120),
  description: z.string().trim().max(5000).default(""),
  price: z.number().nonnegative("Price must be 0 or more").finite(),
  negotiable: z.boolean().default(true),
  condition: ConditionEnum,
  categoryId: z.string().min(1, "Choose a category"),
  city: z.string().trim().min(1, "Choose a city"),
  district: z.string().trim().min(1, "Choose a district"),
  neighborhood: z.string().trim().max(120).optional(),
  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),
  images: z.array(z.string().url()).max(7, "Maximum 7 photos").default([]),
  attributes: z
    .array(z.object({ attributeId: z.string().min(1), value: z.string().max(500) }))
    .max(20)
    .default([]),
});

export const ListingStatusEnum = z.enum(["ACTIVE", "SOLD", "EXPIRED", "REMOVED", "FLAGGED"]);

/** Owners may also change status (e.g. mark sold / reactivate). */
export const updateListingSchema = createListingSchema.partial().extend({
  status: z.enum(["ACTIVE", "SOLD"]).optional(),
});

export type CreateListingInput = z.infer<typeof createListingSchema>;
export type UpdateListingInput = z.infer<typeof updateListingSchema>;
