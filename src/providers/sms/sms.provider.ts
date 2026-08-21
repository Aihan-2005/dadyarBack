import type {
  SendTemplateSmsInput,
  SmsSendResult,
} from "../../interfaces/sms.interface";

export interface SmsProvider {
  isAvailable(): boolean;

  sendTemplate(input: SendTemplateSmsInput): Promise<SmsSendResult>;
}
