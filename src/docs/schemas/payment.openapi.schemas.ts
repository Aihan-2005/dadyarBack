import { z } from "zod";

import {
  PAYMENT_CURRENCIES,
  PAYMENT_FULFILLMENT_STATUSES,
  PAYMENT_PROVIDER_TRANSACTION_STATES,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
} from "../../constants/payment.constants";

import { openApiRegistry } from "../openapi.registry";

import {
  ApiErrorSchema,
  DateTimeResponseSchema,
  ObjectIdResponseSchema,
  PaginationSchema,
} from "./common.openapi";

import { SubscriptionTierResponseSchema } from "./subscriptionPlan.openapi.schemas";

export const PaymentStatusResponseSchema = openApiRegistry.register(
  "PaymentStatus",

  z.enum(PAYMENT_STATUSES),
);

export const PaymentFulfillmentStatusResponseSchema = openApiRegistry.register(
  "PaymentFulfillmentStatus",

  z.enum(PAYMENT_FULFILLMENT_STATUSES),
);

export const PaymentCurrencyResponseSchema = openApiRegistry.register(
  "PaymentCurrency",

  z.enum(PAYMENT_CURRENCIES),
);

export const PaymentProviderResponseSchema = openApiRegistry.register(
  "PaymentProvider",

  z.enum(PAYMENT_PROVIDERS),
);

export const PaymentProviderTransactionStateResponseSchema =
  openApiRegistry.register(
    "PaymentProviderTransactionState",

    z.enum(PAYMENT_PROVIDER_TRANSACTION_STATES),
  );

export const LawyerPaymentPlanResponseSchema = openApiRegistry.register(
  "LawyerPaymentPlan",

  z.object({
    id: ObjectIdResponseSchema,

    title: z.string(),

    tier: SubscriptionTierResponseSchema,

    durationMonths: z.number().int().positive(),
  }),
);

export const LawyerPaymentResponseSchema = openApiRegistry.register(
  "LawyerPaymentResponse",

  z.object({
    id: ObjectIdResponseSchema,

    plan: LawyerPaymentPlanResponseSchema,

    amount: z.number().int().nonnegative(),

    currency: PaymentCurrencyResponseSchema,

    status: PaymentStatusResponseSchema,

    fulfillmentStatus: PaymentFulfillmentStatusResponseSchema,

    referenceId: z.string().nullable(),

    cardPan: z.string().nullable(),

    paidAt: DateTimeResponseSchema.nullable(),

    cancelledAt: DateTimeResponseSchema.nullable(),

    failedAt: DateTimeResponseSchema.nullable(),

    reversedAt: DateTimeResponseSchema.nullable(),

    createdAt: DateTimeResponseSchema,
  }),
);

export const LawyerPaymentSuccessSchema = openApiRegistry.register(
  "LawyerPaymentSuccess",

  z.object({
    success: z.literal(true),

    data: LawyerPaymentResponseSchema,
  }),
);

export const LawyerPaymentListSuccessSchema = openApiRegistry.register(
  "LawyerPaymentListSuccess",

  z.object({
    success: z.literal(true),

    data: z.array(LawyerPaymentResponseSchema),

    pagination: PaginationSchema,
  }),
);

export const CreateSubscriptionPaymentResultSchema = openApiRegistry.register(
  "CreateSubscriptionPaymentResult",

  z.object({
    paymentId: ObjectIdResponseSchema,

    redirectUrl: z.url(),

    amount: z.number().int().nonnegative(),

    currency: PaymentCurrencyResponseSchema,
  }),
);

export const CreateSubscriptionPaymentSuccessSchema = openApiRegistry.register(
  "CreateSubscriptionPaymentSuccess",

  z.object({
    success: z.literal(true),

    data: CreateSubscriptionPaymentResultSchema,
  }),
);

export const AdminPaymentResponseSchema = openApiRegistry.register(
  "AdminPaymentResponse",

  LawyerPaymentResponseSchema.extend({
    lawyerId: ObjectIdResponseSchema,

    provider: PaymentProviderResponseSchema,

    authority: z.string().nullable(),

    providerRequestCode: z.number().int().nullable(),

    providerVerificationCode: z.number().int().nullable(),

    providerFee: z.number().nonnegative().nullable(),

    providerFeeType: z.string().nullable(),

    subscriptionId: ObjectIdResponseSchema.nullable(),

    fulfillmentErrorCode: z.string().nullable(),

    fulfillmentErrorMessage: z.string().nullable(),

    failureCode: z.string().nullable(),

    failureMessage: z.string().nullable(),

    fulfilledAt: DateTimeResponseSchema.nullable(),
  }),
);

export const AdminPaymentSuccessSchema = openApiRegistry.register(
  "AdminPaymentSuccess",

  z.object({
    success: z.literal(true),

    data: AdminPaymentResponseSchema,
  }),
);

export const AdminPaymentListSuccessSchema = openApiRegistry.register(
  "AdminPaymentListSuccess",

  z.object({
    success: z.literal(true),

    data: z.array(AdminPaymentResponseSchema),

    pagination: PaginationSchema,
  }),
);

export const PaymentReconciliationResultSchema = openApiRegistry.register(
  "PaymentReconciliationResult",

  z.object({
    reconciled: z.boolean(),

    providerState: PaymentProviderTransactionStateResponseSchema,

    rawProviderStatus: z.string().nullable().optional(),

    payment: AdminPaymentResponseSchema,
  }),
);

export const PaymentReconciliationSuccessSchema = openApiRegistry.register(
  "PaymentReconciliationSuccess",

  z.object({
    success: z.literal(true),

    data: PaymentReconciliationResultSchema,
  }),
);

export { ApiErrorSchema };
