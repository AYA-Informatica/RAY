import { z } from "zod";

export const updateProfileSchema = z.object({
  name: z.string().trim().min(1).max(80).optional(),
  bio: z.string().trim().max(300).optional(),
  avatarUrl: z.string().url().optional(),
  city: z.string().trim().max(80).optional(),
  district: z.string().trim().max(80).optional(),
  neighborhood: z.string().trim().max(120).optional(),
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
