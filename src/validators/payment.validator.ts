import { z } from "zod";

import { MongoIdSchema } from "./common.validator";

export const CreateSubscriptionPaymentSchema = z
  .object({
    planId: MongoIdSchema,
  })
  .strict();

export const ZarinPalCallbackQuerySchema = z.object({
  Authority: z
    .string()
    .trim()
    .regex(/^[AS][0-9a-zA-Z]{35}$/),

  Status: z.enum(["OK", "NOK"]),
});
