import { z } from "zod";

import { LAWYER_STATUSES } from "../../constants/lawyer.constants";

import { USER_STATUSES } from "../../constants/user.constants";

import { openApiRegistry } from "../openapi.registry";

import {
  ApiErrorSchema,
  DateTimeResponseSchema,
  ObjectIdResponseSchema,
  PaginationSchema,
} from "./common.openapi";

import {
  LawyerProfileResponseSchema,
  LawyerStatusResponseSchema,
  LawyerVerificationSchema,
} from "./auth.openapi.schemas";

// ========================================================
// Shared Admin User Verification
// ========================================================

const AdminUserVerificationItemSchema = z.object({
  verified: z.boolean(),

  verifiedAt: DateTimeResponseSchema.nullable(),
});

export const AdminUserVerificationSchema = openApiRegistry.register(
  "AdminUserVerification",

  z.object({
    email: AdminUserVerificationItemSchema,

    phone: AdminUserVerificationItemSchema,
  }),
);

// ========================================================
// Managed User Account
//
// Used by account-status mutation responses.
//
// Important:
// Runtime account-status update endpoints currently return
// the shared PublicUserDTO representation, where the field
// is named `status`, not `accountStatus`.
// ========================================================

export const AdminManagedUserAccountSchema = openApiRegistry.register(
  "AdminManagedUserAccount",

  z.object({
    id: ObjectIdResponseSchema,

    email: z.string().nullable(),

    phone: z.string().nullable(),

    role: z.union([z.literal("LAWYER"), z.literal("CLIENT")]),

    status: z.enum(USER_STATUSES),

    verification: AdminUserVerificationSchema,

    lastLoginAt: DateTimeResponseSchema.nullable(),
  }),
);

export const AdminManagedUserAccountSuccessSchema = openApiRegistry.register(
  "AdminManagedUserAccountSuccess",

  z.object({
    success: z.literal(true),

    data: AdminManagedUserAccountSchema,
  }),
);

// ========================================================
// Admin Lawyer List Item
// ========================================================

export const AdminLawyerListItemSchema = openApiRegistry.register(
  "AdminLawyerListItem",

  z.object({
    id: ObjectIdResponseSchema,

    firstName: z.string(),

    lastName: z.string(),

    email: z.string().nullable(),

    phone: z.string().nullable(),

    licenseNumber: z.string(),

    specialization: z.string(),

    accountStatus: z.enum(USER_STATUSES),

    lawyerStatus: LawyerStatusResponseSchema,

    verification: LawyerVerificationSchema,

    lastLoginAt: DateTimeResponseSchema.nullable(),

    createdAt: DateTimeResponseSchema.nullable(),
  }),
);

export const AdminLawyerListSuccessSchema = openApiRegistry.register(
  "AdminLawyerListSuccess",

  z.object({
    success: z.literal(true),

    data: z.array(AdminLawyerListItemSchema),

    pagination: PaginationSchema,
  }),
);

// ========================================================
// Admin Lawyer Detail
//
// Admin representation deliberately separates:
//
// accountStatus -> User.status
// lawyerStatus  -> Lawyer.status
//
// This avoids the ambiguous generic `status` field.
// ========================================================

export const AdminLawyerSchema = openApiRegistry.register(
  "AdminLawyer",

  z.object({
    id: ObjectIdResponseSchema,

    firstName: z.string(),

    lastName: z.string(),

    email: z.string().nullable(),

    role: z.literal("LAWYER"),

    accountStatus: z.enum(USER_STATUSES),

    lawyerStatus: LawyerStatusResponseSchema,

    verification: LawyerVerificationSchema,

    profile: LawyerProfileResponseSchema,

    lastLoginAt: DateTimeResponseSchema.nullable(),

    createdAt: DateTimeResponseSchema.nullable(),

    updatedAt: DateTimeResponseSchema.nullable(),
  }),
);

export const AdminLawyerSuccessSchema = openApiRegistry.register(
  "AdminLawyerSuccess",

  z.object({
    success: z.literal(true),

    data: AdminLawyerSchema,
  }),
);

// ========================================================
// Admin Client
// ========================================================

export const AdminClientSchema = openApiRegistry.register(
  "AdminClient",

  z.object({
    id: ObjectIdResponseSchema,

    email: z.string().nullable(),

    phone: z.string().nullable(),

    role: z.literal("CLIENT"),

    accountStatus: z.enum(USER_STATUSES),

    verification: AdminUserVerificationSchema,

    lastLoginAt: DateTimeResponseSchema.nullable(),

    createdAt: DateTimeResponseSchema.nullable(),
  }),
);

export const AdminClientSuccessSchema = openApiRegistry.register(
  "AdminClientSuccess",

  z.object({
    success: z.literal(true),

    data: AdminClientSchema,
  }),
);

export const AdminClientListSuccessSchema = openApiRegistry.register(
  "AdminClientListSuccess",

  z.object({
    success: z.literal(true),

    data: z.array(AdminClientSchema),

    pagination: PaginationSchema,
  }),
);

// ========================================================
// Password Reset
// ========================================================

export const AdminPasswordResetSuccessSchema = openApiRegistry.register(
  "AdminPasswordResetSuccess",

  z.object({
    success: z.literal(true),
  }),
);

// ========================================================
// Dashboard - Account Statistics
// ========================================================

const AdminAccountStatusStatsSchema = z.object({
  total: z.number().int().nonnegative(),

  active: z.number().int().nonnegative(),

  suspended: z.number().int().nonnegative(),
});

export const AdminAccountStatsSchema = openApiRegistry.register(
  "AdminAccountStats",

  z.object({
    clients: AdminAccountStatusStatsSchema,

    lawyers: AdminAccountStatusStatsSchema,
  }),
);

// ========================================================
// Dashboard - Lawyer Professional Statistics
// ========================================================

export const AdminLawyerStatsSchema = openApiRegistry.register(
  "AdminLawyerStats",

  z.object({
    total: z.number().int().nonnegative(),

    pendingVerification: z.number().int().nonnegative(),

    active: z.number().int().nonnegative(),

    suspended: z.number().int().nonnegative(),

    rejected: z.number().int().nonnegative(),
  }),
);

// ========================================================
// Dashboard - Ticket Statistics
// ========================================================

export const AdminTicketStatsSchema = openApiRegistry.register(
  "AdminTicketStats",

  z.object({
    total: z.number().int().nonnegative(),

    open: z.number().int().nonnegative(),

    inProgress: z.number().int().nonnegative(),

    waitingForLawyer: z.number().int().nonnegative(),

    resolved: z.number().int().nonnegative(),

    closed: z.number().int().nonnegative(),
  }),
);

// ========================================================
// Dashboard
// ========================================================

export const AdminDashboardSchema = openApiRegistry.register(
  "AdminDashboard",

  z.object({
    accounts: AdminAccountStatsSchema,

    lawyerProfiles: AdminLawyerStatsSchema,

    tickets: AdminTicketStatsSchema,
  }),
);

export const AdminDashboardSuccessSchema = openApiRegistry.register(
  "AdminDashboardSuccess",

  z.object({
    success: z.literal(true),

    data: AdminDashboardSchema,
  }),
);

export { ApiErrorSchema };
