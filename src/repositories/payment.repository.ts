import type { ClientSession } from "mongoose";

import type {
  CreatePendingPaymentData,
  Payment,
  PaymentProvider,
} from "../interfaces/payment.interface";

import { PaymentModel } from "../models/payment.model";

import { BaseRepository } from "./base.repository";

export class PaymentRepository extends BaseRepository<Payment> {
  constructor() {
    super(PaymentModel);
  }

  public async createPendingPayment(
    input: CreatePendingPaymentData,

    session?: ClientSession,
  ) {
    if (!session) {
      const payment = await this.model.create({
        ...input,
        lawyerId: this.toObjectId(input.lawyerId),
      });

      return payment.toObject();
    }

    const [payment] = await this.model.create(
      [
        {
          ...input,
          lawyerId: this.toObjectId(input.lawyerId),
        },
      ],

      {
        session,
      },
    );

    return payment.toObject();
  }

  public findByProviderAuthority(
    provider: PaymentProvider,

    authority: string,

    session?: ClientSession,
  ) {
    const query = this.model.findOne({
      provider,
      authority,
    });

    if (session) {
      query.session(session);
    }

    return query.lean().exec();
  }

  public attachProviderRequest(
    paymentId: string,

    input: {
      authority: string;

      providerRequestCode: number;

      providerFee: number | null;

      providerFeeType: string | null;
    },
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(paymentId),

          status: "PENDING",
        },

        {
          $set: {
            authority: input.authority,

            providerRequestCode: input.providerRequestCode,

            ...(input.providerFee !== null
              ? {
                  providerFee: input.providerFee,
                }
              : {}),

            ...(input.providerFeeType !== null
              ? {
                  providerFeeType: input.providerFeeType,
                }
              : {}),
          },
        },

        {
          new: true,

          runValidators: true,
        },
      )
      .lean()
      .exec();
  }

  public markPendingPaymentFailed(
    paymentId: string,

    input: {
      failureCode: string;

      failureMessage: string;
    },

    failedAt = new Date(),
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(paymentId),

          status: "PENDING",
        },

        {
          $set: {
            status: "FAILED",

            failedAt,

            failureCode: input.failureCode,

            failureMessage: input.failureMessage,
          },
        },

        {
          new: true,

          runValidators: true,
        },
      )
      .lean()
      .exec();
  }
}
