import { MESSAGES } from "../constants/messages";
import mongoose, { Types, type ClientSession } from "mongoose";

import type {
  Case,
  CaseClientInput,
  CaseCreatePayload,
  Court,
  CreateCaseInput,
  FindCasesOptions,
  LawyerContact,
  ManualCaseClient,
  OpposingParty,
  RelatedPerson,
  SubDocumentWithId,
  UpdateCaseInput,
} from "../interfaces/case.interface";

import { ClientService } from "./client.service";
import { HttpException } from "../exceptions/httpException";
import { CaseRepository } from "../repositories/case.repository";
import { env } from "../config/env";
const LANGUAGE = env.LANGUAGE;

export class CaseService {
  constructor(
    private readonly caseRepository = new CaseRepository(),

    private readonly clientService = new ClientService(),
  ) {}

  private ensureNotEmptyObject(
    data: Record<string, unknown>,
    message: string,
    status: number,
  ) {
    if (Object.keys(data).length === 0) {
      throw new HttpException(status, message);
    }
  }

  private isSameId(
    firstId: Types.ObjectId | string | undefined,
    secondId: string,
  ) {
    return firstId?.toString() === secondId;
  }

  private hasSubDocument<T extends SubDocumentWithId>(items: T[], id: string) {
    return items.some((item) => this.isSameId(item._id, id));
  }

  private ensureSubDocumentExists<T extends SubDocumentWithId>(
    items: T[],
    id: string,
    message: string,
    status: number,
  ) {
    if (!this.hasSubDocument(items, id)) {
      throw new HttpException(status, message);
    }
  }

  private async ensureCaseBelongsToLawyer(
    lawyerId: string,
    caseId: string,
    session?: ClientSession,
  ) {
    const existingCase = await this.caseRepository.findByIdForLawyer(
      lawyerId,
      caseId,
      session,
    );

    if (!existingCase) {
      throw new HttpException(
        404,
        MESSAGES.caseNotFound[LANGUAGE],
        "CASE_NOT_FOUND",
      );
    }

    return existingCase;
  }

  private ensureAssignmentsMatchValue(
    value: number,
    assignments: ReadonlyArray<{
      assignedAmount: number;
    }>,
  ): void {
    const totalAssigned = assignments.reduce(
      (total, assignment) => total + assignment.assignedAmount,
      0,
    );

    if (totalAssigned !== value) {
      throw new HttpException(
        400,
        MESSAGES.assignmentTotalMismatch[LANGUAGE],
        "ASSIGNMENT_TOTAL_MISMATCH",
      );
    }
  }
  private normalizeOptionalString(value?: string): string | undefined {
    return value?.trim() || undefined;
  }

