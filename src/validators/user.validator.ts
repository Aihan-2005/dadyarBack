import { z } from "zod";

import { USER_ROLES, USER_STATUSES } from "../constants/user.constants";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

const LANGUAGE = env.LANGUAGE;

export const UserRoleSchema = z.enum(USER_ROLES);

export const UserStatusSchema = z.enum(USER_STATUSES);

const UserEmailSchema = z.email().trim().toLowerCase();

const UserPhoneSchema = z
  .string()
  .trim()
  .regex(/^09\d{9}$/);

export const CreateUserDataSchema = z
  .object({
    email: UserEmailSchema.optional(),

    phone: UserPhoneSchema.optional(),

    password: z.string().min(1),

    role: UserRoleSchema,

    emailVerifiedAt: z.date().nullable().optional(),

    phoneVerifiedAt: z.date().nullable().optional(),
  })
  .superRefine((data, context) => {
    if (!data.email && !data.phone) {
      context.addIssue({
        code: "custom",

        path: ["email"],

        message: MESSAGES.noEmailNorPhone[LANGUAGE],
      });
    }
  });
