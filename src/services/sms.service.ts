import type {
  SendTemplateSmsInput,
  SmsSendResult,
} from "../interfaces/sms.interface";

import type { SmsProvider } from "../providers/sms/sms.provider";

import { SmsIrProvider } from "../providers/sms/smsIr.provider";

export class SmsService {
  constructor(private readonly provider: SmsProvider = new SmsIrProvider()) {}

  public async sendTemplate(
    input: SendTemplateSmsInput,
  ): Promise<SmsSendResult> {
    return this.provider.sendTemplate(input);
  }
}
