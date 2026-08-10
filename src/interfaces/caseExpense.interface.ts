import { InferSchemaType } from "mongoose";

import { z } from "zod";

import { CaseExpenseSchema } from "../models/caseExpense.model";

import { CaseExpenseInputSchema } from "../validators/caseExpense.validator";

// ---------------- Database ----------------

export type CaseExpense = InferSchemaType<typeof CaseExpenseSchema> & {
  createdAt: Date;

  updatedAt: Date;
};

// ---------------- Validator Derived Types ----------------

export type CaseExpenseInput = z.infer<typeof CaseExpenseInputSchema>;

/*
 * Used internally when inserting
 * a new expense into MongoDB.
 *
 * New expenses don't have expenseId yet.
 */
export type CreateCaseExpenseInput = Omit<CaseExpenseInput, "expenseId">;
