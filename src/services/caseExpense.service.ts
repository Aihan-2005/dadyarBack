import type { ClientSession, UpdateQuery } from "mongoose";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import type {
  CaseExpense,
  CaseExpenseInput,
  CreateCaseExpenseInput,
} from "../interfaces/caseExpense.interface";

import { CaseExpenseRepository } from "../repositories/caseExpense.repository";

const LANGUAGE = env.LANGUAGE;

export class CaseExpenseService {
  constructor(private readonly repository = new CaseExpenseRepository()) {}

  // ---------------- Helpers ----------------

  private normalizeOptionalString(value?: string | null): string | undefined {
    return value?.trim() || undefined;
  }

  private buildExpenseUpdate(
    expense: CaseExpenseInput,
  ): UpdateQuery<CaseExpense> {
    const setFields: Record<string, unknown> = {
      title: expense.title.trim(),

      amount: expense.amount,

      isPaid: expense.isPaid,
    };

    const unsetFields: Record<string, 1> = {};

    // ---------------- Description ----------------

    const description = this.normalizeOptionalString(expense.description);

    if (description) {
      setFields.description = description;
    } else {
      unsetFields.description = 1;
    }

    // ---------------- Expense Date ----------------

    if (expense.expenseDate) {
      setFields.expenseDate = expense.expenseDate;
    } else {
      unsetFields.expenseDate = 1;
    }

    // ---------------- Build Query ----------------

    const update: UpdateQuery<CaseExpense> = {
      $set: setFields,
    };

    if (Object.keys(unsetFields).length > 0) {
      update.$unset = unsetFields;
    }

    return update;
  }

  // ---------------- Read ----------------

  public getCaseExpenses(
    lawyerId: string,
    caseId: string,
    session?: ClientSession,
  ) {
    return this.repository.findByCaseIdForLawyer(lawyerId, caseId, session);
  }

  // ---------------- Sync ----------------

  public async syncCaseExpenses(
    lawyerId: string,
    caseId: string,
    expenses: CaseExpenseInput[],
    session: ClientSession,
  ): Promise<void> {
    const existingExpenses = await this.repository.findByCaseIdForLawyer(
      lawyerId,
      caseId,
      session,
    );

    /*
     * Allows us to quickly determine whether
     * a submitted expenseId actually belongs
     * to this lawyer + case.
     */
    const existingById = new Map(
      existingExpenses.map((expense) => [expense._id.toString(), expense]),
    );

    /*
     * IDs which are present in the submitted
     * desired final state.
     */
    const retainedExpenseIds = new Set<string>();

    /*
     * Prevent submitting the same existing
     * expense twice in one request.
     */
    const submittedExpenseIds = new Set<string>();

    for (const expense of expenses) {
      // ---------------- Existing Expense ----------------

      if (expense.expenseId) {
        if (submittedExpenseIds.has(expense.expenseId)) {
          throw new HttpException(
            400,

            MESSAGES.duplicateExpenseInRequest[LANGUAGE],

            "DUPLICATE_EXPENSE_IN_REQUEST",
          );
        }

        submittedExpenseIds.add(expense.expenseId);

        const existingExpense = existingById.get(expense.expenseId);

        /*
         * An expense ID from another case or
         * another lawyer must never be accepted.
         */
        if (!existingExpense) {
          throw new HttpException(
            404,

            MESSAGES.expenseNotFound[LANGUAGE],

            "EXPENSE_NOT_FOUND",
          );
        }

        const updated = await this.repository.updateByIdForCaseForLawyer(
          lawyerId,
          caseId,
          expense.expenseId,
          this.buildExpenseUpdate(expense),
          session,
        );

        if (!updated) {
          throw new HttpException(
            404,

            MESSAGES.expenseNotFound[LANGUAGE],

            "EXPENSE_NOT_FOUND",
          );
        }

        retainedExpenseIds.add(expense.expenseId);

        continue;
      }

      // ---------------- New Expense ----------------

      const { expenseId: _expenseId, ...expenseData } = expense;

      const createData: CreateCaseExpenseInput = {
        ...expenseData,

        title: expenseData.title.trim(),

        description: this.normalizeOptionalString(expenseData.description),
      };

      await this.repository.create(lawyerId, caseId, createData, session);
    }

    // ---------------- Delete Removed Expenses ----------------

    /*
     * Any expense which existed before but
     * was not present in the submitted array
     * has been removed by the user.
     */
    const expenseIdsToDelete = existingExpenses
      .filter((expense) => !retainedExpenseIds.has(expense._id.toString()))
      .map((expense) => expense._id.toString());

    await this.repository.deleteManyByIdsForCaseForLawyer(
      lawyerId,
      caseId,
      expenseIdsToDelete,
      session,
    );
  }
}
