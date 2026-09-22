import type { PaymentProviderName } from "../interfaces/paymentProvider.interface";

export class PaymentProviderException extends Error {
  constructor(
    message: string,

    public readonly provider: PaymentProviderName,

    public readonly providerCode?: number,

    public readonly originalError?: unknown,
  ) {
    super(message);

    this.name = "PaymentProviderException";
  }
}
