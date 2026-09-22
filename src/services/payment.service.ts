import { env } from "../config/env";

import { ZARINPAL_MIN_AMOUNT } from "../constants/payment.constants";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import { PaymentProviderException } from "../exceptions/paymentProvider.exception";

import type {
  AdminPaymentListOptions,
  CreateSubscriptionPaymentInput,
  PaymentHistoryOptions,
  PaymentVerificationData,
  ZarinPalCallbackInput,
} from "../interfaces/payment.interface";

import type { PaymentProvider } from "../interfaces/paymentProvider.interface";

import { PaymentRepository } from "../repositories/payment.repository";

import { SubscriptionPlanRepository } from "../repositories/subscriptionPlan.repository";

import { LawyerSubscriptionRepository } from "../repositories/lawyerSubscription.repository";

import { ZarinPalProvider } from "../providers/payment/zarinpal.provider";
import { LawyerRepository } from "../repositories/lawyer.repository";
import mongoose from "mongoose";
import { SUBSCRIPTION_MONTH_DURATION_IN_MS } from "../constants/lawyerSubscription.constants";
import { toAdminPaymentDTO, toLawyerPaymentDTO } from "../dtos/payment.dto";

const LANGUAGE = env.LANGUAGE;

export class PaymentService {
  constructor(
    private readonly repository: PaymentRepository = new PaymentRepository(),

    private readonly subscriptionPlanRepository: SubscriptionPlanRepository = new SubscriptionPlanRepository(),

    private readonly lawyerSubscriptionRepository: LawyerSubscriptionRepository = new LawyerSubscriptionRepository(),

    private readonly lawyerRepository: LawyerRepository = new LawyerRepository(),

    private readonly provider: PaymentProvider = new ZarinPalProvider(),
  ) {}

  private toCallbackResult(payment: {
    _id: {
      toString(): string;
    };

    status: string;

    fulfillmentStatus: string;

    referenceId?: string | null;

    subscriptionId?: {
      toString(): string;
    } | null;
  }) {
    return {
      paymentId: payment._id.toString(),

      paymentStatus: payment.status,

      fulfillmentStatus: payment.fulfillmentStatus,

      referenceId: payment.referenceId ?? null,

      subscriptionId: payment.subscriptionId?.toString() ?? null,
    };
  }

