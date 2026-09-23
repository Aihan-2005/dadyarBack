import {
  model,
  Schema,
} from "mongoose";

export const DEFAULT_TRIAL_DAYS =
  14;

export const MAX_TRIAL_DAYS =
  365;

export const SubscriptionSettingsSchema =
  new Schema(
    {
      key: {
        type:
          String,

        enum: [
          "GLOBAL",
        ],

        required:
          true,

        unique:
          true,

        immutable:
          true,

        default:
          "GLOBAL",
      },

      trialDays: {
        type:
          Number,

        required:
          true,

        min:
          1,

        max:
          MAX_TRIAL_DAYS,

        default:
          DEFAULT_TRIAL_DAYS,
      },
    },

    {
      timestamps:
        true,

      versionKey:
        false,
    },
  );

export const SubscriptionSettingsModel =
  model(
    "SubscriptionSettings",

    SubscriptionSettingsSchema,
  );