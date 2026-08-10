import type { ClientSession, UpdateQuery } from "mongoose";

import type {
  CaseExpense,
  CreateCaseExpenseInput,
} from "../interfaces/caseExpense.interface";

import { CaseExpenseModel } from "../models/caseExpense.model";

import { BaseRepository } from "./base.repository";

export class CaseExpenseRepository extends BaseRepository<CaseExpense> {
  constructor() {
    super(CaseExpenseModel);
  }

  // ---------------- Find ----------------

  public findByCaseIdForLawyer(
    lawyerId: string,
    caseId: string,
    session?: ClientSession,
  ) {
    const query = this.model.find({
      lawyerId: this.toObjectId(lawyerId),

      caseId: this.toObjectId(caseId),
    });

    if (session) {
      query.session(session);
    }

    return query
      .sort({
        expenseDate: -1,

        createdAt: -1,
      })
      .lean()
      .exec();
  }

  // ---------------- Create ----------------

  public async create(
    lawyerId: string,
    caseId: string,
    data: CreateCaseExpenseInput,
    session?: ClientSession,
  ) {
    const [createdExpense] = await this.model.create(
      [
        {
          ...data,

          lawyerId: this.toObjectId(lawyerId),

          caseId: this.toObjectId(caseId),
        },
      ],
      {
        session,
      },
    );

    return createdExpense;
  }

  // ---------------- Update ----------------

  public updateByIdForCaseForLawyer(
    lawyerId: string,
    caseId: string,
    expenseId: string,
    update: UpdateQuery<CaseExpense>,
    session?: ClientSession,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(expenseId),

          lawyerId: this.toObjectId(lawyerId),

          caseId: this.toObjectId(caseId),
        },
        update,
        {
          new: true,

          runValidators: true,

          session,
        },
      )
      .lean()
      .exec();
  }

  // ---------------- Delete ----------------

  public deleteManyByIdsForCaseForLawyer(
    lawyerId: string,
    caseId: string,
    expenseIds: string[],
    session?: ClientSession,
  ) {
    if (expenseIds.length === 0) {
      return Promise.resolve({
        acknowledged: true,

        deletedCount: 0,
      });
    }

    return this.model
      .deleteMany(
        {
          _id: {
            $in: expenseIds.map((expenseId) => this.toObjectId(expenseId)),
          },

          lawyerId: this.toObjectId(lawyerId),

          caseId: this.toObjectId(caseId),
        },
        {
          session,
        },
      )
      .exec();
  }
}
