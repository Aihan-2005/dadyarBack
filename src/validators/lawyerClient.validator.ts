import { Types } from "mongoose";

import { z } from "zod";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";
import {
  cleanOptionalString,
  normalizePersianDigits,
  PhoneSchema,
} from "./commen.validator";

const LANGUAGE = env.LANGUAGE;

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

/**
 * We intentionally don't trim personalPassword.
 *
 * It belongs to a third-party system and
 * Dadyar should preserve the exact value.
 */
function optionalPersonalPassword(value: unknown): unknown {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }

  return value;
}

function clearablePersonalPassword(value: unknown): unknown {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || value === "") {
    return null;
  }

  return value;
}

const RequiredFullNameSchema = z.string().trim().min(1).max(200);

export const OptionalNationalIdSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== "string") {
      return value;
    }

    const normalized = normalizePersianDigits(value.trim());

    return normalized === "" ? undefined : normalized;
  },

  z
    .string()
    .regex(/^\d{10}$/)
    .optional(),
);

export const OptionalLawyerClientIdentitySchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== "string") {
      return value;
    }

    const normalized = normalizePersianDigits(value.trim());

    return normalized === "" ? undefined : normalized;
  },

  z
    .string()
    .regex(/^\d{10,11}$/)
    .optional(),
);

const OptionalHomeNumberSchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null) {
      return undefined;
    }

    if (typeof value !== "string") {
      return value;
    }

    const normalized = normalizePersianDigits(value.trim());

    return normalized === "" ? undefined : normalized;
  },

  z.string().max(30).optional(),
);

const OptionalBirthdaySchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    return value;
  },

  z.coerce
    .date()
    .refine(
      (date) => date.getTime() <= Date.now(),

      {
        message: MESSAGES.notYetBorn[LANGUAGE],
      },
    )
    .optional(),
);

const OptionalAddressSchema = cleanOptionalString(500);

const OptionalRepresentSchema = cleanOptionalString(200);

const OptionalDescriptionSchema = cleanOptionalString(1000);

const PersonalPasswordSchema = z
  .string()
  .min(1, {
    message: "Personal password cannot be empty.",
  })
  .max(200, {
    message: "Personal password cannot exceed 200 characters.",
  });

const OptionalPersonalPasswordSchema = z.preprocess(
  optionalPersonalPassword,

  PersonalPasswordSchema.optional(),
);

const ClearablePersonalPasswordSchema = z.preprocess(
  clearablePersonalPassword,

  z.union([z.null(), PersonalPasswordSchema]).optional(),
);

export const ClearableNationalIdSchema = z.preprocess(
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

    const normalized = normalizePersianDigits(value.trim());

    return normalized === "" ? null : normalized;
  },

  z.union([z.null(), z.string().regex(/^\d{10}$/)]).optional(),
);

const ClearableLawyerClientIdentitySchema = z.preprocess(
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

    const normalized = normalizePersianDigits(value.trim());

    return normalized === "" ? null : normalized;
  },

  z.union([z.null(), z.string().regex(/^\d{10,11}$/)]).optional(),
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

    const normalized = normalizePersianDigits(value.trim());

    return normalized === "" ? null : normalized;
  },

  z.union([z.null(), z.string().max(30)]).optional(),
);

const ClearableBirthdaySchema = z.preprocess(
  (value) => {
    if (value === undefined) {
      return undefined;
    }

    if (value === null || value === "") {
      return null;
    }

    return value;
  },

  z
    .union([
      z.null(),

      z.coerce.date().refine(
        (date) => date.getTime() <= Date.now(),

        {
          message: MESSAGES.notYetBorn[LANGUAGE],
        },
      ),
    ])
    .optional(),
);

const ClearableAddressSchema = z.preprocess(
  clearableTrimmedString,

  z.union([z.null(), z.string().max(500)]).optional(),
);

const ClearableRepresentSchema = z.preprocess(
  clearableTrimmedString,

  z.union([z.null(), z.string().max(200)]).optional(),
);

const ClearableDescriptionSchema = z.preprocess(
  clearableTrimmedString,

  z.union([z.null(), z.string().max(1000)]).optional(),
);

export const MongoIdSchema = z
  .string()
  .trim()
  .refine(
    (value) => Types.ObjectId.isValid(value),

    {
      message: MESSAGES.invalidObjectId[LANGUAGE],
    },
  );

export const CreateLawyerClientSchema = z
  .object({
    fullName: RequiredFullNameSchema,

    phone: PhoneSchema,

    nationalId: OptionalLawyerClientIdentitySchema,

    homeNumber: OptionalHomeNumberSchema,

    birthday: OptionalBirthdaySchema,

    homeAddress: OptionalAddressSchema,

    represent: OptionalRepresentSchema,

    description: OptionalDescriptionSchema,

    personalPassword: OptionalPersonalPasswordSchema,
  })
  .strict();

export const UpdateLawyerClientSchema = z
  .object({
    fullName: RequiredFullNameSchema.optional(),

    phone: PhoneSchema.optional(),

    nationalId: ClearableLawyerClientIdentitySchema,

    homeNumber: ClearableHomeNumberSchema,

    birthday: ClearableBirthdaySchema,

    homeAddress: ClearableAddressSchema,

    represent: ClearableRepresentSchema,

    description: ClearableDescriptionSchema,

    personalPassword: ClearablePersonalPasswordSchema,
  })
  .strict()
  .superRefine((data, context) => {
    const hasAtLeastOneEffectiveField = Object.values(data).some(
      (value) => value !== undefined,
    );

    if (!hasAtLeastOneEffectiveField) {
      context.addIssue({
        code: "custom",

        message: MESSAGES.noClientFieldFound[LANGUAGE],
      });
    }
  });

export const LawyerClientIdParamSchema = z
  .object({
    clientId: MongoIdSchema,
  })
  .strict();

export const LawyerClientPhoneQuerySchema = z
  .object({
    phone: PhoneSchema,
  })
  .strict();

export const ListLawyerClientsQuerySchema = z
  .object({
    search: z.string().trim().max(100).optional(),

    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(20),
  })
  .strict();
