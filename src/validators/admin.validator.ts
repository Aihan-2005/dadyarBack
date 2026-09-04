import { Types } from "mongoose";

import { z } from "zod";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

const LANGUAGE = env.LANGUAGE;

export const MongoIdSchema = z
  .string()
  .trim()
  .refine(
    (value) => Types.ObjectId.isValid(value),

    {
      message: MESSAGES.invalidObjectId[LANGUAGE],
    },
  );

export const AdminUserListQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const AdminUserIdParamSchema = z
  .object({
    id: MongoIdSchema,
  })
  .strict();
