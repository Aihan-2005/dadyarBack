import { z } from "zod";

import { MongoIdSchema } from "./common.validator";

export const CreateSubscriptionPaymentSchema = z
  .object({
    planId: MongoIdSchema,
  })
  .strict();
