import { z } from "zod";

import { USER_ROLES, USER_STATUSES } from "../constants/user.constants";

import {
  EmailSchema,
  PasswordSchema,
  PhoneSchema,
  requireExactlyOneIdentifier,
} from "./commen.validator";

export const UserRoleSchema = z.enum(USER_ROLES);

export const UserStatusSchema = z.enum(USER_STATUSES);

export const CreateUserDataSchema = z
  .object({
    email: EmailSchema.optional(),

    phone: PhoneSchema.optional(),

    password: PasswordSchema,

    role: UserRoleSchema,

    emailVerifiedAt: z.date().nullable().optional(),

    phoneVerifiedAt: z.date().nullable().optional(),
  })
  .superRefine(requireExactlyOneIdentifier);
