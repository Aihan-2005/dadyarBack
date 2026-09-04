import { z } from "zod";
import { MongoIdSchema } from "./common.validator";

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

    paymentType: z.enum(["CASH", "NON_CASH", "BOTH"]).optional(),
  })
  .strict();

export const FinancialClientIdParamSchema = z
  .object({
    clientId: MongoIdSchema,
  })
  .strict();
