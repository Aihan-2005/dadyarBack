import type { PAYMENT_PROVIDERS } from "../constants/payment.constants";
import type {
  InquirePaymentInput,
  InquirePaymentResult,
} from "./payment.interface";

export type PaymentProviderName = (typeof PAYMENT_PROVIDERS)[number];

export interface CreatePaymentRequestInput {
  amount: number;

  callbackUrl: string;

  description: string;

  mobile?: string;

  email?: string;
}

export interface CreatePaymentRequestResult {
  provider: PaymentProviderName;

  authority: string;

  redirectUrl: string;

  providerCode: number;

  fee: number | null;

  feeType: string | null;
}

export interface VerifyPaymentInput {
  amount: number;

  authority: string;
}

export interface VerifyPaymentResult {
  provider: PaymentProviderName;

  providerCode: number;

  alreadyVerified: boolean;

  refId: string | null;

  cardPan: string | null;

  cardHash: string | null;

  fee: number | null;

  feeType: string | null;
}

export interface PaymentProvider {
  createPayment(
    input: CreatePaymentRequestInput,
  ): Promise<CreatePaymentRequestResult>;

  verifyPayment(input: VerifyPaymentInput): Promise<VerifyPaymentResult>;

  inquirePayment(input: InquirePaymentInput): Promise<InquirePaymentResult>;
}
