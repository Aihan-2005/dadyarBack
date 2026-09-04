import { z } from "zod";

import {
  cleanOptionalString,
  MongoIdSchema,
  normalizePersianDigits,
} from "./commen.validator";

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

const RequiredTitleSchema = z.string().trim().min(1).max(200);

const OptionalDescriptionSchema = cleanOptionalString(1000);

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
    /**
     * Existing expense:
     * expenseId exists.
     *
     * New expense:
     * expenseId does not exist.
     */
    expenseId: MongoIdSchema.optional(),

    /**
     * UI now uses one combined
     * "عنوان هزینه / توضیحات" field.
     * The value is stored as title.
     */
    title: RequiredTitleSchema,

    amount: MoneySchema,

    description: OptionalDescriptionSchema,

    expenseDate: OptionalExpenseDateSchema,

    isPaid: z.boolean(),
  })
  .strict();

