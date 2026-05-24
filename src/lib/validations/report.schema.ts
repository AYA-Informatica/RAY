import { z } from "zod";

export const reportReasonEnum = z.enum([
  "SPAM",
  "FAKE",
  "STOLEN",
  "HARASSMENT",
  "SCAM",
  "INAPPROPRIATE",
]);

export const createReportSchema = z.object({
  reason: reportReasonEnum,
  details: z.string().trim().max(2000).optional(),
  listingId: z.string().min(1).optional(),
});

export type CreateReportInput = z.infer<typeof createReportSchema>;
