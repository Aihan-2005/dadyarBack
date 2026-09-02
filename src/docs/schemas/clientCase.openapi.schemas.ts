import { z } from "zod";

import {
  CasePaymentTypeSchema,
  CaseStateSchema,
  CourtSchema,
} from "../../validators/case.validator";

import { openApiRegistry } from "../openapi.registry";

import {
  CaseBranchHistoryResponseSchema,
  CasePaymentResponseSchema,
} from "./case.openapi.schemas";

import {
  DateTimeResponseSchema,
  ObjectIdResponseSchema,
  PaginationSchema,
} from "./common.openapi";

export const ClientCaseLawyerSchema = openApiRegistry.register(
  "ClientCaseLawyer",

  z.object({
    id: ObjectIdResponseSchema,

    firstName: z.string(),

    lastName: z.string(),

    specialization: z.string(),
  }),
);

export const ClientCaseAssignmentSchema = openApiRegistry.register(
  "ClientCaseAssignment",

  z.object({
    lawyerClientId: ObjectIdResponseSchema,

    assignedAmount: z.number(),

    birthDate: DateTimeResponseSchema.optional(),

    role: z.string().optional(),

    represent: z.string().optional(),
  }),
);

export const ClientCaseResponseSchema = openApiRegistry.register(
  "ClientCaseResponse",

  z.object({
    caseId: ObjectIdResponseSchema,

    lawyer: ClientCaseLawyerSchema,

    title: z.string(),

    caseNumber: z.string(),

    archiveNumberOffice: z.string().optional(),

    state: CaseStateSchema,

    description: z.string().optional(),

    court: CourtSchema.optional(),

    branchHistory: z.array(CaseBranchHistoryResponseSchema),

    paymentType: CasePaymentTypeSchema,

    nonCashDescription: z.string().optional(),

    assignment: ClientCaseAssignmentSchema,

    createdAt: DateTimeResponseSchema,

    updatedAt: DateTimeResponseSchema,
  }),
);

export const ClientCaseListSuccessSchema = openApiRegistry.register(
  "ClientCaseListSuccess",

  z.object({
    success: z.literal(true),

    data: z.array(ClientCaseResponseSchema),

    pagination: PaginationSchema,
  }),
);

export const ClientCaseDetailsSuccessSchema = openApiRegistry.register(
  "ClientCaseDetailsSuccess",

  z.object({
    success: z.literal(true),

    data: ClientCaseResponseSchema,
  }),
);

export const ClientCasePaymentsSuccessSchema = openApiRegistry.register(
  "ClientCasePaymentsSuccess",

  z.object({
    success: z.literal(true),

    data: z.array(CasePaymentResponseSchema),
  }),
);
