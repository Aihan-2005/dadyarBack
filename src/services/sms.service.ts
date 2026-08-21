import type { SendTemplateSmsInput } from "../interfaces/sms.interface";

import type { SmsProvider } from "../providers/sms/sms.provider";

import { SmsIrProvider } from "../providers/sms/smsIr.provider";

export class SmsService {
  constructor(private readonly provider: SmsProvider = new SmsIrProvider()) {}

  public isAvailable(): boolean {
    return this.provider.isAvailable();
  }

  public async sendTemplate(input: SendTemplateSmsInput) {
    return this.provider.sendTemplate(input);
  }
}