  private async finalizeVerifiedSubscriptionPayment(
    authority: string,

    verification: PaymentVerificationData,
  ) {
    const session = await mongoose.startSession();

    try {
      const result = await session.withTransaction(async () => {
        const payment = await this.repository.findByProviderAuthority(
          "ZARINPAL",

          authority,

          session,
        );

        if (!payment) {
          throw new HttpException(
            404,

            MESSAGES.paymentNotFound[LANGUAGE],

            "SUBSCRIPTION_PAYMENT_NOT_FOUND",
          );
        }

        /*
         * Another callback may already have completed
         * everything while we were verifying with ZarinPal.
         */
        if (payment.status === "PAID") {
          return payment;
        }

        if (payment.status !== "PENDING") {
          return payment;
        }

        const now = new Date();

        const lawyerId = payment.lawyerId.toString();

        /*
         * This is the exact same concurrency guard used
         * by admin subscription creation/cancellation.
         */
        const lawyer =
          await this.lawyerRepository.acquireSubscriptionWriteGuard(
            lawyerId,

            session,
          );

        /*
         * Money is already verified.
         * Missing lawyer must NOT turn the payment into FAILED.
         */
        if (!lawyer) {
          return this.repository.markPendingPaymentPaidRequiresAction(
            payment._id.toString(),

            verification,

            {
              errorCode: "LAWYER_NOT_FOUND",

              errorMessage: "The lawyer no longer exists",
            },

            now,

            session,
          );
        }

        const currentSubscription =
          await this.lawyerSubscriptionRepository.findCurrentByLawyerId(
            lawyerId,

            now,

            session,
          );

        /*
         * Again: ZarinPal already confirmed the money.
         * Preserve PAID and flag fulfillment separately.
         */
        if (currentSubscription) {
          return this.repository.markPendingPaymentPaidRequiresAction(
            payment._id.toString(),

            verification,

            {
              errorCode: "LAWYER_SUBSCRIPTION_ALREADY_ACTIVE",

              errorMessage:
                "A subscription became active before payment fulfillment",
            },

            now,

            session,
          );
        }

        const endsAt = new Date(
          now.getTime() +
            payment.planSnapshot.durationMonths *
              SUBSCRIPTION_MONTH_DURATION_IN_MS,
        );

        const subscription =
          await this.lawyerSubscriptionRepository.createSubscription(
            {
              lawyerId: lawyer._id,

              planId: payment.planId,

              planSnapshot: {
                title: payment.planSnapshot.title,

                description: payment.planSnapshot.description,

                tier: payment.planSnapshot.tier,

                tags: [...payment.planSnapshot.tags],

                durationMonths: payment.planSnapshot.durationMonths,

                price: payment.planSnapshot.price,

                discountPercent: payment.planSnapshot.discountPercent,

                features: [...payment.planSnapshot.features],
              },

              startsAt: now,

              endsAt,

              activationSource: "PAYMENT",

              activatedByUserId: null,
            },

            session,
          );

        const finalizedPayment =
          await this.repository.markPendingPaymentFulfilled(
            payment._id.toString(),

            verification,

            subscription._id,

            now,

            session,
          );

        if (!finalizedPayment) {
          throw new Error(
            "Payment state changed during subscription fulfillment",
          );
        }

        return finalizedPayment;
      });

      if (!result) {
        throw new HttpException(
          500,

          MESSAGES.serverError[LANGUAGE],

          "PAYMENT_FINALIZATION_FAILED",
        );
      }

      return this.toCallbackResult(result);
    } finally {
      await session.endSession();
    }
  }

  public async createSubscriptionPayment(
    lawyerId: string,

    input: CreateSubscriptionPaymentInput,
  ) {
    const [plan, currentSubscription] = await Promise.all([
      this.subscriptionPlanRepository.findPublicPlanById(input.planId),

      this.lawyerSubscriptionRepository.findCurrentByLawyerId(lawyerId),
    ]);

    if (!plan) {
      throw new HttpException(
        404,

        MESSAGES.subscriptionPlanNotFound[LANGUAGE],

        "SUBSCRIPTION_PLAN_NOT_FOUND",
      );
    }

    if (currentSubscription) {
      throw new HttpException(
        409,

        MESSAGES.lawyerSubscriptionAlreadyActive[LANGUAGE],

        "LAWYER_SUBSCRIPTION_ALREADY_ACTIVE",
      );
    }

    const amount = Math.round(
      (plan.price * (100 - plan.discountPercent)) / 100,
    );

    if (!Number.isSafeInteger(amount) || amount < ZARINPAL_MIN_AMOUNT) {
      throw new HttpException(
        400,

        MESSAGES.paymentAmountTooLow[LANGUAGE],

        "PAYMENT_AMOUNT_TOO_LOW",
      );
    }

    const payment = await this.repository.createPendingPayment({
      lawyerId,

      planId: plan._id,

      planSnapshot: {
        title: plan.title,
        description: plan.description,
        tier: plan.tier,
        tags: [...plan.tags],
        durationMonths: plan.durationMonths,
        price: plan.price,
        discountPercent: plan.discountPercent,
        features: [...plan.features],
      },

      amount,

      currency: "IRR",

      provider: "ZARINPAL",
    });

    try {
      const providerResult = await this.provider.createPayment({
        amount: payment.amount,

        callbackUrl: env.ZARINPAL_CALLBACK_URL,

        description: `Subscription purchase: ${plan.title}`,
      });

      const updatedPayment = await this.repository.attachProviderRequest(
        payment._id.toString(),

        {
          authority: providerResult.authority,

          providerRequestCode: providerResult.providerCode,

          providerFee: providerResult.fee,

          providerFeeType: providerResult.feeType,
        },
      );

      if (!updatedPayment) {
        throw new Error(
          "Pending payment disappeared before provider request could be attached",
        );
      }

      return {
        paymentId: updatedPayment._id.toString(),

        redirectUrl: providerResult.redirectUrl,

        amount: updatedPayment.amount,

        currency: updatedPayment.currency,
      };
    } catch (error) {
      await this.repository.markPendingPaymentFailed(
        payment._id.toString(),

        {
          failureCode:
            error instanceof PaymentProviderException
              ? "PAYMENT_PROVIDER_REQUEST_FAILED"
              : "PAYMENT_INITIALIZATION_FAILED",

          failureMessage:
            error instanceof Error
              ? error.message
              : "Unknown payment initialization error",
        },
      );

      if (error instanceof PaymentProviderException) {
        throw new HttpException(
          502,

          MESSAGES.paymentRequestFailed[LANGUAGE],

          "PAYMENT_PROVIDER_REQUEST_FAILED",
        );
      }

      throw error;
    }
  }

