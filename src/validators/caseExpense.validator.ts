import { Types } from "mongoose";
import { z } from "zod";

import { env } from "../config/env";
import { MESSAGES } from "../constants/messages.constants";

const LANGUAGE = env.LANGUAGE;

// ---------------- Helpers ----------------

const MongoIdSchema = z
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

const RequiredTitleSchema = z.string().trim().min(1).max(200);

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

const OptionalExpenseDateSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    return value;
  },

  z.coerce.date().optional(),
);

// ---------------- Expense Input ----------------

export const CaseExpenseInputSchema = z
  .object({
    /*
     * Existing expense:
     * expenseId exists.
     *
     * New expense:
     * expenseId does not exist.
     */
    expenseId: MongoIdSchema.optional(),

    title: RequiredTitleSchema,

    amount: MoneySchema,

    description: OptionalDescriptionSchema,

    expenseDate: OptionalExpenseDateSchema,

    isPaid: z.boolean(),
  })
  .strict();
