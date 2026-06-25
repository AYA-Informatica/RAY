import { z } from "zod";

export const startConversationSchema = z.object({
  listingId: z.string().min(1),
});

export const sendMessageSchema = z
  .object({
    conversationId: z.string().min(1),
    content: z.string().trim().max(2000).optional(),
    imageUrl: z.string().url().refine(
      (url) => url.includes(".supabase.co/storage/"),
      { message: "Image must be hosted on Supabase Storage" },
    ).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    offerAmount: z.number().positive().optional(),
  })
  .refine(
    (d) => Boolean(d.content || d.imageUrl || (d.latitude != null && d.longitude != null) || d.offerAmount),
    { message: "Message cannot be empty" },
  );

export const respondOfferSchema = z.object({
  messageId: z.string().min(1),
  status: z.enum(["accepted", "declined"]),
});

export const hideConversationsSchema = z.object({
  conversationIds: z.array(z.string().min(1)).min(1).max(50),
});

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type RespondOfferInput = z.infer<typeof respondOfferSchema>;
