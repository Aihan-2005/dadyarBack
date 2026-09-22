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

import type {
  InquirePaymentInput,
  InquirePaymentResult,
  PaymentProviderTransactionState,
} from "../../interfaces/payment.interface";

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

  private mapInquiryState(status: unknown): PaymentProviderTransactionState {
    if (typeof status !== "string") {
      return "UNKNOWN";
    }

    switch (status.toUpperCase()) {
      case "VERIFIED":
        return "VERIFIED";

      case "PAID":
        return "PAID_UNVERIFIED";

      case "IN_BANK":
        return "PENDING";

      case "FAILED":
        return "FAILED";

      case "REVERSED":
        return "REVERSED";

      default:
        return "UNKNOWN";
    }
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

  public async inquirePayment(
    input: InquirePaymentInput,
  ): Promise<InquirePaymentResult> {
    try {
      const response = await this.client.inquiries.inquire({
        authority: input.authority,
      });

      const data = response?.data;

      if (data?.code !== ZARINPAL_SUCCESS_CODE) {
        throw new PaymentProviderException(
          data?.message ?? "ZarinPal rejected payment inquiry",

          "ZARINPAL",

          data?.code,
        );
      }

      const rawStatus = typeof data.status === "string" ? data.status : null;

      return {
        provider: "ZARINPAL",

        providerCode: data.code,

        state: this.mapInquiryState(rawStatus),

        rawStatus,

        authority:
          typeof data.authority === "string" ? data.authority : input.authority,

        amount: typeof data.amount === "number" ? data.amount : null,

        refId:
          data.ref_id !== undefined && data.ref_id !== null
            ? String(data.ref_id)
            : null,
      };
    } catch (error) {
      if (error instanceof PaymentProviderException) {
        throw error;
      }

      throw new PaymentProviderException(
        "Unable to inquire payment through ZarinPal",

        "ZARINPAL",

        undefined,

        error,
      );
    }
  }

  public getPaymentRedirectUrl(authority: string): string {
    return this.client.payments.getRedirectUrl(authority);
  }
}
