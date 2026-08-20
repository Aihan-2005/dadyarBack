import type {
  ClientSession,
  UpdateQuery,
} from "mongoose";

import {
  env,
} from "../config/env";

import {
  MESSAGES,
} from "../constants/messages.constants";

import {
  HttpException,
} from "../exceptions/httpException";

import type {
  CaseExpense,
  CaseExpenseInput,
  CreateCaseExpenseInput,
} from "../interfaces/caseExpense.interface";

import {
  CaseExpenseRepository,
} from "../repositories/caseExpense.repository";

const LANGUAGE =
  env.LANGUAGE;

export class CaseExpenseService {
  constructor(
    private readonly repository =
      new CaseExpenseRepository()
  ) {}

  private normalizeOptionalString(
    value?:
      | string
      | null
  ): string | undefined {
    return (
      value?.trim() ||
      undefined
    );
  }

  private buildExpenseUpdate(
    expense:
      CaseExpenseInput
  ): UpdateQuery<CaseExpense> {
    const setFields:
      Record<
        string,
        unknown
      > = {
        title:
          expense.title.trim(),

        amount:
          expense.amount,

        isPaid:
          expense.isPaid,
      };

    const unsetFields:
      Record<
        string,
        1
      > = {};

    const description =
      this.normalizeOptionalString(
        expense.description
      );

    if (description) {
      setFields.description =
        description;
    } else {
      unsetFields.description =
        1;
    }

    if (
      expense.expenseDate
    ) {
      setFields.expenseDate =
        expense.expenseDate;
    } else {
      unsetFields.expenseDate =
        1;
    }

    const update:
      UpdateQuery<CaseExpense> = {
        $set:
          setFields,
      };

    if (
      Object.keys(
        unsetFields
      ).length >
      0
    ) {
      update.$unset =
        unsetFields;
    }

    return update;
  }

  public getCaseExpenses(
    lawyerId:
      string,

    caseId:
      string,

    session?:
      ClientSession
  ) {
    return this.repository
      .findByCaseIdForLawyer(
        lawyerId,
        caseId,
        session
      );
  }

  public getCasesExpenses(
    lawyerId:
      string,

    caseIds:
      string[],

    session?:
      ClientSession
  ) {
    return this.repository
      .findByCaseIdsForLawyer(
        lawyerId,
        caseIds,
        session
      );
  }

  /**
   * Synchronizes all expenses of a case.
   *
   * - expenseId => update existing expense.
   * - no id     => create a new expense.
   * - existing id omitted from the submitted array => delete it.
   *
   * The whole request is validated before any write is executed.
   */
  public async syncCaseExpenses(
    lawyerId:
      string,

    caseId:
      string,

    expenses:
      CaseExpenseInput[],

    session:
      ClientSession
  ): Promise<void> {
    const existingExpenses =
      await this.repository
        .findByCaseIdForLawyer(
          lawyerId,
          caseId,
          session
        );

    const existingById =
      new Map(
        existingExpenses.map(
          (expense) => [
            expense._id.toString(),
            expense,
          ]
        )
      );

    const retainedExpenseIds =
      new Set<string>();

    const submittedExpenseIds =
      new Set<string>();

    /*
     * Preflight validation.
     */
    for (
      const expense of
      expenses
    ) {
      if (
        !expense.expenseId
      ) {
        continue;
      }

      if (
        submittedExpenseIds.has(
          expense.expenseId
        )
      ) {
        throw new HttpException(
          400,

          MESSAGES
            .duplicateExpenseInRequest[
            LANGUAGE
          ],

          "DUPLICATE_EXPENSE_IN_REQUEST"
        );
      }

      submittedExpenseIds.add(
        expense.expenseId
      );

      const existingExpense =
        existingById.get(
          expense.expenseId
        );

      if (
        !existingExpense
      ) {
        throw new HttpException(
          404,

          MESSAGES
            .expenseNotFound[
            LANGUAGE
          ],

          "EXPENSE_NOT_FOUND"
        );
      }

      retainedExpenseIds.add(
        expense.expenseId
      );
    }

    /*
     * Mutation pass.
     */
    for (
      const expense of
      expenses
    ) {
      if (
        expense.expenseId
      ) {
        const updated =
          await this.repository
            .updateByIdForCaseForLawyer(
              lawyerId,
              caseId,
              expense.expenseId,
              this.buildExpenseUpdate(
                expense
              ),
              session
            );

        if (!updated) {
          throw new HttpException(
            404,

            MESSAGES
              .expenseNotFound[
              LANGUAGE
            ],

            "EXPENSE_NOT_FOUND"
          );
        }

        continue;
      }

      const {
        expenseId:
          _expenseId,

        ...expenseData
      } =
        expense;

      const createData:
        CreateCaseExpenseInput = {
          ...expenseData,

          title:
            expenseData
              .title
              .trim(),

          description:
            this.normalizeOptionalString(
              expenseData.description
            ),
      };

      await this.repository
        .create(
          lawyerId,
          caseId,
          createData,
          session
        );
    }

    const expenseIdsToDelete =
      existingExpenses
        .filter(
          (expense) =>
            !retainedExpenseIds.has(
              expense._id.toString()
            )
        )
        .map(
          (expense) =>
            expense._id.toString()
        );

    await this.repository
      .deleteManyByIdsForCaseForLawyer(
        lawyerId,
        caseId,
        expenseIdsToDelete,
        session
      );
  }

  public deleteCaseExpenses(
    lawyerId:
      string,

    caseId:
      string,

    session?:
      ClientSession
  ) {
    return this.repository
      .deleteByCaseIdForLawyer(
        lawyerId,
        caseId,
        session
      );
  }
}