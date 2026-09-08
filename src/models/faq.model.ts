import { model, Schema } from "mongoose";

export const FAQSchema = new Schema(
  {
    question: {
      type: String,
      require: true,
    },

    answer: {
      type: String,
      require: true,
    },
  },
  {
    timestamps: true,
  },
);

export const FAQModel = model("FAQ", FAQSchema);
