import {
  z,
} from "zod";

import {
  SUBSCRIPTION_FEATURES,
  SUBSCRIPTION_TIERS,
} from "../constants/subscription.constants";

import {
  MongoIdSchema,
  RequiredString,
} from "./common.validator";

const TitleSchema =
  RequiredString.max(
    120,
  );

const DescriptionSchema =
  RequiredString.max(
    2000,
  );

const TagSchema =
  z
    .string()
    .trim()
    .min(
      1,
    )
    .max(
      50,
    );

const TagsSchema =
  z
    .array(
      TagSchema,
    )
    .max(
      10,
    )
    .refine(
      (
        tags,
      ) =>
        new Set(
          tags.map(
            (
              tag,
            ) =>
              tag.toLowerCase(),
          ),
        ).size ===
        tags.length,

      {
        message:
          "Tags must be unique",
      },
    );

const TierSchema =
  z.enum(
    SUBSCRIPTION_TIERS,
  );

const FeatureSchema =
  z.enum(
    SUBSCRIPTION_FEATURES,
  );

const FeaturesSchema =
  z
    .array(
      FeatureSchema,
    )
    .min(
      1,
    )
    .max(
      SUBSCRIPTION_FEATURES.length,
    )
    .refine(
      (
        features,
      ) =>
        new Set(
          features,
        ).size ===
        features.length,

      {
        message:
          "Features must be unique",
      },
    );

const DurationDaysSchema =
  z
    .number()
    .int()
    .min(
      1,
    )
    .max(
      3600,
    );

 
const DurationMonthsInputSchema =
  z
    .number()
    .positive()
    .max(
      120,
    );

const PriceSchema =
  z
    .number()
    .int()
    .nonnegative();

const DiscountPercentSchema =
  z
    .number()
    .int()
    .min(
      0,
    )
    .max(
      100,
    );

const SortOrderSchema =
  z
    .number()
    .int()
    .nonnegative();


export const CreateSubscriptionPlanSchema =
  z
    .object({
      title:
        TitleSchema,

      description:
        DescriptionSchema,

      tier:
        TierSchema,

      tags:
        TagsSchema.default(
          [],
        ),

      durationDays:
        DurationDaysSchema.optional(),

      durationMonths:
        DurationMonthsInputSchema.optional(),

      price:
        PriceSchema,

      discountPercent:
        DiscountPercentSchema.default(
          0,
        ),

      features:
        FeaturesSchema,

      isActive:
        z
          .boolean()
          .default(
            true,
          ),

      sortOrder:
        SortOrderSchema.default(
          0,
        ),
    })
    .strict()
    .superRefine(
      (
        data,
        ctx,
      ) => {
        const hasDays =
          data.durationDays !==
          undefined;

        const hasMonths =
          data.durationMonths !==
          undefined;

        if (
          hasDays ===
          hasMonths
        ) {
          ctx.addIssue({
            code:
              "custom",

            message:
              "Provide exactly one of durationDays or durationMonths",

            path: [
              "durationDays",
            ],
          });
        }
      },
    )
    .transform(
      (
        data,
      ) => {
        const durationDays =
          data.durationDays ??
          Math.round(
            data.durationMonths! *
              30,
          );

        const {
          durationDays:
            _durationDays,

          durationMonths:
            _durationMonths,

          ...rest
        } =
          data;

        return {
          ...rest,

          durationDays,

         
          durationMonths:
            durationDays /
            30,
        };
      },
    );


export const UpdateSubscriptionPlanSchema =
  z
    .object({
      title:
        TitleSchema.optional(),

      description:
        DescriptionSchema.optional(),

      tier:
        TierSchema.optional(),

      tags:
        TagsSchema.optional(),

      durationDays:
        DurationDaysSchema.optional(),

      durationMonths:
        DurationMonthsInputSchema.optional(),

      price:
        PriceSchema.optional(),

      discountPercent:
        DiscountPercentSchema.optional(),

      features:
        FeaturesSchema.optional(),

      isActive:
        z
          .boolean()
          .optional(),

      sortOrder:
        SortOrderSchema.optional(),
    })
    .strict()
    .superRefine(
      (
        data,
        ctx,
      ) => {
        if (
          Object.keys(
            data,
          ).length ===
          0
        ) {
          ctx.addIssue({
            code:
              "custom",

            message:
              "At least one field must be provided",
          });
        }

        if (
          data.durationDays !==
            undefined &&
          data.durationMonths !==
            undefined
        ) {
          ctx.addIssue({
            code:
              "custom",

            message:
              "Provide only one of durationDays or durationMonths",

            path: [
              "durationDays",
            ],
          });
        }
      },
    )
    .transform(
      (
        data,
      ) => {
        const {
          durationDays,
          durationMonths,
          ...rest
        } =
          data;

        if (
          durationDays ===
            undefined &&
          durationMonths ===
            undefined
        ) {
          return rest;
        }

        const normalizedDays =
          durationDays ??
          Math.round(
            durationMonths! *
              30,
          );

        return {
          ...rest,

          durationDays:
            normalizedDays,

         
          durationMonths:
            normalizedDays /
            30,
        };
      },
    );


export const SubscriptionPlanIdParamSchema =
  z.object({
    id:
      MongoIdSchema,
  });