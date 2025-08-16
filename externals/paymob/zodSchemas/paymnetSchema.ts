import { z } from "zod";

export const paymobWebhookSchema = z.object({
  type: z.literal("TRANSACTION"),
  obj: z.object({
    id: z.number(),
    success: z.boolean(),
    amount_cents: z.number(),
    special_reference: z.string().optional(), 
    payment_key_claims: z.object({
      next_payment_intention: z.string().optional(),
    }).optional(),
  }),
});

export const paymobIntentionResponseSchema = z.object({
  id: z.string(),
  intention_order_id: z.number(),
  client_secret: z.string(),
  status: z.string(),
  created: z.string(),
  special_reference: z.string().optional(), 
});

export type PaymobWebhookZOD = z.infer<typeof paymobWebhookSchema>;
export type PaymobIntentionResponseZOD = z.infer<typeof paymobIntentionResponseSchema>;