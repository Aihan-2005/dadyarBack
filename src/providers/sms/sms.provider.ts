import type {
  SendOtpSmsInput,
  SmsSendResult,
} from "../../interfaces/sms.interface";

export interface SmsProvider {
  isAvailable(): boolean;

  sendOtp(input: SendOtpSmsInput): Promise<SmsSendResult>;
}