  public async handleZarinPalCallback(input: ZarinPalCallbackInput) {
    let payment = await this.repository.findByProviderAuthority(
      "ZARINPAL",

      input.Authority,
    );

    if (!payment) {
      throw new HttpException(
        404,

        MESSAGES.paymentNotFound[LANGUAGE],

        "SUBSCRIPTION_PAYMENT_NOT_FOUND",
      );
    }

    // Already completely handled.
    if (payment.status === "PAID") {
      return this.toCallbackResult(payment);
    }

    // User cancelled or did not complete payment.
    if (input.Status !== "OK") {
      if (payment.status === "PENDING") {
        const cancelled = await this.repository.markPendingPaymentCancelled(
          payment._id.toString(),
        );

        if (cancelled) {
          payment = cancelled;
        }
      }

      return this.toCallbackResult(payment);
    }

    /*
     * Do NOT mark the payment FAILED if verification throws.
     *
     * Status=OK means money may actually have moved.
     * A timeout/network/provider error during verification is
     * not proof that payment failed.
     *
     * Leave it recoverable and retryable.
     */
    if (payment.status !== "PENDING") {
      return this.toCallbackResult(payment);
    }

    let verification;

    try {
      verification = await this.provider.verifyPayment({
        amount: payment.amount,

        authority: input.Authority,
      });
    } catch (error) {
      if (error instanceof PaymentProviderException) {
        throw new HttpException(
          502,

          MESSAGES.paymentVerificationFailed[LANGUAGE],

          "PAYMENT_VERIFICATION_FAILED",
        );
      }

      throw error;
    }

    const verificationData: PaymentVerificationData = {
      providerVerificationCode: verification.providerCode,

      referenceId: verification.refId,

      cardPan: verification.cardPan,

      cardHash: verification.cardHash,

      providerFee: verification.fee,

      providerFeeType: verification.feeType,
    };

    return this.finalizeVerifiedSubscriptionPayment(
      input.Authority,

      verificationData,
    );
  }

  public async listLawyerPayments(
    lawyerId: string,

    options: PaymentHistoryOptions,
  ) {
    const result = await this.repository.findHistoryByLawyerId(
      lawyerId,

      options,
    );

    return {
      items: result.items.map(toLawyerPaymentDTO),

      pagination: {
        page: options.page,

        limit: options.limit,

        total: result.total,

        totalPages: Math.ceil(result.total / options.limit),
      },
    };
  }

  public async getPaymentForAdmin(paymentId: string) {
    const payment = await this.repository.findPaymentById(paymentId);

    if (!payment) {
      throw new HttpException(
        404,

        MESSAGES.paymentNotFound[LANGUAGE],

        "PAYMENT_NOT_FOUND",
      );
    }

    return toAdminPaymentDTO(payment);
  }

