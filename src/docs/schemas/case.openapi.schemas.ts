import { z } from "zod";

import { openApiRegistry } from "../openapi.registry";

import { CaseStateSchema, CourtSchema } from "../../validators/case.validator";

import {
  ApiErrorSchema,
  DateTimeResponseSchema,
  ObjectIdResponseSchema,
  PaginationSchema,
} from "./common.openapi";

// ========================================================
// Payment
// ========================================================

export const CasePaymentResponseSchema = openApiRegistry.register(
  "CasePaymentResponse",
  z.object({
    paymentId: ObjectIdResponseSchema,

    method: z.enum(["CASH", "NON_CASH"]),

    amount: z.number(),

    description: z.string().optional(),

    dueDate: DateTimeResponseSchema.optional(),

    isPaid: z.boolean(),
  }),
);

// ========================================================
// Expense
// ========================================================

export const CaseExpenseResponseSchema = openApiRegistry.register(
  "CaseExpenseResponse",
  z.object({
    expenseId: ObjectIdResponseSchema,

    title: z.string(),

    amount: z.number(),

    description: z.string().optional(),

    expenseDate: DateTimeResponseSchema.optional(),

    isPaid: z.boolean(),
  }),
);

// ========================================================
// Client inside CaseDetails
// ========================================================

export const CaseClientResponseSchema = openApiRegistry.register(
  "CaseClientResponse",
  z.object({
    clientId: ObjectIdResponseSchema,

    fullName: z.string(),

    phone: z.string(),

    nationalId: z.string().optional(),

    assignedAmount: z.number(),

    role: z.string().optional(),

    represent: z.string().optional(),

    payments: z.array(CasePaymentResponseSchema),
  }),
);

// ========================================================
// Embedded case records
// ========================================================

export const OpposingPartyResponseSchema = openApiRegistry.register(
  "OpposingPartyResponse",
  z.object({
    _id: ObjectIdResponseSchema,

    fullName: z.string(),

    phone: z.string().optional(),

    nationalId: z.string().optional(),

    description: z.string().optional(),
  }),
);

export const LawyerContactResponseSchema = openApiRegistry.register(
  "LawyerContactResponse",
  z.object({
    _id: ObjectIdResponseSchema,

    fullName: z.string(),

    phone: z.string(),

    barLicenseNumber: z.string().optional(),

    licenseExpiresAt: DateTimeResponseSchema.optional(),

    licensePlaceOfIssue: z.string().optional(),
  }),
);

export const RelatedPersonResponseSchema = openApiRegistry.register(
  "RelatedPersonResponse",
  z.object({
    _id: ObjectIdResponseSchema,

    fullName: z.string(),

    phone: z.string(),

    description: z.string().optional(),
  }),
);

// ========================================================
// Detailed Case
// ========================================================

export const CaseDetailsSchema = openApiRegistry.register(
  "CaseDetails",
  z.object({
    _id: ObjectIdResponseSchema,

    lawyerId: ObjectIdResponseSchema,

    title: z.string(),

    caseNumber: z.string(),

    state: CaseStateSchema,

    court: CourtSchema.optional(),

    value: z.number(),

    clients: z.array(CaseClientResponseSchema),

    expenses: z.array(CaseExpenseResponseSchema),

    opposingParties: z.array(OpposingPartyResponseSchema),

    assistantLawyers: z.array(LawyerContactResponseSchema),

    opposingLawyers: z.array(LawyerContactResponseSchema),

    relatedPeople: z.array(RelatedPersonResponseSchema),

    createdAt: DateTimeResponseSchema,

    updatedAt: DateTimeResponseSchema,

    __v: z.number().int().optional(),
  }),
);

// ========================================================
// CaseDetails success envelope
// ========================================================

export const CaseDetailsSuccessSchema = openApiRegistry.register(
  "CaseDetailsSuccess",
  z.object({
    success: z.literal(true),

    data: CaseDetailsSchema,
  }),
);

// ========================================================
// GET /cases list representation
// ========================================================

const CaseListClientSchema = z.object({
  _id: ObjectIdResponseSchema,

  fullName: z.string(),

  phone: z.string(),
});

const CaseListClientAssignmentSchema = z.object({
  clientId: CaseListClientSchema,

  assignedAmount: z.number(),

  role: z.string().optional(),

  represent: z.string().optional(),
});

export const CaseListItemSchema = openApiRegistry.register(
  "CaseListItem",
  z.object({
    _id: ObjectIdResponseSchema,

    lawyerId: ObjectIdResponseSchema,

    title: z.string(),

    caseNumber: z.string(),

    state: CaseStateSchema,

    court: CourtSchema.optional(),

    value: z.number(),

    clientAssignments: z.array(CaseListClientAssignmentSchema),

    opposingParties: z.array(OpposingPartyResponseSchema),

    assistantLawyers: z.array(LawyerContactResponseSchema),

    opposingLawyers: z.array(LawyerContactResponseSchema),

    relatedPeople: z.array(RelatedPersonResponseSchema),

    createdAt: DateTimeResponseSchema,

    updatedAt: DateTimeResponseSchema,

    __v: z.number().int().optional(),
  }),
);

// ========================================================
// GET /cases success envelope
// ========================================================

export const CaseListSuccessSchema = openApiRegistry.register(
  "CaseListSuccess",
  z.object({
    success: z.literal(true),

    data: z.array(CaseListItemSchema),

    pagination: PaginationSchema,
  }),
);

// Re-exporting this from here is convenient
// for case.openapi.ts.
export { ApiErrorSchema };
