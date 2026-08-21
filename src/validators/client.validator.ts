import { Buffer } from "node:buffer";

import { Types } from "mongoose";
import { z } from "zod";

import { env } from "../config/env";
import { MESSAGES } from "../constants/messages.constants";

const LANGUAGE = env.LANGUAGE;

 

function normalizeDigits(value: string): string {
  const persianDigits = "۰۱۲۳۴۵۶۷۸۹";
  const arabicDigits = "٠١٢٣٤٥٦٧٨٩";

  return value
    .replace(/[۰-۹]/g, (character) =>
      String(persianDigits.indexOf(character)),
    )
    .replace(/[٠-٩]/g, (character) =>
      String(arabicDigits.indexOf(character)),
    );
}

function optionalTrimmedString(value: unknown): unknown {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  return trimmed === "" ? undefined : trimmed;
}

function clearableTrimmedString(value: unknown): unknown {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  if (typeof value !== "string") {
    return value;
  }

  const trimmed = value.trim();

  return trimmed === "" ? null : trimmed;
}

 
const RequiredFullNameSchema = z.string().trim().min(1).max(200);

 

const PhoneSchema = z.preprocess(
  (value) => {
    if (typeof value !== "string") {
      return value;
    }

    return normalizeDigits(value.trim());
  },

  z.string().regex(/^09\d{9}$/, {
    message: MESSAGES.invalidPhoneFormat[LANGUAGE],
  }),
);

 
export const OptionalNationalIdSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== "string") {
      return value;
    }

    const normalized = normalizeDigits(value.trim());

    return normalized === "" ? undefined : normalized;
  },

  z.string().regex(/^\d{10}$/).optional(),
);

/**
 * کد ملی شخص حقیقی (۱۰ رقم) یا شناسه ملی شخص حقوقی (۱۱ رقم).
 */
export const OptionalClientIdentitySchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== "string") {
      return value;
    }

    const normalized = normalizeDigits(value.trim());

    return normalized === "" ? undefined : normalized;
  },

  z.string().regex(/^\d{10,11}$/).optional(),
);

 

const OptionalHomeNumberSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== "string") {
      return value;
    }

    const normalized = normalizeDigits(value.trim());

    return normalized === "" ? undefined : normalized;
  },

  z.string().max(30).optional(),
);

 
const OptionalBirthdaySchema = z.preprocess(
  (value) => {
    if (
      value === undefined ||
      value === null ||
      value === ""
    ) {
      return undefined;
    }

    return value;
  },

  z.coerce
    .date()
    .refine(
      (date) =>
        date.getTime() <=
        Date.now(),
      {
        message:
          MESSAGES.notYetBorn[
            LANGUAGE
          ],
      },
    )
    .optional(),
);

 

const OptionalAddressSchema = z.preprocess(
  optionalTrimmedString,

  z.string().max(500).optional(),
);

const OptionalRepresentSchema = z.preprocess(
  optionalTrimmedString,

  z.string().max(200).optional(),
);

const OptionalDescriptionSchema = z.preprocess(
  optionalTrimmedString,

  z.string().max(1000).optional(),
);

 

const OptionalPersonalPasswordSchema = z.preprocess(
  optionalTrimmedString,

  z
    .string()
    .min(6, {
      message:
        "Personal password must be at least 6 characters.",
    })
    .max(64, {
      message:
        "Personal password cannot exceed 64 characters.",
    })
    .refine(
      (value) =>
        Buffer.byteLength(
          value,
          "utf8",
        ) <= 72,
      {
        message:
          "Personal password cannot exceed bcrypt's 72-byte UTF-8 limit.",
      },
    )
    .optional(),
);

 

const ClearableNationalIdSchema = z.preprocess(
  (value) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    if (typeof value !== "string") {
      return value;
    }

    const normalized = normalizeDigits(value.trim());

    return normalized === "" ? null : normalized;
  },

  z
    .union([
      z.null(),
      z.string().regex(/^\d{10}$/),
    ])
    .optional(),
);

