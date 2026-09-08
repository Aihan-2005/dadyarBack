import { z } from "zod";
import { MongoIdSchema, RequiredString } from "./common.validator";

export const CreateFAQSchema = z.object({
  question: RequiredString,
  answer: RequiredString,
});

export const ListFAQSchema = z
  .object({
    search: z.string().trim().max(200).optional(),

    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const ParamFAQIdSchema = z.object({
  id: MongoIdSchema,
});
