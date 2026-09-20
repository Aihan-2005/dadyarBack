import type { ClientSession, Types } from "mongoose";

import type {
  CreatePendingPaymentData,
  Payment,
  PaymentProvider,
  PaymentVerificationData,
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

            fulfillmentStatus: "NOT_APPLICABLE",

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

  public markPendingPaymentCancelled(
    paymentId: string,

    cancelledAt = new Date(),
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(paymentId),

          status: "PENDING",
        },

        {
          $set: {
            status: "CANCELLED",

            fulfillmentStatus: "NOT_APPLICABLE",

            cancelledAt,
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

  public markPendingPaymentFulfilled(
    paymentId: string,

    verification: PaymentVerificationData,

    subscriptionId: Types.ObjectId,

    now: Date,

    session: ClientSession,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(paymentId),

          status: "PENDING",
        },

        {
          $set: {
            status: "PAID",

            paidAt: now,

            fulfillmentStatus: "FULFILLED",

            fulfilledAt: now,

            subscriptionId,

            providerVerificationCode: verification.providerVerificationCode,

            ...(verification.referenceId !== null
              ? {
                  referenceId: verification.referenceId,
                }
              : {}),

            ...(verification.cardPan !== null
              ? {
                  cardPan: verification.cardPan,
                }
              : {}),

            ...(verification.cardHash !== null
              ? {
                  cardHash: verification.cardHash,
                }
              : {}),

            ...(verification.providerFee !== null
              ? {
                  providerFee: verification.providerFee,
                }
              : {}),

            ...(verification.providerFeeType !== null
              ? {
                  providerFeeType: verification.providerFeeType,
                }
              : {}),
          },
        },

        {
          new: true,

          runValidators: true,

          session,
        },
      )
      .lean()
      .exec();
  }

  public markPendingPaymentPaidRequiresAction(
    paymentId: string,

    verification: PaymentVerificationData,

    input: {
      errorCode: string;

      errorMessage: string;
    },

    now: Date,

    session: ClientSession,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(paymentId),

          status: "PENDING",
        },

        {
          $set: {
            status: "PAID",

            paidAt: now,

            fulfillmentStatus: "REQUIRES_ACTION",

            fulfillmentErrorCode: input.errorCode,

            fulfillmentErrorMessage: input.errorMessage,

            providerVerificationCode: verification.providerVerificationCode,

            ...(verification.referenceId !== null
              ? {
                  referenceId: verification.referenceId,
                }
              : {}),

            ...(verification.cardPan !== null
              ? {
                  cardPan: verification.cardPan,
                }
              : {}),

            ...(verification.cardHash !== null
              ? {
                  cardHash: verification.cardHash,
                }
              : {}),

            ...(verification.providerFee !== null
              ? {
                  providerFee: verification.providerFee,
                }
              : {}),

            ...(verification.providerFeeType !== null
              ? {
                  providerFeeType: verification.providerFeeType,
                }
              : {}),
          },
        },

        {
          new: true,

          runValidators: true,

          session,
        },
      )
      .lean()
      .exec();
  }
}
