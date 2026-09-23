import {
  model,
  Schema,
} from "mongoose";

import {
  LAWYER_SUBSCRIPTION_ACTIVATION_SOURCES,
} from "../constants/lawyerSubscription.constants";

import {
  SubscriptionPlanSnapshotSchema,
} from "./subscriptionPlanSnapshot.schema";

export const LawyerSubscriptionSchema =
  new Schema(
    {
      lawyerId: {
        type:
          Schema.Types.ObjectId,

        ref:
          "Lawyer",

        required:
          true,
      },

     
      planId: {
        type:
          Schema.Types.ObjectId,

        ref:
          "SubscriptionPlan",

        default:
          null,
      },

      planSnapshot: {
        type:
          SubscriptionPlanSnapshotSchema,

        required:
          true,
      },

      startsAt: {
        type:
          Date,

        required:
          true,
      },

      endsAt: {
        type:
          Date,

        required:
          true,
      },

      cancelledAt: {
        type:
          Date,

        default:
          null,
      },

      activationSource: {
        type:
          String,

        enum:
          LAWYER_SUBSCRIPTION_ACTIVATION_SOURCES,

        required:
          true,
      },

      activatedByUserId: {
        type:
          Schema.Types.ObjectId,

        ref:
          "User",

        default:
          null,
      },
    },

    {
      timestamps:
        true,
    },
  );

LawyerSubscriptionSchema.index({
  lawyerId:
    1,

  createdAt:
    -1,
});

LawyerSubscriptionSchema.index({
  lawyerId:
    1,

  cancelledAt:
    1,

  endsAt:
    1,
});

export const LawyerSubscriptionModel =
  model(
    "LawyerSubscription",

    LawyerSubscriptionSchema,
  );