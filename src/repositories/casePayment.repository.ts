import type { ClientSession, UpdateQuery } from "mongoose";

import type {
  CasePayment,
  CreateCasePaymentInput,
} from "../interfaces/casePayment.interface";

import { CasePaymentModel } from "../models/casePayment.model";

import { BaseRepository } from "./base.repository";

export class CasePaymentRepository extends BaseRepository<CasePayment> {
  constructor() {
    super(CasePaymentModel);
  }

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

    return query.lean().exec();
  }

  public findByCaseIdsForLawyer(
    lawyerId: string,

    caseIds: string[],

    session?: ClientSession,
  ) {
    if (caseIds.length === 0) {
      return Promise.resolve([]);
    }

    const query = this.model.find({
      lawyerId: this.toObjectId(lawyerId),

      caseId: {
        $in: caseIds.map((caseId) => this.toObjectId(caseId)),
      },
    });

    if (session) {
      query.session(session);
    }

    return query
      .sort({
        dueDate: 1,

        createdAt: 1,
      })
      .lean()
      .exec();
  }

  public async create(
    lawyerId: string,

    caseId: string,

    clientId: string,

    data: CreateCasePaymentInput,

    session?: ClientSession,
  ) {
    const [createdPayment] = await this.model.create(
      [
        {
          ...data,

          lawyerId: this.toObjectId(lawyerId),

          caseId: this.toObjectId(caseId),

          clientId: this.toObjectId(clientId),
        },
      ],

      {
        session,
      },
    );

    return createdPayment;
  }

  public updateByIdForCaseClientForLawyer(
    lawyerId: string,

    caseId: string,

    clientId: string,

    paymentId: string,

    update: UpdateQuery<CasePayment>,

    session?: ClientSession,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(paymentId),

          lawyerId: this.toObjectId(lawyerId),

          caseId: this.toObjectId(caseId),

          clientId: this.toObjectId(clientId),
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

  public deleteManyByIdsForCaseForLawyer(
    lawyerId: string,

    caseId: string,

    paymentIds: string[],

    session?: ClientSession,
  ) {
    if (paymentIds.length === 0) {
      return Promise.resolve({
        acknowledged: true,

        deletedCount: 0,
      });
    }

    return this.model
      .deleteMany(
        {
          _id: {
            $in: paymentIds.map((id) => this.toObjectId(id)),
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

  public deleteByCaseIdForLawyer(
    lawyerId: string,

    caseId: string,

    session?: ClientSession,
  ) {
    return this.model
      .deleteMany(
        {
          lawyerId: this.toObjectId(lawyerId),

          caseId: this.toObjectId(caseId),
        },

        {
          session,
        },
      )
      .exec();
  }

  public findByCaseIdForClientForLawyer(
    lawyerId: string,

    caseId: string,

    clientId: string,
  ) {
    return this.model
      .find({
        lawyerId: this.toObjectId(lawyerId),

        caseId: this.toObjectId(caseId),

        clientId: this.toObjectId(clientId),
      })
      .sort({
        dueDate: 1,

        createdAt: 1,
      })
      .lean()
      .exec();
  }
}

