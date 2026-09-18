import { z } from "zod";

import {
  SUBSCRIPTION_FEATURES,
  SUBSCRIPTION_TIERS,
} from "../constants/subscription.constants";

import { MongoIdSchema, RequiredString } from "./common.validator";

const TitleSchema = RequiredString.max(120);

const DescriptionSchema = RequiredString.max(2000);

const TagSchema = z.string().trim().min(1).max(50);

const TagsSchema = z
  .array(TagSchema)
  .max(10)
  .refine(
    (tags) =>
      new Set(tags.map((tag) => tag.toLowerCase())).size === tags.length,

    {
      message: "Tags must be unique",
    },
  );

const TierSchema = z.enum(SUBSCRIPTION_TIERS);

const FeatureSchema = z.enum(SUBSCRIPTION_FEATURES);

const FeaturesSchema = z
  .array(FeatureSchema)
  .min(1)
  .max(SUBSCRIPTION_FEATURES.length)
  .refine(
    (features) => new Set(features).size === features.length,

    {
      message: "Features must be unique",
    },
  );

const DurationMonthsSchema = z.number().int().min(1).max(120);

const PriceSchema = z.number().int().nonnegative();

const DiscountPercentSchema = z.number().int().min(0).max(100);

const SortOrderSchema = z.number().int().nonnegative();

export const CreateSubscriptionPlanSchema = z
  .object({
    title: TitleSchema,

    description: DescriptionSchema,

    tier: TierSchema,

    tags: TagsSchema.default([]),

    durationMonths: DurationMonthsSchema,

    price: PriceSchema,

    discountPercent: DiscountPercentSchema.default(0),

    features: FeaturesSchema,

    isActive: z.boolean().default(true),

    sortOrder: SortOrderSchema.default(0),
  })
  .strict();

export const UpdateSubscriptionPlanSchema = z
  .object({
    title: TitleSchema.optional(),

    description: DescriptionSchema.optional(),

    tier: TierSchema.optional(),

    tags: TagsSchema.optional(),

    durationMonths: DurationMonthsSchema.optional(),

    price: PriceSchema.optional(),

    discountPercent: DiscountPercentSchema.optional(),

    features: FeaturesSchema.optional(),

    isActive: z.boolean().optional(),

    sortOrder: SortOrderSchema.optional(),
  })
  .strict()
  .refine(
    (data) => Object.keys(data).length > 0,

    {
      message: "At least one field must be provided",
    },
  );

export const SubscriptionPlanIdParamSchema = z.object({
  id: MongoIdSchema,
});
