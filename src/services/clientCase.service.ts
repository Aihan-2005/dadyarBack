import type {
  CaseRecord,
  FindCasesOptions,
} from "../interfaces/case.interface";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import { CaseRepository } from "../repositories/case.repository";

import { LawyerClientRepository } from "../repositories/lawyerClient.repository";
import { CasePaymentRepository } from "../repositories/casePayment.repository";

const LANGUAGE = env.LANGUAGE;

export class ClientCaseService {
  constructor(
    private readonly caseRepository = new CaseRepository(),

    private readonly lawyerClientRepository = new LawyerClientRepository(),

    private readonly casePaymentRepository = new CasePaymentRepository(),
  ) {}

  private async getClientIds(userId: string): Promise<string[]> {
    const records = await this.lawyerClientRepository.findByUserId(userId);

    return records.map((record) => record._id.toString());
  }

  private getClientAssignment(
    foundCase: CaseRecord,

    clientIds: Set<string>,
  ) {
    const assignment = foundCase.clientAssignments.find((item) =>
      clientIds.has(item.clientId.toString()),
    );

    if (!assignment) {
      throw new HttpException(
        404,

        MESSAGES.caseNotFound[LANGUAGE],

        "CASE_NOT_FOUND",
      );
    }

    return assignment;
  }

  private buildCaseResponse(
    foundCase: CaseRecord,

    clientIds: Set<string>,
  ) {
    const assignment = this.getClientAssignment(foundCase, clientIds);

    return {
      caseId: foundCase._id.toString(),

      lawyerId: foundCase.lawyerId.toString(),

      title: foundCase.title,

      caseNumber: foundCase.caseNumber,

      archiveNumberOffice: foundCase.archiveNumberOffice ?? undefined,

      state: foundCase.state,

      description: foundCase.description ?? undefined,

      court: foundCase.court ?? undefined,

      branchHistory: foundCase.branchHistory,

      paymentType: foundCase.paymentType,

      nonCashDescription: foundCase.nonCashDescription ?? undefined,

      assignment: {
        lawyerClientId: assignment.clientId.toString(),

        assignedAmount: assignment.assignedAmount,

        birthDate: assignment.birthDate ?? undefined,

        role: assignment.role ?? undefined,

        represent: assignment.represent ?? undefined,
      },

      createdAt: foundCase.createdAt,

      updatedAt: foundCase.updatedAt,
    };
  }

  public async listCases(
    userId: string,

    options: FindCasesOptions = {},
  ) {
    const clientIds = await this.getClientIds(userId);

    const page = Math.max(options.page ?? 1, 1);

    const limit = Math.min(
      Math.max(options.limit ?? 20, 1),

      100,
    );

    if (clientIds.length === 0) {
      return {
        items: [],

        pagination: {
          page,

          limit,

          total: 0,

          totalPages: 0,
        },
      };
    }

    const safeOptions: FindCasesOptions = {
      ...options,

      page,

      limit,
    };

    const [items, total] = await Promise.all([
      this.caseRepository.findByClientIds(
        clientIds,

        safeOptions,
      ),

      this.caseRepository.countByClientIds(
        clientIds,

        safeOptions,
      ),
    ]);

    const clientIdSet = new Set(clientIds);

    return {
      items: items.map((item) => this.buildCaseResponse(item, clientIdSet)),

      pagination: {
        page,

        limit,

        total,

        totalPages: Math.ceil(total / limit),
      },
    };
  }

  public async getCaseById(
    userId: string,

    caseId: string,
  ) {
    const clientIds = await this.getClientIds(userId);

    const foundCase = await this.caseRepository.findByIdForClientIds(
      clientIds,

      caseId,
    );

    if (!foundCase) {
      throw new HttpException(
        404,

        MESSAGES.caseNotFound[LANGUAGE],

        "CASE_NOT_FOUND",
      );
    }

    return this.buildCaseResponse(
      foundCase,

      new Set(clientIds),
    );
  }

  public async getCasePayments(
    userId: string,

    caseId: string,
  ) {
    const clientIds = await this.getClientIds(userId);

    const foundCase = await this.caseRepository.findByIdForClientIds(
      clientIds,

      caseId,
    );

    if (!foundCase) {
      throw new HttpException(
        404,

        MESSAGES.caseNotFound[LANGUAGE],

        "CASE_NOT_FOUND",
      );
    }

    const assignment = this.getClientAssignment(
      foundCase,

      new Set(clientIds),
    );

    const payments =
      await this.casePaymentRepository.findByCaseIdForClientForLawyer(
        foundCase.lawyerId.toString(),

        foundCase._id.toString(),

        assignment.clientId.toString(),
      );

    return payments.map((payment) => ({
      paymentId: payment._id.toString(),

      method: payment.method,

      amount: payment.amount,

      description: payment.description ?? undefined,

      dueDate: payment.dueDate ?? undefined,

      isPaid: payment.isPaid,

      createdAt: payment.createdAt,

      updatedAt: payment.updatedAt,
    }));
  }
}
