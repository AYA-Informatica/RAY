import { z } from "zod";

export const startConversationSchema = z.object({
  listingId: z.string().min(1),
});

export const sendMessageSchema = z
  .object({
    conversationId: z.string().min(1),
    content: z.string().trim().max(2000).optional(),
    imageUrl: z.string().url().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
  })
  .refine(
    (d) => Boolean(d.content || d.imageUrl || (d.latitude != null && d.longitude != null)),
    { message: "Message cannot be empty" },
  );

export type SendMessageInput = z.infer<typeof sendMessageSchema>;
