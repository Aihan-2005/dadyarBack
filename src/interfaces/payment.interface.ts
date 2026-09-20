import type { InferSchemaType } from "mongoose";

import type { z } from "zod";

import type {
  PAYMENT_CURRENCIES,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
} from "../constants/payment.constants";

import { PaymentSchema } from "../models/payment.model";

import { CreateSubscriptionPaymentSchema } from "../validators/payment.validator";

export type Payment = InferSchemaType<typeof PaymentSchema>;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export type PaymentCurrency = (typeof PAYMENT_CURRENCIES)[number];

export type PaymentProvider = (typeof PAYMENT_PROVIDERS)[number];

export type PaymentPlanSnapshot = Payment["planSnapshot"];

export interface CreatePendingPaymentData {
  lawyerId: string;

  planId: Payment["planId"];

  planSnapshot: PaymentPlanSnapshot;

  amount: Payment["amount"];

  currency: PaymentCurrency;

  provider: PaymentProvider;
}

export type CreateSubscriptionPaymentInput = z.infer<
  typeof CreateSubscriptionPaymentSchema
>;
