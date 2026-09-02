import type {
  CaseRecord,
  FindCasesOptions,
} from "../interfaces/case.interface";

import type { LawyerRecord } from "../interfaces/lawyer.interface";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import { CaseRepository } from "../repositories/case.repository";

import { LawyerClientRepository } from "../repositories/lawyerClient.repository";
import { CasePaymentRepository } from "../repositories/casePayment.repository";
import { LawyerRepository } from "../repositories/lawyer.repository";

const LANGUAGE = env.LANGUAGE;

export class ClientCaseService {
  constructor(
    private readonly caseRepository = new CaseRepository(),

    private readonly lawyerClientRepository = new LawyerClientRepository(),

    private readonly casePaymentRepository = new CasePaymentRepository(),

    private readonly lawyerRepository = new LawyerRepository(),
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

    lawyer: LawyerRecord,
  ) {
    const assignment = this.getClientAssignment(foundCase, clientIds);

    return {
      caseId: foundCase._id.toString(),

      lawyer: {
        id: lawyer._id.toString(),

        firstName: lawyer.firstName,

        lastName: lawyer.lastName,

        specialization: lawyer.specialization,
      },

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

    const lawyerIds = Array.from(
      new Set(items.map((item) => item.lawyerId.toString())),
    );

    const lawyers = await this.lawyerRepository.findByIds(lawyerIds);

    const lawyersById = new Map(
      lawyers.map((lawyer) => [lawyer._id.toString(), lawyer]),
    );

    return {
      items: items.map((item) => {
        const lawyer = lawyersById.get(item.lawyerId.toString());

        if (!lawyer) {
          throw new HttpException(
            500,

            MESSAGES.serverError[LANGUAGE],

            "CASE_LAWYER_NOT_FOUND",
          );
        }

        return this.buildCaseResponse(item, clientIdSet, lawyer);
      }),
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

    const lawyer = await this.lawyerRepository.findById(
      foundCase.lawyerId.toString(),
    );

    if (!lawyer) {
      throw new HttpException(
        500,

        MESSAGES.serverError[LANGUAGE],

        "CASE_LAWYER_NOT_FOUND",
      );
    }

    return this.buildCaseResponse(
      foundCase,

      new Set(clientIds),

      lawyer,
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
