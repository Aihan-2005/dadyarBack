import { model, Schema } from "mongoose";

import { PAYMENT_METHODS } from "../constants/casePayment.constants";

export const CasePaymentSchema = new Schema(
  {
    lawyerId: {
      type: Schema.Types.ObjectId,

      ref: "Lawyer",

      required: true,

      immutable: true,

      index: true,
    },

    caseId: {
      type: Schema.Types.ObjectId,

      ref: "Case",

      required: true,

      immutable: true,
    },

    clientId: {
      type: Schema.Types.ObjectId,

      ref: "LawyerClient",

      required: true,

      immutable: true,
    },

    method: {
      type: String,

      enum: Object.values(PAYMENT_METHODS),

      required: true,
    },

    amount: {
      type: Number,

      required: true,

      min: 1,
    },

    description: {
      type: String,

      trim: true,

      maxlength: 1000,
    },

    dueDate: {
      type: Date,
    },

    isPaid: {
      type: Boolean,

      required: true,

      default: false,

      // index: true,
    },
  },
  {
    timestamps: true,

    // versionKey: false,
  },
);

// ---------------- Indexes ----------------

CasePaymentSchema.index({
  lawyerId: 1,
  caseId: 1,
});

CasePaymentSchema.index({
  lawyerId: 1,
  clientId: 1,
});

CasePaymentSchema.index({
  lawyerId: 1,
  isPaid: 1,
  dueDate: 1,
});

CasePaymentSchema.index({
  lawyerId: 1,
  clientId: 1,
  isPaid: 1,
  dueDate: 1,
});

export const CasePaymentModel = model("CasePayment", CasePaymentSchema);
