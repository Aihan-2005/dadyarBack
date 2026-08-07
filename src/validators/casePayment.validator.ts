import { Types } from "mongoose";
import { z } from "zod";

import { env } from "../config/env";

import { PAYMENT_METHODS } from "../constants/casePayment.constants";

import { MESSAGES } from "../constants/messages.constants";

const LANGUAGE = env.LANGUAGE;

// ---------------- Helpers ----------------

export const MongoIdSchema = z
  .string()
  .trim()
  .refine((value) => Types.ObjectId.isValid(value), {
    message: MESSAGES.invalidObjectId[LANGUAGE],
  });

const normalizePersianDigits = (value: string): string =>
  value
    .replace(/[۰-۹]/g, (digit) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String("٠١٢٣٤٥٦٧٨٩".indexOf(digit)));

const MoneySchema = z.preprocess(
  (value) => {
    if (typeof value === "string" && value.trim() !== "") {
      return Number(normalizePersianDigits(value.trim()));
    }

    return value;
  },

  z.number().int().positive(),
);

const OptionalDescriptionSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value === "string") {
      const trimmed = value.trim();

      return trimmed === "" ? undefined : trimmed;
    }

    return value;
  },

  z.string().max(1000).optional(),
);

const OptionalDueDateSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    return value;
  },

  z.coerce.date().optional(),
);

// ---------------- Method ----------------

export const PaymentMethodSchema = z.enum(
  Object.values(PAYMENT_METHODS) as ["CASH", "NON_CASH"],
);

// ---------------- Case Payment Input ----------------

export const CasePaymentInputSchema = z
  .object({
    paymentId: MongoIdSchema.optional(),

    method: PaymentMethodSchema,

    amount: MoneySchema,

    description: OptionalDescriptionSchema,

    dueDate: OptionalDueDateSchema,

    isPaid: z.boolean(),
  })
  .strict()
  .superRefine((data, context) => {
    if (data.method === PAYMENT_METHODS.NON_CASH && !data.description) {
      context.addIssue({
        code: "custom",

        path: ["description"],

        message: MESSAGES.nonCashPaymentDescriptionRequired[LANGUAGE],
      });
    }
  });
