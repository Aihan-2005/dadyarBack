import { z } from "zod";

import { openApiRegistry } from "../openapi.registry";

import { CaseStateSchema } from "../../validators/case.validator";

import {
  ApiErrorSchema,
  ObjectIdResponseSchema,
  PaginationSchema,
} from "./common.openapi";

import { CasePaymentResponseSchema } from "./case.openapi.schemas";

// ========================================================
// Lawyer Financial Summary
// ========================================================

export const LawyerFinancialSummarySchema = openApiRegistry.register(
  "LawyerFinancialSummary",

  z.object({
    totalCaseValue: z.number(),

    totalPaidPayments: z.number(),

    totalOverduePayments: z.number(),

    totalExpenses: z.number(),

    totalPaidExpenses: z.number(),

    remainingReceivable: z.number(),

    netReceived: z.number(),

    collectionRate: z.number(),
  }),
);

export const LawyerFinancialSummarySuccessSchema = openApiRegistry.register(
  "LawyerFinancialSummarySuccess",

  z.object({
    success: z.literal(true),

    data: LawyerFinancialSummarySchema,
  }),
);

// ========================================================
// Client Financial Summary
// ========================================================

export const ClientFinancialSummarySchema = openApiRegistry.register(
  "ClientFinancialSummary",

  z.object({
    clientId: ObjectIdResponseSchema,

    fullName: z.string(),

    phone: z.string(),

    caseCount: z.number().int(),

    assignedAmount: z.number(),

    paidAmount: z.number(),

    remainingAmount: z.number(),

    overdueAmount: z.number(),

    collectionRate: z.number(),
  }),
);

export const ClientFinancialReportDataSchema = openApiRegistry.register(
  "ClientFinancialReportData",

  z.object({
    items: z.array(ClientFinancialSummarySchema),

    pagination: PaginationSchema,
  }),
);

export const ClientFinancialReportSuccessSchema = openApiRegistry.register(
  "ClientFinancialReportSuccess",

  z.object({
    success: z.literal(true),

    data: ClientFinancialReportDataSchema,
  }),
);

// ========================================================
// Client Financial Status Per Case
// ========================================================

export const ClientCaseFinancialSummarySchema = openApiRegistry.register(
  "ClientCaseFinancialSummary",

  z.object({
    caseId: ObjectIdResponseSchema,

    caseNumber: z.string(),

    title: z.string(),

    state: CaseStateSchema,

    caseValue: z.number(),

    assignedAmount: z.number(),

    paidAmount: z.number(),

    remainingAmount: z.number(),

    overdueAmount: z.number(),

    collectionRate: z.number(),

    payments: z.array(CasePaymentResponseSchema),
  }),
);

export const ClientCaseFinancialReportDataSchema = openApiRegistry.register(
  "ClientCaseFinancialReportData",

  z.object({
    items: z.array(ClientCaseFinancialSummarySchema),

    pagination: PaginationSchema,
  }),
);

export const ClientCaseFinancialReportSuccessSchema = openApiRegistry.register(
  "ClientCaseFinancialReportSuccess",

  z.object({
    success: z.literal(true),

    data: ClientCaseFinancialReportDataSchema,
  }),
);

export { ApiErrorSchema };
