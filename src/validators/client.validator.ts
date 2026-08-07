import { Types } from "mongoose";
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

const RequiredFullNameSchema = z.string().trim().min(1).max(200);

const PhoneSchema = z.preprocess(
  (value) => {
    if (typeof value === "string") {
      return normalizeDigits(value.trim());
    }

    return value;
  },
  z.string().regex(/^09\d{9}$/),
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

    if (normalized === "") {
      return undefined;
    }

    return normalized;
  },
  z
    .string()
    .regex(/^\d{10}$/)
    .optional(),
);

const OptionalHomeNumberSchema = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    return value;
  }

  const normalized = normalizeDigits(value.trim());

  if (normalized === "") {
    return undefined;
  }

  return normalized;
}, z.string().max(30).optional());

const OptionalAddressSchema = z.preprocess((value) => {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();

    return trimmed === "" ? undefined : trimmed;
  }

  return value;
}, z.string().max(500).optional());

const OptionalBirthdaySchema = z.preprocess(
  (value) => {
    if (value === undefined || value === null || value === "") {
      return undefined;
    }

    return value;
  },
  z.coerce
    .date()
    .refine((date) => date.getTime() <= Date.now(), {
      message: MESSAGES.notYetBorn[LANGUAGE],
    })
    .optional(),
);

export const MongoIdSchema = z
  .string()
  .trim()
  .refine((value) => Types.ObjectId.isValid(value), {
    message: MESSAGES.invalidObjectId[LANGUAGE],
  });

const OptionalRepresentSchema = z.preprocess((value) => {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return value;
}, z.string().trim().max(200).optional());

const ClientBodySchema = z
  .object({
    fullName: RequiredFullNameSchema,

    phone: PhoneSchema,

    nationalId: OptionalNationalIdSchema,

    homeNumber: OptionalHomeNumberSchema,

    birthday: OptionalBirthdaySchema,

    homeAddress: OptionalAddressSchema,

    represent: OptionalRepresentSchema,
  })
  .strict();

export const CreateClientSchema = ClientBodySchema;

export const UpdateClientSchema = ClientBodySchema.partial().superRefine(
  (data, context) => {
    if (Object.keys(data).length === 0) {
      context.addIssue({
        code: "custom",

        message: MESSAGES.noClientFieldFound[LANGUAGE],
      });
    }
  },
);

export const ParamClientIdSchema = z
  .object({
    clientId: MongoIdSchema,
  })
  .strict();

export const ClientPhoneQuerySchema = z
  .object({
    phone: PhoneSchema,
  })
  .strict();

export const ListClientsQuerySchema = z
  .object({
    search: z.string().trim().max(100).optional(),

    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),
  })
  .strict();
