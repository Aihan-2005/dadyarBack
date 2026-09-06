import MelipayamakApi, { type MelipayamakSmsClient } from "melipayamak";

import { env } from "../../config/env";

import { SmsProviderException } from "../../exceptions/smsProvider.exception";

import type {
  SendOtpSmsInput,
  SmsSendResult,
} from "../../interfaces/sms.interface";

import type { SmsProvider } from "./sms.provider";

export class MelipayamakProvider implements SmsProvider {
  private client: MelipayamakSmsClient | null = null;

  constructor(
    private readonly username: string | undefined = env.MELIPAYAMAK_USERNAME,

    private readonly password: string | undefined = env.MELIPAYAMAK_PASSWORD,

    private readonly otpBodyId:
      number | undefined = env.MELIPAYAMAK_OTP_BODY_ID,
  ) {}

  public isAvailable(): boolean {
    return Boolean(this.username && this.password && this.otpBodyId);
  }

  private getClient(): MelipayamakSmsClient {
    if (this.client) {
      return this.client;
    }

    if (!this.username || !this.password) {
      throw new SmsProviderException(
        "Melipayamak credentials are not configured",
        "MELIPAYAMAK",
      );
    }

    const api = new MelipayamakApi(this.username, this.password);

    this.client = api.sms("rest", "async");

    return this.client;
  }

  public async sendOtp(input: SendOtpSmsInput): Promise<SmsSendResult> {
    try {
      if (!this.otpBodyId) {
        throw new SmsProviderException(
          "Melipayamak OTP body ID is not configured",
          "MELIPAYAMAK",
        );
      }

      const client = this.getClient();

      const response = await client.sendByBaseNumber(
        input.code,
        input.phone,
        this.otpBodyId,
      );

      if (response.RetStatus !== 1 || !response.Value) {
        throw new SmsProviderException(
          response.StrRetStatus || "Melipayamak rejected the SMS request",
          "MELIPAYAMAK",
        );
      }

      return {
        provider: "MELIPAYAMAK",

        messageId: String(response.Value),
      };
    } catch (error) {
      if (error instanceof SmsProviderException) {
        throw error;
      }

      throw new SmsProviderException(
        "Unable to send SMS through Melipayamak",
        "MELIPAYAMAK",
        error,
      );
    }
  }
}
