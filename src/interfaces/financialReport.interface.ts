import { z } from "zod";

import {
  FinancialClientCasesQuerySchema,
  FinancialClientReportQuerySchema,
} from "../validators/financialReport.validator";

export type FinancialClientCasesQuery = z.infer<
  typeof FinancialClientCasesQuerySchema
>;

export type FinancialClientReportQuery = z.infer<
  typeof FinancialClientReportQuerySchema
>;

export type LawyerFinancialSummary = {
  totalCaseValue: number;

  totalEstimatedNonCashValue: number;

  totalTrackedValue: number;

  nonCashCaseCount: number;

  totalPaidPayments: number;

  totalOverduePayments: number;

  totalExpenses: number;

  totalPaidExpenses: number;

  remainingReceivable: number;

  netReceived: number;

  collectionRate: number;
};

export type ClientFinancialSummary = {
  clientId: string;

  fullName: string;

  phone: string;

  caseCount: number;

  nonCashCaseCount: number;

  relatedEstimatedNonCashValue: number;

  assignedAmount: number;

  paidAmount: number;

  remainingAmount: number;

  overdueAmount: number;

  collectionRate: number;
};

export type ClientCaseFinancialSummary = {
  caseId: string;

  caseNumber: string;

  title: string;

  state: string;

  caseValue: number;

  paymentType: "CASH" | "NON_CASH" | "BOTH";

  estimatedNonCashValue: number;

  nonCashDescription?: string;

  assignedAmount: number;

  paidAmount: number;

  remainingAmount: number;

  overdueAmount: number;

  collectionRate: number;

  payments: {
    paymentId: string;

    method: "CASH" | "NON_CASH";

    amount: number;

    description?: string;

    dueDate?: Date;

    isPaid: boolean;
  }[];
};