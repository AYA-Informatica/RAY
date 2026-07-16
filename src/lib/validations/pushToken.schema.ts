import { z } from "zod";

export const pushTokenSchema = z.object({
  token: z.string().trim().min(1).max(200),
});

export type PushTokenInput = z.infer<typeof pushTokenSchema>;