  public async retryPaymentFulfillmentForAdmin(paymentId: string) {
    const session = await mongoose.startSession();

    try {
      const payment = await session.withTransaction(async () => {
        const payment = await this.repository.findPaymentById(
          paymentId,

          session,
        );

        if (!payment) {
          throw new HttpException(
            404,

            MESSAGES.paymentNotFound[LANGUAGE],

            "PAYMENT_NOT_FOUND",
          );
        }

        // Makes retry endpoint idempotent.
        if (
          payment.status === "PAID" &&
          payment.fulfillmentStatus === "FULFILLED"
        ) {
          return payment;
        }

        if (
          payment.status !== "PAID" ||
          payment.fulfillmentStatus !== "REQUIRES_ACTION"
        ) {
          throw new HttpException(
            409,

            MESSAGES.paymentFulfillmentNotRetryable[LANGUAGE],

            "PAYMENT_FULFILLMENT_NOT_RETRYABLE",
          );
        }

        const lawyerId = payment.lawyerId.toString();

        const lawyer =
          await this.lawyerRepository.acquireSubscriptionWriteGuard(
            lawyerId,

            session,
          );

        if (!lawyer) {
          throw new HttpException(
            409,

            MESSAGES.paymentFulfillmentBlocked[LANGUAGE],

            "PAYMENT_FULFILLMENT_BLOCKED",
          );
        }

        const now = new Date();

        const currentSubscription =
          await this.lawyerSubscriptionRepository.findCurrentByLawyerId(
            lawyerId,

            now,

            session,
          );

        if (currentSubscription) {
          throw new HttpException(
            409,

            MESSAGES.lawyerSubscriptionAlreadyActive[LANGUAGE],

            "PAYMENT_FULFILLMENT_BLOCKED_BY_ACTIVE_SUBSCRIPTION",
          );
        }

        const endsAt = new Date(
          now.getTime() +
            payment.planSnapshot.durationMonths *
              SUBSCRIPTION_MONTH_DURATION_IN_MS,
        );

        const subscription =
          await this.lawyerSubscriptionRepository.createSubscription(
            {
              lawyerId: lawyer._id,

              planId: payment.planId,

              planSnapshot: {
                title: payment.planSnapshot.title,

                description: payment.planSnapshot.description,

                tier: payment.planSnapshot.tier,

                tags: [...payment.planSnapshot.tags],

                durationMonths: payment.planSnapshot.durationMonths,

                price: payment.planSnapshot.price,

                discountPercent: payment.planSnapshot.discountPercent,

                features: [...payment.planSnapshot.features],
              },

              startsAt: now,

              endsAt,

              activationSource: "PAYMENT",

              activatedByUserId: null,
            },

            session,
          );

        const fulfilled =
          await this.repository.markRequiresActionPaymentFulfilled(
            payment._id.toString(),

            subscription._id,

            now,

            session,
          );

        if (!fulfilled) {
          throw new Error("Payment fulfillment state changed during retry");
        }

        return fulfilled;
      });

      if (!payment) {
        throw new HttpException(
          500,

          MESSAGES.serverError[LANGUAGE],

          "PAYMENT_FULFILLMENT_RETRY_FAILED",
        );
      }

      return toAdminPaymentDTO(payment);
    } finally {
      await session.endSession();
    }
  }

  public async listPaymentsForAdmin(options: AdminPaymentListOptions) {
    const result = await this.repository.findForAdmin(options);

    return {
      items: result.items.map(toAdminPaymentDTO),

      pagination: {
        page: options.page,

        limit: options.limit,

        total: result.total,

        totalPages: Math.ceil(result.total / options.limit),
      },
    };
  }

  public async getMyPayment(
    lawyerId: string,

    paymentId: string,
  ) {
    const payment = await this.repository.findByIdAndLawyerId(
      paymentId,

      lawyerId,
    );

    if (!payment) {
      throw new HttpException(
        404,

        MESSAGES.paymentNotFound[LANGUAGE],

        "PAYMENT_NOT_FOUND",
      );
    }

    return toLawyerPaymentDTO(payment);
  }
}
