import { Buffer } from "node:buffer";

import { z } from "zod";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

const LANGUAGE = env.LANGUAGE;

function normalizeDigits(value: string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";

  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

  return value
    .replace(/[۰-۹]/g, (character) => String(persianDigits.indexOf(character)))
    .replace(/[٠-٩]/g, (character) => String(arabicDigits.indexOf(character)));
}

const RequiredNameSchema = z.string().trim().min(1).max(100);

const EmailSchema = z.string().trim().toLowerCase().email();

const PhoneSchema = z.preprocess(
  (value) => {
    if (typeof value === "string") {
      return normalizeDigits(value.trim());
    }

    return value;
  },
  z.string().regex(/^09\d{9}$/),
);

const PasswordSchema = z
  .string()
  .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
  .refine((value) => Buffer.byteLength(value, "utf8") <= 72, {
    message: MESSAGES.passwordTooLong[LANGUAGE],
  });

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
  .superRefine((data, context) => {
    if (!data.email && !data.phone) {
      context.addIssue({
        code: z.ZodIssueCode.custom,

        path: ["email"],

        message: MESSAGES.noEmailNorPhone[LANGUAGE],
      });
    }
  });

export const LoginSchema = z
  .object({
    email: EmailSchema.optional(),

    phone: PhoneSchema.optional(),

    password: LoginPasswordSchema,
  })
  .strict()
  .superRefine((data, context) => {
    const identifierCount =
      Number(Boolean(data.email)) + Number(Boolean(data.phone));

    if (identifierCount !== 1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,

        path: ["email"],

        message: "دقیقاً یکی از ایمیل یا شماره همراه باید ارسال شود",
      });
    }
  });
