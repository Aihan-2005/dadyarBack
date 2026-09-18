import { model, Schema } from "mongoose";

import {
  DEFAULT_SUBSCRIPTION_PLAN_ACTIVE,
  DEFAULT_SUBSCRIPTION_PLAN_DISCOUNT_PERCENT,
  DEFAULT_SUBSCRIPTION_PLAN_SORT_ORDER,
  SUBSCRIPTION_FEATURES,
  SUBSCRIPTION_TIERS,
} from "../constants/subscription.constants";

export const SubscriptionPlanSchema = new Schema(
  {
    title: {
      type: String,

      required: true,

      trim: true,
    },

    description: {
      type: String,

      required: true,

      trim: true,
    },

    tier: {
      type: String,

      enum: SUBSCRIPTION_TIERS,

      required: true,
    },

    tags: {
      type: [String],

      default: [],
    },

    durationMonths: {
      type: Number,

      required: true,

      min: 1,
    },

    price: {
      type: Number,

      required: true,

      min: 0,
    },

    discountPercent: {
      type: Number,

      min: 0,

      max: 100,

      default: DEFAULT_SUBSCRIPTION_PLAN_DISCOUNT_PERCENT,
    },

    features: {
      type: [
        {
          type: String,

          enum: SUBSCRIPTION_FEATURES,
        },
      ],

      required: true,

      default: [],
    },

    isActive: {
      type: Boolean,

      default: DEFAULT_SUBSCRIPTION_PLAN_ACTIVE,
    },

    sortOrder: {
      type: Number,

      min: 0,

      default: DEFAULT_SUBSCRIPTION_PLAN_SORT_ORDER,
    },
  },

  {
    timestamps: true,

    // versionKey: false,
  },
);

SubscriptionPlanSchema.index({
  isActive: 1,

  sortOrder: 1,
});

export const SubscriptionPlanModel = model(
  "SubscriptionPlan",
  SubscriptionPlanSchema,
);
