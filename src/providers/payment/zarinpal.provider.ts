import ZarinPal from "zarinpal-node-sdk";

import { env } from "../../config/env";

import {
  ZARINPAL_ALREADY_VERIFIED_CODE,
  ZARINPAL_SUCCESS_CODE,
} from "../../constants/payment.constants";

import { PaymentProviderException } from "../../exceptions/paymentProvider.exception";

import type {
  CreatePaymentRequestInput,
  CreatePaymentRequestResult,
  PaymentProvider,
  VerifyPaymentInput,
  VerifyPaymentResult,
} from "../../interfaces/paymentProvider.interface";

export class ZarinPalProvider implements PaymentProvider {
  private readonly client: ZarinPal;

  constructor(
    merchantId = env.ZARINPAL_MERCHANT_ID,

    sandbox = env.ZARINPAL_SANDBOX,
  ) {
    this.client = new ZarinPal({
      merchantId,

      sandbox,
    });
  }

  public async createPayment(
    input: CreatePaymentRequestInput,
  ): Promise<CreatePaymentRequestResult> {
    try {
      const response = await this.client.payments.create({
        amount: input.amount,

        callback_url: input.callbackUrl,

        description: input.description,

        ...(input.mobile
          ? {
              mobile: input.mobile,
            }
          : {}),

        ...(input.email
          ? {
              email: input.email,
            }
          : {}),
      });

      const data = response?.data;

      if (data?.code !== ZARINPAL_SUCCESS_CODE || !data?.authority) {
        throw new PaymentProviderException(
          data?.message ?? "ZarinPal rejected the payment request",

          "ZARINPAL",

          data?.code,
        );
      }

      return {
        provider: "ZARINPAL",

        authority: data.authority,

        redirectUrl: this.client.payments.getRedirectUrl(data.authority),

        providerCode: data.code,

        fee: typeof data.fee === "number" ? data.fee : null,

        feeType: typeof data.fee_type === "string" ? data.fee_type : null,
      };
    } catch (error) {
      if (error instanceof PaymentProviderException) {
        throw error;
      }

      throw new PaymentProviderException(
        "Unable to create payment through ZarinPal",

        "ZARINPAL",

        undefined,

        error,
      );
    }
  }

  public async verifyPayment(
    input: VerifyPaymentInput,
  ): Promise<VerifyPaymentResult> {
    try {
      const response = await this.client.verifications.verify({
        amount: input.amount,

        authority: input.authority,
      });

      const data = response?.data;

      if (
        data?.code !== ZARINPAL_SUCCESS_CODE &&
        data?.code !== ZARINPAL_ALREADY_VERIFIED_CODE
      ) {
        throw new PaymentProviderException(
          data?.message ?? "ZarinPal rejected payment verification",

          "ZARINPAL",

          data?.code,
        );
      }

      return {
        provider: "ZARINPAL",

        providerCode: data.code,

        alreadyVerified: data.code === ZARINPAL_ALREADY_VERIFIED_CODE,

        refId:
          data.ref_id !== undefined && data.ref_id !== null
            ? String(data.ref_id)
            : null,

        cardPan: typeof data.card_pan === "string" ? data.card_pan : null,

        cardHash: typeof data.card_hash === "string" ? data.card_hash : null,

        fee: typeof data.fee === "number" ? data.fee : null,

        feeType: typeof data.fee_type === "string" ? data.fee_type : null,
      };
    } catch (error) {
      if (error instanceof PaymentProviderException) {
        throw error;
      }

      throw new PaymentProviderException(
        "Unable to verify payment through ZarinPal",

        "ZARINPAL",

        undefined,

        error,
      );
    }
  }
}