  private async resolveCaseClients(
    lawyerId: string,
    clients: ManualCaseClient[],
    session: ClientSession,
  ): Promise<CaseClientInput[]> {
    const assignments: CaseClientInput[] = [];

    const resolvedClientIds = new Set<string>();

    for (const input of clients) {
      const client = await this.clientService.resolveClientForCase(
        lawyerId,
        {
          fullName: input.fullName,

          phone: input.phone,

          nationalId: input.nationalId,

          represent: input.represent,
        },
        session,
      );

      const clientId = client._id.toString();

      if (resolvedClientIds.has(clientId)) {
        throw new HttpException(
          400,
          MESSAGES.duplicateCaseClient[LANGUAGE],
          "DUPLICATE_CASE_CLIENT",
        );
      }

      resolvedClientIds.add(clientId);

      const represent =
        input.represent === undefined
          ? client.represent
          : this.normalizeOptionalString(input.represent);

      assignments.push({
        clientId,

        assignedAmount: input.assignedAmount,

        role: this.normalizeOptionalString(input.role),

        represent,
      });
    }

    return assignments;
  }
  public async getCaseById(lawyerId: string, caseId: string) {
    const foundCase = await this.caseRepository.findDetailedByIdForLawyer(
      lawyerId,
      caseId,
    );

    if (!foundCase) {
      throw new HttpException(
        404,
        MESSAGES.caseNotFound[LANGUAGE],
        "CASE_NOT_FOUND",
      );
    }

    return foundCase;
  }
  public async listCases(lawyerId: string, options: FindCasesOptions = {}) {
    const page = Math.max(options.page ?? 1, 1);

    const limit = Math.min(Math.max(options.limit ?? 10, 1), 100);

    const safeOptions: FindCasesOptions = {
      ...options,
      page,
      limit,
    };

    const [items, total] = await Promise.all([
      this.caseRepository.findByLawyerId(lawyerId, safeOptions),

      this.caseRepository.countByLawyerId(lawyerId, safeOptions),
    ]);

    return {
      items,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  public async createCase(lawyerId: string, data: CaseCreatePayload) {
    const session = await mongoose.startSession();

    try {
      const createdCase = await session.withTransaction(async () => {
        const duplicateCase = await this.caseRepository.findByCaseNumber(
          lawyerId,
          data.caseNumber,
          session,
        );

        if (duplicateCase) {
          throw new HttpException(
            409,
            MESSAGES.caseExsist[LANGUAGE],
            "CASE_NUMBER_ALREADY_EXISTS",
          );
        }

        const clientAssignments = await this.resolveCaseClients(
          lawyerId,
          data.clients,
          session,
        );

        this.ensureAssignmentsMatchValue(data.value, clientAssignments);

        const { clients: _clients, ...caseData } = data;

        const createData: CreateCaseInput = {
          ...caseData,

          lawyerId,

          clientAssignments,
        };

        return this.caseRepository.create(createData, session);
      });

      if (!createdCase) {
        throw new HttpException(
          500,
          MESSAGES.unableToCreateCase[LANGUAGE],
          "CASE_CREATION_FAILED",
        );
      }

      const detailedCase = await this.caseRepository.findDetailedByIdForLawyer(
        lawyerId,
        createdCase._id.toString(),
      );

      if (!detailedCase) {
        throw new HttpException(
          404,
          MESSAGES.caseNotFound[LANGUAGE],
          "CASE_NOT_FOUND",
        );
      }

      return detailedCase;
    } finally {
      await session.endSession();
    }
  }
  public async updateCase(
    lawyerId: string,
    caseId: string,
    data: UpdateCaseInput,
  ) {
    this.ensureNotEmptyObject(data, MESSAGES.noCaseFieldFound[LANGUAGE], 400);

    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async () => {
        const existingCase = await this.ensureCaseBelongsToLawyer(
          lawyerId,
          caseId,
          session,
        );

        // ---------------- Case Number ----------------

        if (data.caseNumber && data.caseNumber !== existingCase.caseNumber) {
          const duplicateCase = await this.caseRepository.findByCaseNumber(
            lawyerId,
            data.caseNumber,
            session,
          );

          if (duplicateCase) {
            throw new HttpException(
              409,
              MESSAGES.caseExsist[LANGUAGE],
              "CASE_NUMBER_ALREADY_EXISTS",
            );
          }
        }

        // ---------------- Financial / Clients ----------------

        const financialChanged =
          data.value !== undefined || data.clients !== undefined;

        if (financialChanged) {
          const value = data.value ?? existingCase.value;

          let assignments: CaseClientInput[];

          if (data.clients) {
            assignments = await this.resolveCaseClients(
              lawyerId,
              data.clients,
              session,
            );
          } else {
            assignments = existingCase.clientAssignments.map((assignment) => ({
              clientId: assignment.clientId.toString(),

              assignedAmount: assignment.assignedAmount,

              role: this.normalizeOptionalString(assignment.role ?? undefined),

              represent: this.normalizeOptionalString(
                assignment.represent ?? undefined,
              ),
            }));
          }

          this.ensureAssignmentsMatchValue(value, assignments);

          const updatedFinancial =
            await this.caseRepository.updateValueAndAssignments(
              lawyerId,
              caseId,
              value,
              assignments,
              session,
            );

          if (!updatedFinancial) {
            throw new HttpException(
              404,
              MESSAGES.caseNotFound[LANGUAGE],
              "CASE_NOT_FOUND",
            );
          }
        }

        // ---------------- Other Case Fields ----------------

        const { clients: _clients, value: _value, court, ...caseData } = data;

        if (Object.keys(caseData).length > 0) {
          const updated = await this.caseRepository.updateByIdForLawyer(
            lawyerId,
            caseId,
            {
              $set: caseData,
            },
            session,
          );

          if (!updated) {
            throw new HttpException(
              404,
              MESSAGES.caseNotFound[LANGUAGE],
              "CASE_NOT_FOUND",
            );
          }
        }

        // ---------------- Court ----------------

        if (court && Object.keys(court).length > 0) {
          const updatedCourt = await this.caseRepository.updateCourt(
            lawyerId,
            caseId,
            court,
            session,
          );

          if (!updatedCourt) {
            throw new HttpException(
              404,
              MESSAGES.caseNotFound[LANGUAGE],
              "CASE_NOT_FOUND",
            );
          }
        }
      });

      return this.getCaseById(lawyerId, caseId);
    } finally {
      await session.endSession();
    }
  }
  public async updateCaseState(
    lawyerId: string,
    caseId: string,
    state: Case["state"],
  ) {
    const updatedCase = await this.caseRepository.updateState(
      lawyerId,
      caseId,
      state,
    );

    if (!updatedCase) {
      throw new HttpException(
        404,
        MESSAGES.caseNotFound[LANGUAGE],
        "CASE_NOT_FOUND",
      );
    }

    return updatedCase;
  }

