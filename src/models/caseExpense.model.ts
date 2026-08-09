import { model, Schema } from "mongoose";

export const CaseExpenseSchema = new Schema(
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

    title: {
      type: String,

      required: true,

      trim: true,

      maxlength: 200,
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

    expenseDate: {
      type: Date,
    },

    isPaid: {
      type: Boolean,

      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// ---------------- Indexes ----------------

CaseExpenseSchema.index({
  lawyerId: 1,
  caseId: 1,
});

CaseExpenseSchema.index({
  lawyerId: 1,
  isPaid: 1,
  expenseDate: 1,
});

export const CaseExpenseModel = model("CaseExpense", CaseExpenseSchema);