const ClearableClientIdentitySchema = z.preprocess(
  (value) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    if (typeof value !== "string") {
      return value;
    }

    const normalized = normalizeDigits(value.trim());

    return normalized === "" ? null : normalized;
  },

  z
    .union([
      z.null(),
      z.string().regex(/^\d{10,11}$/),
    ])
    .optional(),
);

 

const ClearableHomeNumberSchema = z.preprocess(
  (value) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === null) {
      return null;
    }

    if (typeof value !== "string") {
      return value;
    }

    const normalized = normalizeDigits(value.trim());

    return normalized === "" ? null : normalized;
  },

  z
    .union([
      z.null(),
      z.string().max(30),
    ])
    .optional(),
);

 
const ClearableBirthdaySchema = z.preprocess(
  (value) => {
    if (value === undefined) {
      return undefined;
    }

    if (
      value === null ||
      value === ""
    ) {
      return null;
    }

    return value;
  },

  z
    .union([
      z.null(),

      z.coerce
        .date()
        .refine(
          (date) =>
            date.getTime() <=
            Date.now(),
          {
            message:
              MESSAGES.notYetBorn[
                LANGUAGE
              ],
          },
        ),
    ])
    .optional(),
);

 
const ClearableAddressSchema = z.preprocess(
  clearableTrimmedString,

  z
    .union([
      z.null(),
      z.string().max(500),
    ])
    .optional(),
);

const ClearableRepresentSchema = z.preprocess(
  clearableTrimmedString,

  z
    .union([
      z.null(),
      z.string().max(200),
    ])
    .optional(),
);

const ClearableDescriptionSchema = z.preprocess(
  clearableTrimmedString,

  z
    .union([
      z.null(),
      z.string().max(1000),
    ])
    .optional(),
);
 

export const MongoIdSchema = z
  .string()
  .trim()
  .refine(
    (value) =>
      Types.ObjectId.isValid(
        value,
      ),
    {
      message:
        MESSAGES.invalidObjectId[
          LANGUAGE
        ],
    },
  );

 

export const CreateClientSchema = z
  .object({
    fullName:
      RequiredFullNameSchema,

    phone:
      PhoneSchema,

    nationalId:
      OptionalClientIdentitySchema,

    homeNumber:
      OptionalHomeNumberSchema,

    birthday:
      OptionalBirthdaySchema,

    homeAddress:
      OptionalAddressSchema,

    represent:
      OptionalRepresentSchema,

    description:
      OptionalDescriptionSchema,

    
    personalPassword:
      OptionalPersonalPasswordSchema,
  })
  .strict();

 

export const UpdateClientSchema = z
  .object({
    fullName:
      RequiredFullNameSchema
        .optional(),

    phone:
      PhoneSchema
        .optional(),

    nationalId:
      ClearableClientIdentitySchema,

    homeNumber:
      ClearableHomeNumberSchema,

    birthday:
      ClearableBirthdaySchema,

    homeAddress:
      ClearableAddressSchema,

    represent:
      ClearableRepresentSchema,

    description:
      ClearableDescriptionSchema,

   
    personalPassword:
      OptionalPersonalPasswordSchema,
  })
  .strict()
  .superRefine(
    (
      data,
      context,
    ) => {
      const hasAtLeastOneEffectiveField =
        Object.values(
          data,
        ).some(
          (value) =>
            value !==
            undefined,
        );

      if (
        !hasAtLeastOneEffectiveField
      ) {
        context.addIssue({
          code:
            "custom",

          message:
            MESSAGES.noClientFieldFound[
              LANGUAGE
            ],
        });
      }
    },
  );

 

export const ParamClientIdSchema = z
  .object({
    clientId:
      MongoIdSchema,
  })
  .strict();
 

export const ClientPhoneQuerySchema = z
  .object({
    phone:
      PhoneSchema,
  })
  .strict();

 
export const ListClientsQuerySchema = z
  .object({
    search:
      z
        .string()
        .trim()
        .max(100)
        .optional(),

    page:
      z.coerce
        .number()
        .int()
        .min(1)
        .default(1),

    limit:
      z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .default(20),
  })
  .strict();