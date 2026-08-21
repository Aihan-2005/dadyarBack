import type { SendEmailInput } from "../interfaces/email.interface";

import type { EmailProvider } from "../providers/email/email.provider";

import { NodemailerProvider } from "../providers/email/nodemailer.provider";

export class EmailService {
  constructor(
    private readonly provider: EmailProvider = new NodemailerProvider(),
  ) {}

  public isAvailable(): boolean {
    return this.provider.isAvailable();
  }

  public send(input: SendEmailInput) {
    return this.provider.send(input);
  }
}
