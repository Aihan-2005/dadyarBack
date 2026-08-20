import type {
  FinancialClientCasesQuery,
  FinancialClientReportQuery,
  LawyerFinancialSummary,
} from "../interfaces/financialReport.interface";

import { FinancialReportRepository } from "../repositories/financialReport.repository";

export class FinancialReportService {
  constructor(private readonly repository = new FinancialReportRepository()) {}

  // ---------------- Lawyer Summary ----------------

  public async getLawyerSummary(
    lawyerId: string,
  ): Promise<LawyerFinancialSummary> {
    const result = await this.repository.getLawyerSummary(lawyerId);

    const {
      totalCaseValue,
      totalEstimatedNonCashValue,
      nonCashCaseCount,
      totalPaidPayments,
      totalOverduePayments,
      totalExpenses,
      totalPaidExpenses,
    } = result;

    const totalTrackedValue =
      totalCaseValue + totalEstimatedNonCashValue;

    const remainingReceivable = Math.max(
      totalCaseValue - totalPaidPayments,
      0,
    );

    const netReceived = totalPaidPayments - totalPaidExpenses;

    const collectionRate =
      totalCaseValue > 0 ? (totalPaidPayments / totalCaseValue) * 100 : 0;

    return {
      totalCaseValue,

      totalEstimatedNonCashValue,

      totalTrackedValue,

      nonCashCaseCount,

      totalPaidPayments,

      totalOverduePayments,

      totalExpenses,

      totalPaidExpenses,

      remainingReceivable,

      netReceived,

      collectionRate,
    };
  }

  // ---------------- Client Report ----------------

  public async getClientFinancialReport(
    lawyerId: string,
    options: FinancialClientReportQuery,
  ) {
    return this.repository.getClientFinancialReport(lawyerId, options);
  }

  public async getClientCaseFinancialReport(
    lawyerId: string,
    clientId: string,
    options: FinancialClientCasesQuery,
  ) {
    return this.repository.getClientCaseFinancialReport(
      lawyerId,
      clientId,
      options,
    );
  }
}