  public async updateCourt(
    lawyerId: string,
    caseId: string,
    court: Partial<Court>,
  ) {
    this.ensureNotEmptyObject(
      court,
      MESSAGES["noCourtFieldFound"][LANGUAGE],
      400,
    );

    const updatedCase = await this.caseRepository.updateCourt(
      lawyerId,
      caseId,
      court,
    );

    if (!updatedCase) {
      throw new HttpException(404, MESSAGES.caseNotFound[LANGUAGE]);
    }

    return updatedCase;
  }

  public async addOpposingParty(
    lawyerId: string,
    caseId: string,
    opposingParty: OpposingParty,
  ) {
    const updatedCase = await this.caseRepository.addOpposingParty(
      lawyerId,
      caseId,
      opposingParty,
    );

    if (!updatedCase) {
      throw new HttpException(404, MESSAGES.caseNotFound[LANGUAGE]);
    }

    return updatedCase;
  }

  public async updateOpposingParty(
    lawyerId: string,
    caseId: string,
    opposingPartyId: string,
    opposingParty: Partial<OpposingParty>,
  ) {
    this.ensureNotEmptyObject(
      opposingParty,
      MESSAGES["noOpposingFieldFound"][LANGUAGE],
      400,
    );

    const existingCase = await this.ensureCaseBelongsToLawyer(lawyerId, caseId);

    this.ensureSubDocumentExists(
      existingCase.opposingParties,
      opposingPartyId,
      MESSAGES["opposingNotFound"][LANGUAGE],
      404,
    );

    await this.caseRepository.updateOpposingParty(
      lawyerId,
      caseId,
      opposingPartyId,
      opposingParty,
    );

    return this.getCaseById(lawyerId, caseId);
  }

  public async removeOpposingParty(
    lawyerId: string,
    caseId: string,
    opposingPartyId: string,
  ) {
    const existingCase = await this.ensureCaseBelongsToLawyer(lawyerId, caseId);

    this.ensureSubDocumentExists(
      existingCase.opposingParties,
      opposingPartyId,
      MESSAGES["opposingNotFound"][LANGUAGE],
      404,
    );

    await this.caseRepository.removeOpposingParty(
      lawyerId,
      caseId,
      opposingPartyId,
    );

    return this.getCaseById(lawyerId, caseId);
  }

  public async addAssistantLawyer(
    lawyerId: string,
    caseId: string,
    assistantLawyer: LawyerContact,
  ) {
    const updatedCase = await this.caseRepository.addAssistantLawyer(
      lawyerId,
      caseId,
      assistantLawyer,
    );

    if (!updatedCase) {
      throw new HttpException(404, MESSAGES.caseNotFound[LANGUAGE]);
    }

    return updatedCase;
  }

  public async updateAssistantLawyer(
    lawyerId: string,
    caseId: string,
    assistantLawyerId: string,
    assistantLawyer: Partial<LawyerContact>,
  ) {
    this.ensureNotEmptyObject(
      assistantLawyer,
      MESSAGES["noAssistantFieldFound"][LANGUAGE],
      400,
    );

    const existingCase = await this.ensureCaseBelongsToLawyer(lawyerId, caseId);

    this.ensureSubDocumentExists(
      existingCase.assistantLawyers,
      assistantLawyerId,
      MESSAGES["assistantNotFound"][LANGUAGE],
      404,
    );

    await this.caseRepository.updateAssistantLawyer(
      lawyerId,
      caseId,
      assistantLawyerId,
      assistantLawyer,
    );

    return this.getCaseById(lawyerId, caseId);
  }

