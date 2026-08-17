import type {
  SendTemplateSmsInput,
  SmsSendResult,
} from "../../interfaces/sms.interface";

export interface SmsProvider {
  sendTemplate(input: SendTemplateSmsInput): Promise<SmsSendResult>;
}
