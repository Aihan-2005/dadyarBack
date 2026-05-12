import { z } from "zod";
import { MESSAGES } from "../constants/messages";
import { env } from "../config/env";

const LANGUAGE = env.LANGUAGE;

const RequiredString = z.string().trim().min(1);

const OptionalString = z.string().trim().max(2000).optional();

const EmailSchema = z.string().trim().toLowerCase().email();

const PhoneSchema = z
  .string()
  .trim()
  .regex(/^09\d{9}$/);

const PasswordSchema = z.string().min(8);

const LoginPasswordSchema = z.string().min(1);

const AddressSchema = z.object({
  province: RequiredString,

  city: RequiredString,

  fullAddress: RequiredString.max(200),
});

export const SignupSchema = z
  .object({
    name: RequiredString,

    lastname: RequiredString,

    email: EmailSchema.optional(),

    phone: PhoneSchema.optional(),

    password: PasswordSchema,

    barLicenseNumber: RequiredString,

    address: AddressSchema,

    yearsOfExperience: z.number().int().min(0).max(80),

    website: z.string().trim().url().optional(),

    bio: OptionalString,
  })
  .refine((data) => !!data.email || !!data.phone, {
    message: MESSAGES.noEmailNorPhone[LANGUAGE],
  });

export const LoginSchema = z
  .object({
    email: EmailSchema.optional(),

    phone: PhoneSchema.optional(),

    password: LoginPasswordSchema,
  })
  .refine((data) => !!data.email || !!data.phone, {
    message: MESSAGES.noEmailNorPhone[LANGUAGE],
  });
