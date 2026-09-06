import { Smsir } from "smsir-js";

import { env } from "../../config/env";

import { SmsProviderException } from "../../exceptions/smsProvider.exception";

import type {
  SendOtpSmsInput,
  SmsSendResult,
} from "../../interfaces/sms.interface";

import type { SmsProvider } from "./sms.provider";

export class SmsIrProvider implements SmsProvider {
  private client: Smsir | null = null;

  constructor(
    private readonly apiKey: string | undefined = env.SMSIR_API_KEY,

    private readonly otpTemplateId:
      number | undefined = env.SMSIR_OTP_TEMPLATE_ID,
  ) {}

  private getClient(): Smsir {
    if (this.client) {
      return this.client;
    }

    if (!this.apiKey) {
      throw new SmsProviderException(
        "SMS.ir API key is not configured",
        "SMS_IR",
      );
    }

    this.client = new Smsir(this.apiKey);

    return this.client;
  }

  public isAvailable(): boolean {
    return Boolean(this.apiKey && this.otpTemplateId);
  }

  public async sendOtp(input: SendOtpSmsInput): Promise<SmsSendResult> {
    try {
      if (!this.otpTemplateId) {
        throw new SmsProviderException(
          "SMS.ir OTP template is not configured",
          "SMS_IR",
        );
      }

      const client = this.getClient();

      const response = await client.SendVerifyCode(
        input.phone,
        this.otpTemplateId,
        [
          {
            name: "Code",
            value: input.code,
          },
        ],
      );

      const payload = response.data;

      const messageId = payload.data?.messageId;

      if (payload.status !== 1 || typeof messageId !== "number") {
        throw new SmsProviderException(
          payload.message || "SMS.ir rejected the SMS request",
          "SMS_IR",
        );
      }

      return {
        provider: "SMS_IR",

        messageId: messageId.toString(),

        cost: payload.data?.cost,
      };
    } catch (error) {
      if (error instanceof SmsProviderException) {
        throw error;
      }

      throw new SmsProviderException(
        "Unable to send SMS through SMS.ir",
        "SMS_IR",
        error,
      );
    }
  }
}