  public async removeAssistantLawyer(
    lawyerId: string,
    caseId: string,
    assistantLawyerId: string,
  ) {
    const existingCase = await this.ensureCaseBelongsToLawyer(lawyerId, caseId);

    this.ensureSubDocumentExists(
      existingCase.assistantLawyers,
      assistantLawyerId,
      MESSAGES["assistantNotFound"][LANGUAGE],
      404,
    );

    await this.caseRepository.removeAssistantLawyer(
      lawyerId,
      caseId,
      assistantLawyerId,
    );

    return this.getCaseById(lawyerId, caseId);
  }

  public async addOpposingLawyer(
    lawyerId: string,
    caseId: string,
    opposingLawyer: LawyerContact,
  ) {
    const updatedCase = await this.caseRepository.addOpposingLawyer(
      lawyerId,
      caseId,
      opposingLawyer,
    );

    if (!updatedCase) {
      throw new HttpException(404, MESSAGES.caseNotFound[LANGUAGE]);
    }

    return updatedCase;
  }

  public async updateOpposingLawyer(
    lawyerId: string,
    caseId: string,
    opposingLawyerId: string,
    opposingLawyer: Partial<LawyerContact>,
  ) {
    this.ensureNotEmptyObject(
      opposingLawyer,
      MESSAGES["noOpposingLawyerFiledFound"][LANGUAGE],
      400,
    );

    const existingCase = await this.ensureCaseBelongsToLawyer(lawyerId, caseId);

    this.ensureSubDocumentExists(
      existingCase.opposingLawyers,
      opposingLawyerId,
      MESSAGES["opposingLawyernotFound"][LANGUAGE],
      404,
    );

    await this.caseRepository.updateOpposingLawyer(
      lawyerId,
      caseId,
      opposingLawyerId,
      opposingLawyer,
    );

    return this.getCaseById(lawyerId, caseId);
  }

  public async removeOpposingLawyer(
    lawyerId: string,
    caseId: string,
    opposingLawyerId: string,
  ) {
    const existingCase = await this.ensureCaseBelongsToLawyer(lawyerId, caseId);

    this.ensureSubDocumentExists(
      existingCase.opposingLawyers,
      opposingLawyerId,
      MESSAGES["opposingLawyernotFound"][LANGUAGE],
      404,
    );

    await this.caseRepository.removeOpposingLawyer(
      lawyerId,
      caseId,
      opposingLawyerId,
    );

    return this.getCaseById(lawyerId, caseId);
  }

  public async addRelatedPerson(
    lawyerId: string,
    caseId: string,
    relatedPerson: RelatedPerson,
  ) {
    const updatedCase = await this.caseRepository.addRelatedPerson(
      lawyerId,
      caseId,
      relatedPerson,
    );

    if (!updatedCase) {
      throw new HttpException(404, MESSAGES.caseNotFound[LANGUAGE]);
    }

    return updatedCase;
  }

  public async updateRelatedPerson(
    lawyerId: string,
    caseId: string,
    relatedPersonId: string,
    relatedPerson: Partial<RelatedPerson>,
  ) {
    this.ensureNotEmptyObject(
      relatedPerson,
      MESSAGES["noRelatedPersonFieldFound"][LANGUAGE],
      400,
    );

    const existingCase = await this.ensureCaseBelongsToLawyer(lawyerId, caseId);

    this.ensureSubDocumentExists(
      existingCase.relatedPeople,
      relatedPersonId,
      MESSAGES["relatedPersonNotFound"][LANGUAGE],
      404,
    );

    await this.caseRepository.updateRelatedPerson(
      lawyerId,
      caseId,
      relatedPersonId,
      relatedPerson,
    );

    return this.getCaseById(lawyerId, caseId);
  }

  public async removeRelatedPerson(
    lawyerId: string,
    caseId: string,
    relatedPersonId: string,
  ) {
    const existingCase = await this.ensureCaseBelongsToLawyer(lawyerId, caseId);

    this.ensureSubDocumentExists(
      existingCase.relatedPeople,
      relatedPersonId,
      MESSAGES["relatedPersonNotFound"][LANGUAGE],
      404,
    );

    await this.caseRepository.removeRelatedPerson(
      lawyerId,
      caseId,
      relatedPersonId,
    );

    return this.getCaseById(lawyerId, caseId);
  }
}
