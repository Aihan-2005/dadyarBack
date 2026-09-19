import { model, Schema } from "mongoose";

import { LAWYER_SUBSCRIPTION_ACTIVATION_SOURCES } from "../constants/lawyerSubscription.constants";

import {
  SUBSCRIPTION_FEATURES,
  SUBSCRIPTION_TIERS,
} from "../constants/subscription.constants";

const LawyerSubscriptionPlanSnapshotSchema = new Schema(
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

export const LawyerSubscriptionSchema = new Schema(
  {
    lawyerId: {
      type: Schema.Types.ObjectId,

      ref: "Lawyer",

      required: true,
    },

    planId: {
      type: Schema.Types.ObjectId,

      ref: "SubscriptionPlan",

      required: true,
    },

    planSnapshot: {
      type: LawyerSubscriptionPlanSnapshotSchema,

      required: true,
    },

    startsAt: {
      type: Date,

      required: true,
    },

    endsAt: {
      type: Date,

      required: true,
    },

    cancelledAt: {
      type: Date,

      default: null,
    },

    activationSource: {
      type: String,

      enum: LAWYER_SUBSCRIPTION_ACTIVATION_SOURCES,

      required: true,
    },

    activatedByUserId: {
      type: Schema.Types.ObjectId,

      ref: "User",

      default: null,
    },
  },

  {
    timestamps: true,
  },
);

LawyerSubscriptionSchema.index({
  lawyerId: 1,

  createdAt: -1,
});

LawyerSubscriptionSchema.index({
  lawyerId: 1,

  cancelledAt: 1,

  endsAt: 1,
});

export const LawyerSubscriptionModel = model(
  "LawyerSubscription",
  LawyerSubscriptionSchema,
);
