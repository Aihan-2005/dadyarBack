import { Buffer } from "node:buffer";

import { z } from "zod";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";
import { OTP_CHANNEL } from "../constants/otp.constants";
import {
  EmailSchema,
  normalizePersianDigits,
  PasswordSchema,
  PhoneSchema,
  requireExactlyOneIdentifier,
} from "./commen.validator";

const LANGUAGE = env.LANGUAGE;

const RequiredNameSchema = z.string().trim().min(1).max(100);

// BUG: THIS IS DANGEROUS IT SHOULD BE FIXED
const LoginPasswordSchema = z
  .string()
  .min(1)
  .refine((value) => Buffer.byteLength(value, "utf8") <= 72, {
    message: MESSAGES.passwordTooLong[LANGUAGE],
  });

export const SignupSchema = z
  .object({
    firstName: RequiredNameSchema,

    lastName: RequiredNameSchema,

    email: EmailSchema.optional(),

    phone: PhoneSchema.optional(),

    password: PasswordSchema,
  })
  .strict()
  .superRefine(requireExactlyOneIdentifier);

export const LoginSchema = z
  .object({
    email: EmailSchema.optional(),

    phone: PhoneSchema.optional(),

    password: LoginPasswordSchema,
  })
  .strict()
  .superRefine(requireExactlyOneIdentifier);

const OtpCodeSchema = z.preprocess(
  (value) => {
    if (typeof value === "string") {
      return normalizePersianDigits(value.trim());
    }

    return value;
  },
  z.string().regex(/^\d{6}$/, {
    message: MESSAGES.invalidOtpFormat[LANGUAGE],
  }),
);

export const RequestOtpLoginSchema = z
  .object({
    phone: PhoneSchema.optional(),
    email: EmailSchema.optional(),
  })
  .strict()
  .superRefine(requireExactlyOneIdentifier);

export const OtpLoginSchema = z
  .object({
    phone: PhoneSchema.optional(),

    email: EmailSchema.optional(),

    code: OtpCodeSchema,
  })
  .strict()
  .superRefine(requireExactlyOneIdentifier);

export const RequestPasswordChangeSchema = z.object({
  channel: z.enum(OTP_CHANNEL),
});

export const ChangePasswordSchema = z
  .object({
    code: OtpCodeSchema,

    channel: z.enum(OTP_CHANNEL),

    newPassword: PasswordSchema,
  })
  .strict();

export const RequestClientSignupOtpSchema = z
  .object({
    phone: PhoneSchema,
  })
  .strict();

export const ClientSignupSchema = z
  .object({
    phone: PhoneSchema,

    password: PasswordSchema,

    code: OtpCodeSchema,
  })
  .strict();
