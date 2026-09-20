import { z } from "zod";

import { MongoIdSchema } from "./common.validator";

export const CreateLawyerSubscriptionSchema = z
  .object({
    planId: MongoIdSchema,
  })
  .strict();

export const LawyerSubscriptionLawyerIdParamSchema = z
  .object({
    id: MongoIdSchema,
  })
  .strict();

export const LawyerSubscriptionHistoryQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();
