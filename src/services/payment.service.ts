import { env } from "../config/env";

import { ZARINPAL_MIN_AMOUNT } from "../constants/payment.constants";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import { PaymentProviderException } from "../exceptions/paymentProvider.exception";

import type { CreateSubscriptionPaymentInput } from "../interfaces/payment.interface";

import type { PaymentProvider } from "../interfaces/paymentProvider.interface";

import { PaymentRepository } from "../repositories/payment.repository";

import { SubscriptionPlanRepository } from "../repositories/subscriptionPlan.repository";

import { LawyerSubscriptionRepository } from "../repositories/lawyerSubscription.repository";

import { ZarinPalProvider } from "../providers/payment/zarinpal.provider";

const LANGUAGE = env.LANGUAGE;

export class PaymentService {
  constructor(
    private readonly repository: PaymentRepository = new PaymentRepository(),

    private readonly subscriptionPlanRepository: SubscriptionPlanRepository = new SubscriptionPlanRepository(),

    private readonly lawyerSubscriptionRepository: LawyerSubscriptionRepository = new LawyerSubscriptionRepository(),

    private readonly provider: PaymentProvider = new ZarinPalProvider(),
  ) {}

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
}
