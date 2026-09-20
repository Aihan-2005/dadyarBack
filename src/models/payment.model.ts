import { model, Schema } from "mongoose";

import {
  PAYMENT_CURRENCIES,
  PAYMENT_FULFILLMENT_STATUSES,
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
} from "../constants/payment.constants";

import { SubscriptionPlanSnapshotSchema } from "./subscriptionPlanSnapshot.schema";

export const PaymentSchema = new Schema(
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
      type: SubscriptionPlanSnapshotSchema,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    currency: {
      type: String,
      enum: PAYMENT_CURRENCIES,
      required: true,
      default: "IRR",
    },

    provider: {
      type: String,
      enum: PAYMENT_PROVIDERS,
      required: true,
    },

    status: {
      type: String,
      enum: PAYMENT_STATUSES,
      required: true,
      default: "PENDING",
    },

    authority: {
      type: String,
      trim: true,
    },

    referenceId: {
      type: String,
      trim: true,
    },

    providerRequestCode: {
      type: Number,
    },

    providerVerificationCode: {
      type: Number,
    },

    providerFee: {
      type: Number,
      min: 0,
    },

    providerFeeType: {
      type: String,
      trim: true,
    },

    cardPan: {
      type: String,
      trim: true,
    },

    cardHash: {
      type: String,
      trim: true,
    },

    subscriptionId: {
      type: Schema.Types.ObjectId,
      ref: "LawyerSubscription",
    },

    paidAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    failedAt: {
      type: Date,
      default: null,
    },

    failureCode: {
      type: String,
      trim: true,
    },

    failureMessage: {
      type: String,
      trim: true,
    },

    fulfillmentStatus: {
      type: String,
      enum: PAYMENT_FULFILLMENT_STATUSES,
      required: true,
      default: "PENDING",
    },

    fulfilledAt: {
      type: Date,
      default: null,
    },

    fulfillmentErrorCode: {
      type: String,
      trim: true,
    },

    fulfillmentErrorMessage: {
      type: String,
      trim: true,
    },
  },

  {
    timestamps: true,
  },
);

PaymentSchema.index({
  lawyerId: 1,
  createdAt: -1,
});

PaymentSchema.index(
  {
    provider: 1,
    authority: 1,
  },
  {
    unique: true,

    partialFilterExpression: {
      authority: {
        $type: "string",
      },
    },
  },
);

PaymentSchema.index(
  {
    provider: 1,
    referenceId: 1,
  },
  {
    unique: true,

    partialFilterExpression: {
      referenceId: {
        $type: "string",
      },
    },
  },
);

PaymentSchema.index(
  {
    subscriptionId: 1,
  },
  {
    unique: true,

    partialFilterExpression: {
      subscriptionId: {
        $type: "objectId",
      },
    },
  },
);

PaymentSchema.index({
  status: 1,
  createdAt: -1,
});

export const PaymentModel = model("Payment", PaymentSchema);
