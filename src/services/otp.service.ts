import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

import { env } from "../config/env";
import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";
import { SmsProviderException } from "../exceptions/smsProvider.exception";

import type {
  CreateOtpInput,
  CreateOtpOptions,
  CreateOtpResult,
  VerifyOtpInput,
  VerifyOtpResult,
} from "../interfaces/otp.interface";

import type { OtpStore } from "../stores/otp/otp.store";

import type { OtpCooldownStore } from "../stores/otp/otpCooldown.store";

import { SmsService } from "./sms.service";

const LANGUAGE = env.LANGUAGE;

export class OtpService {
  constructor(
    private readonly otpStore: OtpStore,

    private readonly cooldownStore: OtpCooldownStore,

    private readonly smsService: SmsService = new SmsService(),
  ) {}

  private buildOtpKey(phone: string, purpose: string): string {
    return ["otp", purpose, phone].join(":");
  }

  private buildCooldownKey(phone: string, purpose: string): string {
    return ["otp", "cooldown", purpose, phone].join(":");
  }

  private generateCode(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, "0");
  }

  private hashCode(code: string): string {
    return createHmac("sha256", env.OTP_HMAC_SECRET).update(code).digest("hex");
  }

  private hashesMatch(firstHash: string, secondHash: string): boolean {
    const first = Buffer.from(firstHash, "hex");

    const second = Buffer.from(secondHash, "hex");

    if (first.length !== second.length) {
      return false;
    }

    return timingSafeEqual(first, second);
  }

  private getRequestMetadata(): CreateOtpResult {
    return {
      expiresIn: env.OTP_TTL_SECONDS,

      resendAfter: env.OTP_RESEND_COOLDOWN_SECONDS,
    };
  }

  public async createOtp(
    input: CreateOtpInput,
    options: CreateOtpOptions = {},
  ): Promise<CreateOtpResult> {
    const cooldownKey = this.buildCooldownKey(input.phone, input.purpose);

    const cooldownAcquired = await this.cooldownStore.tryAcquire(
      cooldownKey,
      env.OTP_RESEND_COOLDOWN_SECONDS,
    );

    if (!cooldownAcquired) {
      const retryAfter =
        await this.cooldownStore.getRemainingSeconds(cooldownKey);

      throw new HttpException(
        429,
        MESSAGES.otpResendCooldown[LANGUAGE],
        "OTP_RESEND_COOLDOWN",
        {
          retryAfter,
        },
      );
    }

    const shouldDeliver = options.deliver ?? true;

    if (!shouldDeliver) {
      return this.getRequestMetadata();
    }

    const templateId = env.SMSIR_OTP_TEMPLATE_ID;

    if (!templateId) {
      await this.cooldownStore.release(cooldownKey);

      throw new HttpException(
        500,
        MESSAGES.otpDeliveryFailed[LANGUAGE],
        "OTP_DELIVERY_FAILED",
      );
    }

    const code = this.generateCode();

    if (env.NODE_ENV === "development") {
      console.log(code);
    }

    const key = this.buildOtpKey(input.phone, input.purpose);

    await this.otpStore.set(
      key,
      {
        codeHash: this.hashCode(code),

        attempts: 0,
      },
      env.OTP_TTL_SECONDS,
    );

    try {
      await this.smsService.sendTemplate({
        phone: input.phone,

        templateId,

        parameters: [
          {
            name: "Code",

            value: code,
          },
        ],
      });
    } catch (error) {
      await this.otpStore.delete(key);

      await this.cooldownStore.release(cooldownKey);

      if (error instanceof SmsProviderException) {
        console.error("SMS provider error:", {
          provider: error.provider,

          message: error.message,
        });
      }

      throw new HttpException(
        502,
        MESSAGES.otpDeliveryFailed[LANGUAGE],
        "OTP_DELIVERY_FAILED",
      );
    }

    return this.getRequestMetadata();
  }

  public async verifyOtp(input: VerifyOtpInput): Promise<VerifyOtpResult> {
    const key = this.buildOtpKey(input.phone, input.purpose);

    const storedOtp = await this.otpStore.get(key);

    if (!storedOtp) {
      throw new HttpException(
        400,
        MESSAGES.otpInvalidOrExpired[LANGUAGE],
        "OTP_INVALID_OR_EXPIRED",
      );
    }

    if (storedOtp.attempts >= env.OTP_MAX_ATTEMPTS) {
      await this.otpStore.delete(key);

      throw new HttpException(
        429,
        MESSAGES.otpAttemptsExceeded[LANGUAGE],
        "OTP_ATTEMPTS_EXCEEDED",
      );
    }

    const submittedHash = this.hashCode(input.code);

    const matches = this.hashesMatch(submittedHash, storedOtp.codeHash);

    if (!matches) {
      const attempts = await this.otpStore.incrementAttempts(key);

      if (attempts !== null && attempts >= env.OTP_MAX_ATTEMPTS) {
        await this.otpStore.delete(key);

        throw new HttpException(
          429,
          MESSAGES.otpAttemptsExceeded[LANGUAGE],
          "OTP_ATTEMPTS_EXCEEDED",
        );
      }

      throw new HttpException(
        400,
        MESSAGES.otpInvalidOrExpired[LANGUAGE],
        "OTP_INVALID_OR_EXPIRED",
      );
    }

    const consumedOtp = await this.otpStore.consume(key, storedOtp.codeHash);

    if (!consumedOtp) {
      throw new HttpException(
        400,
        MESSAGES.otpInvalidOrExpired[LANGUAGE],
        "OTP_INVALID_OR_EXPIRED",
      );
    }

    return {
      verified: true,
    };
  }
}
