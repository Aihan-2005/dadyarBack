import type {
  ClientSession,
  UpdateQuery,
} from "mongoose";

import type {
  CaseExpense,
  CreateCaseExpenseInput,
} from "../interfaces/caseExpense.interface";

import {
  CaseExpenseModel,
} from "../models/caseExpense.model";

import {
  BaseRepository,
} from "./base.repository";

export class CaseExpenseRepository extends BaseRepository<CaseExpense> {
  constructor() {
    super(
      CaseExpenseModel
    );
  }


  public findByCaseIdForLawyer(
    lawyerId:
      string,

    caseId:
      string,

    session?:
      ClientSession
  ) {
    const query =
      this.model.find({
        lawyerId:
          this.toObjectId(
            lawyerId
          ),

        caseId:
          this.toObjectId(
            caseId
          ),
      });

    if (session) {
      query.session(
        session
      );
    }

    return query
      .sort({
        expenseDate:
          -1,

        createdAt:
          -1,
      })
      .lean()
      .exec();
  }

  public findByCaseIdsForLawyer(
    lawyerId:
      string,

    caseIds:
      string[],

    session?:
      ClientSession
  ) {
    if (
      caseIds.length ===
      0
    ) {
      return Promise.resolve(
        []
      );
    }

    const query =
      this.model.find({
        lawyerId:
          this.toObjectId(
            lawyerId
          ),

        caseId: {
          $in:
            caseIds.map(
              (
                caseId
              ) =>
                this.toObjectId(
                  caseId
                )
            ),
        },
      });

    if (session) {
      query.session(
        session
      );
    }

    return query
      .sort({
        expenseDate:
          -1,

        createdAt:
          -1,
      })
      .lean()
      .exec();
  }

  

  public async create(
    lawyerId:
      string,

    caseId:
      string,

    data:
      CreateCaseExpenseInput,

    session?:
      ClientSession
  ) {
    const [
      createdExpense,
    ] =
      await this.model.create(
        [
          {
            ...data,

            lawyerId:
              this.toObjectId(
                lawyerId
              ),

            caseId:
              this.toObjectId(
                caseId
              ),
          },
        ],

        {
          session,
        }
      );

    return createdExpense;
  }

  

  public updateByIdForCaseForLawyer(
    lawyerId:
      string,

    caseId:
      string,

    expenseId:
      string,

    update:
      UpdateQuery<CaseExpense>,

    session?:
      ClientSession
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id:
            this.toObjectId(
              expenseId
            ),

          lawyerId:
            this.toObjectId(
              lawyerId
            ),

          caseId:
            this.toObjectId(
              caseId
            ),
        },

        update,

        {
          new:
            true,

          runValidators:
            true,

          session,
        }
      )
      .lean()
      .exec();
  }


  public deleteManyByIdsForCaseForLawyer(
    lawyerId:
      string,

    caseId:
      string,

    expenseIds:
      string[],

    session?:
      ClientSession
  ) {
    if (
      expenseIds.length ===
      0
    ) {
      return Promise.resolve({
        acknowledged:
          true,

        deletedCount:
          0,
      });
    }

    return this.model
      .deleteMany(
        {
          _id: {
            $in:
              expenseIds.map(
                (
                  expenseId
                ) =>
                  this.toObjectId(
                    expenseId
                  )
              ),
          },

          lawyerId:
            this.toObjectId(
              lawyerId
            ),

          caseId:
            this.toObjectId(
              caseId
            ),
        },

        {
          session,
        }
      )
      .exec();
  }



  public deleteByCaseIdForLawyer(
    lawyerId:
      string,

    caseId:
      string,

    session?:
      ClientSession
  ) {
    return this.model
      .deleteMany(
        {
          lawyerId:
            this.toObjectId(
              lawyerId
            ),

          caseId:
            this.toObjectId(
              caseId
            ),
        },

        {
          session,
        }
      )
      .exec();
  }
}