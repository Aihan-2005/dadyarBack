import { Types } from "mongoose";

import { z } from "zod";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

const LANGUAGE = env.LANGUAGE;
export const MongoIdSchema = z
  .string()
  .trim()
  .refine(
    (value) => Types.ObjectId.isValid(value),

    {
      message: MESSAGES.invalidObjectId[LANGUAGE],
    },
  );

export const normalizePersianDigits = (value: string): string => {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";

  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

  return value
    .replace(/[۰-۹]/g, (character) => String(persianDigits.indexOf(character)))
    .replace(/[٠-٩]/g, (character) => String(arabicDigits.indexOf(character)));
};

export const EmailSchema = z.email().trim().toLowerCase();

export const requireExactlyOneIdentifier = (
  data: {
    phone?: string;
    email?: string;
  },
  context: z.RefinementCtx,
): void => {
  const identifierCount =
    Number(Boolean(data.email)) + Number(Boolean(data.phone));

  if (identifierCount !== 1) {
    context.addIssue({
      code: "custom",

      path: ["email"],

      message: MESSAGES.identifierExactlyOneRequired[LANGUAGE],
    });
  }
};

export const PhoneSchema = z.preprocess(
  (value) => {
    if (typeof value === "string") {
      return normalizePersianDigits(value.trim());
    }

    return value;
  },
  z.string().regex(/^09\d{9}$/),
);

export const PasswordSchema = z
  .string()
  .min(8, "رمز عبور باید حداقل ۸ کاراکتر باشد")
  .refine((value) => Buffer.byteLength(value, "utf8") <= 72, {
    message: MESSAGES.passwordTooLong[LANGUAGE],
  });

export const RequiredString = z.string().trim().min(1);

export const cleanOptionalString = (maxLength: number) =>
  z.preprocess(
    (value) => {
      if (value === undefined || value === null) {
        return undefined;
      }

      if (typeof value === "string" && value.trim() === "") {
        return undefined;
      }

      return value;
    },

    z.string().trim().max(maxLength).optional(),
  );

export const OptionalString = z.string().trim().optional();
