import { z } from "zod";

import {
  SUBSCRIPTION_FEATURES,
  SUBSCRIPTION_TIERS,
} from "../../constants/subscription.constants";

import { openApiRegistry } from "../openapi.registry";

import {
  ApiErrorSchema,
  DateTimeResponseSchema,
  ObjectIdResponseSchema,
} from "./common.openapi";

// ========================================================
// Subscription Tier
// ========================================================

export const SubscriptionTierResponseSchema = openApiRegistry.register(
  "SubscriptionTier",

  z.enum(SUBSCRIPTION_TIERS),
);

// ========================================================
// Subscription Feature Code
// ========================================================

export const SubscriptionFeatureCodeResponseSchema = openApiRegistry.register(
  "SubscriptionFeatureCode",

  z.enum(SUBSCRIPTION_FEATURES),
);

// ========================================================
// Subscription Plan
// ========================================================

export const SubscriptionPlanResponseSchema = openApiRegistry.register(
  "SubscriptionPlanResponse",

  z.object({
    _id: ObjectIdResponseSchema,

    title: z.string(),

    description: z.string(),

    tier: SubscriptionTierResponseSchema,

    tags: z.array(z.string()),

    durationMonths: z.number().int().positive(),

    price: z.number().int().nonnegative(),

    discountPercent: z.number().int().min(0).max(100),

    features: z.array(SubscriptionFeatureCodeResponseSchema),

    isActive: z.boolean(),

    sortOrder: z.number().int().nonnegative(),

    createdAt: DateTimeResponseSchema,

    updatedAt: DateTimeResponseSchema,
  }),
);

// ========================================================
// Single Subscription Plan Response
// ========================================================

export const SubscriptionPlanSuccessSchema = openApiRegistry.register(
  "SubscriptionPlanSuccess",

  z.object({
    success: z.literal(true),

    data: SubscriptionPlanResponseSchema,
  }),
);

// ========================================================
// Subscription Plan List Response
// ========================================================

export const SubscriptionPlanListSuccessSchema = openApiRegistry.register(
  "SubscriptionPlanListSuccess",

  z.object({
    success: z.literal(true),

    data: z.array(SubscriptionPlanResponseSchema),
  }),
);

// ========================================================
// Subscription Feature Option
// ========================================================

export const SubscriptionFeatureOptionSchema = openApiRegistry.register(
  "SubscriptionFeatureOption",

  z.object({
    code: SubscriptionFeatureCodeResponseSchema,

    title: z.string(),

    description: z.string(),
  }),
);

// ========================================================
// Subscription Plan Options
// ========================================================

export const SubscriptionPlanOptionsSchema = openApiRegistry.register(
  "SubscriptionPlanOptions",

  z.object({
    tiers: z.array(SubscriptionTierResponseSchema),

    features: z.array(SubscriptionFeatureOptionSchema),
  }),
);

// ========================================================
// Subscription Plan Options Response
// ========================================================

export const SubscriptionPlanOptionsSuccessSchema = openApiRegistry.register(
  "SubscriptionPlanOptionsSuccess",

  z.object({
    success: z.literal(true),

    data: SubscriptionPlanOptionsSchema,
  }),
);

export { ApiErrorSchema };
