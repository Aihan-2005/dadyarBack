import type { SendOtpSmsInput } from "../interfaces/sms.interface";

import type { SmsProvider } from "../providers/sms/sms.provider";

export class SmsService {
  constructor(private readonly provider: SmsProvider) {}

  public isAvailable(): boolean {
    return this.provider.isAvailable();
  }

  public async sendOtp(input: SendOtpSmsInput) {
    return this.provider.sendOtp(input);
  }
}
