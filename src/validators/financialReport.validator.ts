import { Types } from "mongoose";
import { z } from "zod";

import { env } from "../config/env";
import { MESSAGES } from "../constants/messages.constants";

const LANGUAGE = env.LANGUAGE;

const MongoIdSchema = z
  .string()
  .trim()
  .refine((value) => Types.ObjectId.isValid(value), {
    message: MESSAGES.invalidObjectId[LANGUAGE],
  });

export const FinancialClientReportQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),

    search: z.string().trim().optional(),
  })
  .strict();

export const FinancialClientCasesQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .strict();

export const FinancialClientIdParamSchema = z
  .object({
    clientId: MongoIdSchema,
  })
  .strict();
