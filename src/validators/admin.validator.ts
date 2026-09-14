import { z } from "zod";

import {
  LAWYER_STATUSES,
} from "../constants/lawyer.constants";

import {
  USER_STATUSES,
} from "../constants/user.constants";

import {
  EmailSchema,
  MongoIdSchema,
  PasswordSchema,
  PhoneSchema,
  cleanOptionalString,
  requireExactlyOneIdentifier,
} from "./common.validator";

const AdminLawyerNameSchema =
  z
    .string()
    .trim()
    .min(
      1,
      "نام نمی‌تواند خالی باشد",
    )
    .max(
      100,
      "نام بیش از حد طولانی است",
    );

export const AdminCreateLawyerSchema =
  z
    .object({
      firstName:
        AdminLawyerNameSchema,

      lastName:
        AdminLawyerNameSchema,

      email:
        EmailSchema.optional(),

      phone:
        PhoneSchema.optional(),

      password:
        PasswordSchema,

      specialization:
        cleanOptionalString(
          150,
        ),

      licenseNumber:
        cleanOptionalString(
          50,
        ),
    })
    .strict()
    .superRefine(
      requireExactlyOneIdentifier,
    );

export const AdminUserListQuerySchema =
  z
    .object({
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

export const AdminLawyerListQuerySchema =
  z
    .object({
      search:
        z
          .string()
          .trim()
          .max(100)
          .optional(),

      lawyerStatus:
        z
          .enum(
            LAWYER_STATUSES,
          )
          .optional(),

      accountStatus:
        z
          .enum(
            USER_STATUSES,
          )
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

export const AdminClientListQuerySchema =
  z
    .object({
      search:
        z
          .string()
          .trim()
          .max(100)
          .optional(),

      accountStatus:
        z
          .enum(
            USER_STATUSES,
          )
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

export const AdminUserIdParamSchema =
  z
    .object({
      id:
        MongoIdSchema,
    })
    .strict();

export const AdminUpdateLawyerStatusSchema =
  z
    .object({
      status:
        z.enum(
          LAWYER_STATUSES,
        ),
    })
    .strict();

export const AdminUpdateUserStatusSchema =
  z
    .object({
      status:
        z.enum(
          USER_STATUSES,
        ),
    })
    .strict();

export const AdminResetUserPasswordSchema =
  z
    .object({
      newPassword:
        PasswordSchema,
    })
    .strict();

export const AdminPublishClientLawyerSchema =
  z
    .object({
      isFeatured:
        z
          .boolean()
          .default(
            false,
          ),

      displayOrder:
        z.coerce
          .number()
          .int()
          .min(1)
          .optional(),
    })
    .strict();

export const AdminUpdateClientLawyerSchema =
  z
    .object({
      isFeatured:
        z
          .boolean()
          .optional(),

      displayOrder:
        z.coerce
          .number()
          .int()
          .min(1)
          .optional(),
    })
    .strict()
    .refine(
      (value) =>
        value.isFeatured !==
          undefined ||
        value.displayOrder !==
          undefined,
      {
        message:
          "حداقل یکی از فیلدهای isFeatured یا displayOrder باید ارسال شود",
      },
    );