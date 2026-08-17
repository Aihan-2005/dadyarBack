import { z } from "zod";

import {
  LAWYER_ROLES,
  LAWYER_STATUSES,
} from "../../constants/lawyer.constants";

import { openApiRegistry } from "../openapi.registry";

import {
  ApiErrorSchema,
  DateTimeResponseSchema,
  ObjectIdResponseSchema,
} from "./common.openapi";

// ========================================================
// Lawyer Role / Status
// ========================================================

export const LawyerRoleResponseSchema = openApiRegistry.register(
  "LawyerRoleResponse",

  z.literal(LAWYER_ROLES.LAWYER),
);

export const LawyerStatusResponseSchema = openApiRegistry.register(
  "LawyerStatusResponse",

  z.enum([
    LAWYER_STATUSES.PENDING_VERIFICATION,
    LAWYER_STATUSES.ACTIVE,
    LAWYER_STATUSES.SUSPENDED,
    LAWYER_STATUSES.REJECTED,
  ]),
);

// ========================================================
// Verification
// ========================================================

const VerificationItemSchema = z.object({
  verified: z.boolean(),

  verifiedAt: DateTimeResponseSchema.nullable(),
});

export const LawyerVerificationSchema = openApiRegistry.register(
  "LawyerVerification",

  z.object({
    email: VerificationItemSchema,

    phone: VerificationItemSchema,

    license: VerificationItemSchema,
  }),
);

// ========================================================
// Profile Nested Data
// ========================================================

export const PublicEducationSchema = openApiRegistry.register(
  "PublicLawyerEducation",

  z.object({
    id: ObjectIdResponseSchema,

    degree: z.string(),

    field: z.string(),

    university: z.string(),

    year: z.string(),
  }),
);

export const PublicExperienceSchema = openApiRegistry.register(
  "PublicLawyerExperience",

  z.object({
    id: ObjectIdResponseSchema,

    title: z.string(),

    company: z.string(),

    startYear: z.string(),

    endYear: z.string(),

    description: z.string(),
  }),
);

export const SkillLevelResponseSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
]);

export const PublicSkillSchema = openApiRegistry.register(
  "PublicLawyerSkill",

  z.object({
    id: ObjectIdResponseSchema,

    name: z.string(),

    level: SkillLevelResponseSchema,
  }),
);

// ========================================================
// Lawyer Profile
// ========================================================

export const LawyerProfileResponseSchema = openApiRegistry.register(
  "LawyerProfileResponse",

  z.object({
    specialization: z.string(),

    licenseNumber: z.string(),

    yearsOfExperience: z.number(),

    phone: z.string(),

    website: z.string(),

    address: z.string(),

    bio: z.string(),

    education: z.array(PublicEducationSchema),

    experience: z.array(PublicExperienceSchema),

    skills: z.array(PublicSkillSchema),

    languages: z.array(z.string()),
  }),
);

// ========================================================
// Public Lawyer
// ========================================================

export const PublicLawyerSchema = openApiRegistry.register(
  "PublicLawyer",

  z.object({
    id: ObjectIdResponseSchema,

    firstName: z.string(),

    lastName: z.string(),

    email: z.string().nullable(),

    role: LawyerRoleResponseSchema,

    status: LawyerStatusResponseSchema,

    verification: LawyerVerificationSchema,

    profile: LawyerProfileResponseSchema,

    lastLoginAt: DateTimeResponseSchema.nullable(),

    createdAt: DateTimeResponseSchema.nullable(),

    updatedAt: DateTimeResponseSchema.nullable(),
  }),
);

// ========================================================
// Login / Signup
// ========================================================

export const AuthSessionDataSchema = openApiRegistry.register(
  "AuthSessionData",

  z.object({
    user: PublicLawyerSchema,

    accessToken: z.string(),

    accessTokenExpiresIn: z.number().int(),
  }),
);

export const AuthSessionSuccessSchema = openApiRegistry.register(
  "AuthSessionSuccess",

  z.object({
    success: z.literal(true),

    data: AuthSessionDataSchema,
  }),
);

// ========================================================
// OTP Login
// ========================================================

export const OtpRequestDataSchema = openApiRegistry.register(
  "OtpRequestData",

  z.object({
    expiresIn: z.number().int().positive(),

    resendAfter: z.number().int().nonnegative(),
  }),
);

export const OtpRequestSuccessSchema = openApiRegistry.register(
  "OtpRequestSuccess",

  z.object({
    success: z.literal(true),

    data: OtpRequestDataSchema,
  }),
);

// ========================================================
// Refresh
// ========================================================

export const RefreshTokenDataSchema = openApiRegistry.register(
  "RefreshTokenData",

  z.object({
    accessToken: z.string(),

    accessTokenExpiresIn: z.number().int(),
  }),
);

export const RefreshTokenSuccessSchema = openApiRegistry.register(
  "RefreshTokenSuccess",

  z.object({
    success: z.literal(true),

    data: RefreshTokenDataSchema,
  }),
);

// ========================================================
// Logout
// ========================================================

export const LogoutSuccessSchema = openApiRegistry.register(
  "LogoutSuccess",

  z.object({
    success: z.literal(true),

    data: z.null(),
  }),
);

// ========================================================
// Me
// ========================================================

export const MeSuccessSchema = openApiRegistry.register(
  "MeSuccess",

  z.object({
    success: z.literal(true),

    data: z.object({
      user: PublicLawyerSchema,
    }),
  }),
);

export { ApiErrorSchema };
