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
