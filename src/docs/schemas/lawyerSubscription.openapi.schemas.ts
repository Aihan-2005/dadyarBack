import { z } from "zod";

import {
  LAWYER_SUBSCRIPTION_ACTIVATION_SOURCES,
  LAWYER_SUBSCRIPTION_STATUSES,
} from "../../constants/lawyerSubscription.constants";

import { openApiRegistry } from "../openapi.registry";

import {
  ApiErrorSchema,
  DateTimeResponseSchema,
  ObjectIdResponseSchema,
  PaginationSchema,
} from "./common.openapi";

import {
  SubscriptionFeatureCodeResponseSchema,
  SubscriptionTierResponseSchema,
} from "./subscriptionPlan.openapi.schemas";

// ========================================================
// Subscription Activation Source
// ========================================================

export const LawyerSubscriptionActivationSourceResponseSchema =
  openApiRegistry.register(
    "LawyerSubscriptionActivationSource",

    z.enum(LAWYER_SUBSCRIPTION_ACTIVATION_SOURCES),
  );

// ========================================================
// Subscription Status
// ========================================================

export const LawyerSubscriptionStatusResponseSchema = openApiRegistry.register(
  "LawyerSubscriptionStatus",

  z.enum(LAWYER_SUBSCRIPTION_STATUSES),
);

// ========================================================
// Plan Snapshot
// ========================================================

export const LawyerSubscriptionPlanSnapshotResponseSchema =
  openApiRegistry.register(
    "LawyerSubscriptionPlanSnapshot",

    z.object({
      title: z.string(),

      description: z.string(),

      tier: SubscriptionTierResponseSchema,

      tags: z.array(z.string()),

      durationMonths: z.number().int().positive(),

      price: z.number().int().nonnegative(),

      discountPercent: z.number().int().min(0).max(100),

      features: z.array(SubscriptionFeatureCodeResponseSchema),
    }),
  );

// ========================================================
// Lawyer Subscription
// ========================================================

export const LawyerSubscriptionResponseSchema = openApiRegistry.register(
  "LawyerSubscriptionResponse",

  z.object({
    _id: ObjectIdResponseSchema,

    lawyerId: ObjectIdResponseSchema,

    planId: ObjectIdResponseSchema,

    planSnapshot: LawyerSubscriptionPlanSnapshotResponseSchema,

    startsAt: DateTimeResponseSchema,

    endsAt: DateTimeResponseSchema,

    cancelledAt: DateTimeResponseSchema.nullable(),

    activationSource: LawyerSubscriptionActivationSourceResponseSchema,

    activatedByUserId: ObjectIdResponseSchema.nullable(),

    createdAt: DateTimeResponseSchema,

    updatedAt: DateTimeResponseSchema,

    status: LawyerSubscriptionStatusResponseSchema,
  }),
);

// ========================================================
// Single Subscription Response
// ========================================================

export const LawyerSubscriptionSuccessSchema = openApiRegistry.register(
  "LawyerSubscriptionSuccess",

  z.object({
    success: z.literal(true),

    data: LawyerSubscriptionResponseSchema,
  }),
);

// ========================================================
// Current Subscription Response
// ========================================================

export const CurrentLawyerSubscriptionSuccessSchema = openApiRegistry.register(
  "CurrentLawyerSubscriptionSuccess",

  z.object({
    success: z.literal(true),

    data: LawyerSubscriptionResponseSchema.nullable(),
  }),
);

// ========================================================
// Subscription History Response
// ========================================================

export const LawyerSubscriptionHistorySuccessSchema = openApiRegistry.register(
  "LawyerSubscriptionHistorySuccess",

  z.object({
    success: z.literal(true),

    data: z.array(LawyerSubscriptionResponseSchema),

    pagination: PaginationSchema,
  }),
);

export { ApiErrorSchema };
