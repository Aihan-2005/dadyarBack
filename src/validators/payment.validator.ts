import { z } from "zod";

import { MongoIdSchema } from "./common.validator";

import {
  PAYMENT_FULFILLMENT_STATUSES,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
} from "../constants/payment.constants";

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

export const PaymentHistoryQuerySchema = z
  .object({
    status: z.enum(PAYMENT_STATUSES).optional(),

    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const AdminPaymentListQuerySchema = z
  .object({
    lawyerId: MongoIdSchema.optional(),

    status: z.enum(PAYMENT_STATUSES).optional(),

    fulfillmentStatus: z.enum(PAYMENT_FULFILLMENT_STATUSES).optional(),

    provider: z.enum(PAYMENT_PROVIDERS).optional(),

    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();

export const PaymentIdParamSchema = z
  .object({
    id: MongoIdSchema,
  })
  .strict();
