import type { ClientSession, Types } from "mongoose";

import type {
  AdminPaymentListOptions,
  CreatePendingPaymentData,
  Payment,
  PaymentHistoryOptions,
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

  public async findHistoryByLawyerId(
    lawyerId: string,

    options: PaymentHistoryOptions,
  ) {
    const filter = {
      lawyerId: this.toObjectId(lawyerId),

      ...(options.status
        ? {
            status: options.status,
          }
        : {}),
    };

    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({
          createdAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(options.limit)
        .lean()
        .exec(),

      this.model.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
    };
  }

  public async findForAdmin(options: AdminPaymentListOptions) {
    const filter: Record<string, unknown> = {};

    if (options.lawyerId) {
      filter.lawyerId = this.toObjectId(options.lawyerId);
    }

    if (options.status) {
      filter.status = options.status;
    }

    if (options.fulfillmentStatus) {
      filter.fulfillmentStatus = options.fulfillmentStatus;
    }

    if (options.provider) {
      filter.provider = options.provider;
    }

    const skip = (options.page - 1) * options.limit;

    const [items, total] = await Promise.all([
      this.model
        .find(filter)
        .sort({
          createdAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(options.limit)
        .lean()
        .exec(),

      this.model.countDocuments(filter).exec(),
    ]);

    return {
      items,
      total,
    };
  }

  public findPaymentById(
    paymentId: string,

    session?: ClientSession,
  ) {
    const query = this.model.findById(this.toObjectId(paymentId));

    if (session) {
      query.session(session);
    }

    return query.lean().exec();
  }

  public markRequiresActionPaymentFulfilled(
    paymentId: string,

    subscriptionId: Types.ObjectId,

    fulfilledAt: Date,

    session: ClientSession,
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(paymentId),

          status: "PAID",

          fulfillmentStatus: "REQUIRES_ACTION",
        },

        {
          $set: {
            fulfillmentStatus: "FULFILLED",

            fulfilledAt,

            subscriptionId,
          },

          $unset: {
            fulfillmentErrorCode: 1,

            fulfillmentErrorMessage: 1,
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

  public findByIdAndLawyerId(
    paymentId: string,

    lawyerId: string,
  ) {
    return this.model
      .findOne({
        _id: this.toObjectId(paymentId),

        lawyerId: this.toObjectId(lawyerId),
      })
      .lean()
      .exec();
  }

  public markPendingPaymentReversed(
    paymentId: string,

    reversedAt = new Date(),
  ) {
    return this.model
      .findOneAndUpdate(
        {
          _id: this.toObjectId(paymentId),

          status: "PENDING",
        },

        {
          $set: {
            status: "REVERSED",

            fulfillmentStatus: "NOT_APPLICABLE",

            reversedAt,
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
