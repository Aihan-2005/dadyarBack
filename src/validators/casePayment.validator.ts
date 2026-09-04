import { Types } from "mongoose";

import { z } from "zod";

import { env } from "../config/env";

import { PAYMENT_METHODS } from "../constants/casePayment.constants";

import { MESSAGES } from "../constants/messages.constants";
import {
  cleanOptionalString,
  MongoIdSchema,
  normalizePersianDigits,
} from "./common.validator";

const LANGUAGE = env.LANGUAGE;

// ---------------- Helpers ----------------

const normalizeMoneyInput = (value: string): string =>
  normalizePersianDigits(value)
    .replace(/[٬,\s]/g, "")
    .replace(/ریال|تومان|ت/g, "")
    .trim();

const MoneySchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    const normalized = normalizeMoneyInput(value);

    if (!normalized) {
      return value;
    }

    const parsed = Number(normalized);

    return Number.isFinite(parsed) ? parsed : value;
  },

  z.number().int().positive(),
);

const OptionalDescriptionSchema = cleanOptionalString(1000);

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
