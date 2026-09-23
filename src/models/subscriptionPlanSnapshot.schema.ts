import {
  Schema,
} from "mongoose";

import {
  SUBSCRIPTION_FEATURES,
  SUBSCRIPTION_TIERS,
} from "../constants/subscription.constants";

const SUBSCRIPTION_SNAPSHOT_TIERS =
  [
    ...SUBSCRIPTION_TIERS,
    "TRIAL",
  ] as const;

export const SubscriptionPlanSnapshotSchema =
  new Schema(
    {
      title: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      description: {
        type:
          String,

        required:
          true,

        trim:
          true,
      },

      tier: {
        type:
          String,

        enum:
          SUBSCRIPTION_SNAPSHOT_TIERS,

        required:
          true,
      },

      tags: {
        type: [
          String,
        ],

        default:
          [],
      },

      durationDays: {
        type:
          Number,

        min:
          1,

        default:
          undefined,
      },
 
      durationMonths: {
        type:
          Number,

        min:
          1 / 30,

        default:
          undefined,
      },

      price: {
        type:
          Number,

        required:
          true,

        min:
          0,
      },

      discountPercent: {
        type:
          Number,

        required:
          true,

        min:
          0,

        max:
          100,
      },

      features: {
        type: [
          {
            type:
              String,

            enum:
              SUBSCRIPTION_FEATURES,
          },
        ],

        required:
          true,
      },
    },

    {
      _id:
        false,
    },
  );