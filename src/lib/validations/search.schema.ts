import { z } from "zod";
import { ConditionEnum } from "./listing.schema";

const numericString = z
  .string()
  .optional()
  .transform((v) => (v ? Number(v) : undefined))
  .pipe(z.number().nonnegative().optional());

export const searchQuerySchema = z.object({
  q: z.string().trim().max(120).optional(),
  category: z.string().optional(),
  city: z.string().optional(),
  district: z.string().optional(),
  neighborhood: z.string().optional(),
  province: z.string().optional(),
  sector: z.string().optional(),
  brand: z.string().optional(),
  condition: ConditionEnum.optional(),
  minPrice: numericString,
  maxPrice: numericString,
  radius: numericString, // km; 0 = anywhere
  lat: z.coerce.number().optional(),
  lng: z.coerce.number().optional(),
  sortBy: z.enum(["newest", "price_asc", "price_desc"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(50).default(20),
});

export type SearchQuery = z.infer<typeof searchQuerySchema>;
