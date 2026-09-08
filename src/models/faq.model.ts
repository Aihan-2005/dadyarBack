import { model, Schema } from "mongoose";

export const FAQSchema = new Schema(
  {
    question: {
      type: String,
      required: true,
    },

    answer: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

export const FAQModel = model("FAQ", FAQSchema);
