import nodemailer, { Transporter } from "nodemailer";

import { env } from "../../config/env";

import type { SendEmailInput } from "../../interfaces/email.interface";

import type { EmailProvider } from "./email.provider";

export class NodemailerProvider implements EmailProvider {
  private readonly transporter: Transporter | null;

  private readonly enabled: boolean;

  constructor() {
    this.enabled = Boolean(
      env.SMTP_HOST &&
        env.SMTP_PORT &&
        env.SMTP_USER &&
        env.SMTP_PASSWORD &&
        env.SMTP_FROM,
    );

    if (!this.enabled) {
      this.transporter = null;

      return;
    }

    this.transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,

      port: env.SMTP_PORT,

      secure: env.SMTP_SECURE,

      auth: {
        user: env.SMTP_USER,

        pass: env.SMTP_PASSWORD,
      },
    });
  }

  public isAvailable(): boolean {
    return this.enabled;
  }

  public async send(input: SendEmailInput): Promise<void> {
    if (!this.transporter || !this.enabled) {
      throw new Error("Email provider is not configured");
    }

    await this.transporter.sendMail({
      from: env.SMTP_FROM,

      to: input.to,

      subject: input.subject,

      text: input.text,
    });
  }
}
