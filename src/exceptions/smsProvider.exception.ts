export class SmsProviderException extends Error {
  constructor(
    message: string,

    public readonly provider: string,

    public readonly originalError?: unknown,
  ) {
    super(message);

    this.name = "SmsProviderException";
  }
}
