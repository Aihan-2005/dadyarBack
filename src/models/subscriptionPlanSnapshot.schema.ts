import { Schema } from "mongoose";

import {
  SUBSCRIPTION_FEATURES,
  SUBSCRIPTION_TIERS,
} from "../constants/subscription.constants";

export const SubscriptionPlanSnapshotSchema = new Schema(
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
      required: true,
      min: 0,
      max: 100,
    },

    features: {
      type: [
        {
          type: String,
          enum: SUBSCRIPTION_FEATURES,
        },
      ],

      required: true,
    },
  },

  {
    _id: false,
  },
);
