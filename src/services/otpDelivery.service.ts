import { HttpException } from "../exceptions/httpException";

import { env } from "../config/env";

import type {
  OtpDelivery,
  SendOtpDeliveryInput,
} from "../interfaces/otpDelivery.interface";

import { SmsService } from "./sms.service";

import { EmailService } from "./email.service";

export class OtpDeliveryService implements OtpDelivery {
  constructor(
    private readonly smsService: SmsService,

    private readonly emailService: EmailService,
  ) {}

  public async send(input: SendOtpDeliveryInput): Promise<void> {
    if (input.channel === "phone") {
      if (!this.smsService.isAvailable()) {
        throw new HttpException(
          503,
          "SMS service is unavailable",
          "SMS_DISABLED",
        );
      }

      await this.smsService.sendTemplate({
        phone: input.destination,

        templateId: env.SMSIR_OTP_TEMPLATE_ID!,

        parameters: [
          {
            name: "Code",

            value: input.code,
          },
        ],
      });

      return;
    }

    if (!this.emailService.isAvailable()) {
      throw new HttpException(
        503,
        "Email service is unavailable",
        "EMAIL_DISABLED",
      );
    }

    await this.emailService.send({
      to: input.destination,

      subject: "Your verification code",

      text: `Your verification code is ${input.code}`,
    });
  }
}
