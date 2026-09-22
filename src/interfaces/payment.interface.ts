import type { InferSchemaType } from "mongoose";

import type { z } from "zod";

import type {
  PAYMENT_CURRENCIES,
  PAYMENT_FULFILLMENT_STATUSES,
  PAYMENT_PROVIDER_TRANSACTION_STATES,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
} from "../constants/payment.constants";

import { PaymentSchema } from "../models/payment.model";

import {
  AdminPaymentListQuerySchema,
  CreateSubscriptionPaymentSchema,
  PaymentHistoryQuerySchema,
  ZarinPalCallbackQuerySchema,
} from "../validators/payment.validator";

import type { PaymentProviderName } from "./paymentProvider.interface";

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

export type PaymentFulfillmentStatus =
  (typeof PAYMENT_FULFILLMENT_STATUSES)[number];

export type ZarinPalCallbackInput = z.output<
  typeof ZarinPalCallbackQuerySchema
>;

export interface PaymentVerificationData {
  providerVerificationCode: number;

  referenceId: string | null;

  cardPan: string | null;

  cardHash: string | null;

  providerFee: number | null;

  providerFeeType: string | null;
}

export type PaymentHistoryOptions = z.output<typeof PaymentHistoryQuerySchema>;

export type AdminPaymentListOptions = z.output<
  typeof AdminPaymentListQuerySchema
>;

export type PaymentProviderTransactionState =
  (typeof PAYMENT_PROVIDER_TRANSACTION_STATES)[number];

export interface InquirePaymentInput {
  authority: string;
}

export interface InquirePaymentResult {
  provider: PaymentProviderName;

  providerCode: number;

  state: PaymentProviderTransactionState;

  rawStatus: string | null;

  authority: string;

  amount: number | null;

  refId: string | null;
}
