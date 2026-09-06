import type { SmsProviderName } from "../constants/sms.constants";

export interface SendOtpSmsInput {
  phone: string;

  code: string;
}

export interface SmsSendResult {
  provider: SmsProviderName;

  messageId: string;

  cost?: number;
}
