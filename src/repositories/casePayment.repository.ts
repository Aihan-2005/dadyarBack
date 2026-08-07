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

    return query.lean().exec();
  }

  // ---------------- Create ----------------

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

  // ---------------- Update ----------------

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

  // ---------------- Delete ----------------

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
}
