import { MESSAGES } from "../constants/messages";
import { Types } from "mongoose";
import {
  Case,
  Client,
  Court,
  CreateCaseInput,
  LawyerContact,
  OpposingParty,
  RelatedPerson,
  UpdateCaseInput,
  FindCasesOptions,
  CaseCreatePayload,
  SubDocumentWithId,
} from "../interfaces/case.interface";
import { HttpException } from "../exceptions/httpException";
import { CaseRepository } from "../repositories/case.repository";
import { env } from "../config/env";
const LANGUAGE = env.LANGUAGE;

export class CaseService {
  private readonly caseRepository: CaseRepository = new CaseRepository();

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

  private async ensureCaseBelongsToLawyer(lawyerId: string, caseId: string) {
    const existingCase = await this.caseRepository.findByIdForLawyer(
      lawyerId,
      caseId,
    );

    if (!existingCase) {
      throw new HttpException(400, MESSAGES.caseNotFound[LANGUAGE]);
    }

    return existingCase;
  }

  public async createCase(lawyerId: string, data: CaseCreatePayload) {
    const duplicateCase = await this.caseRepository.findByCaseNumber(
      lawyerId,
      data.caseNumber,
    );

    if (duplicateCase) {
      throw new HttpException(400, MESSAGES.caseExsist[LANGUAGE]);
    }

    const createData: CreateCaseInput = {
      ...data,
      lawyerId,
    };

    return this.caseRepository.create(createData);
  }

  public async getCaseById(lawyerId: string, caseId: string) {
    return this.ensureCaseBelongsToLawyer(lawyerId, caseId);
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

  public async updateCase(
    lawyerId: string,
    caseId: string,
    data: UpdateCaseInput,
  ) {
    this.ensureNotEmptyObject(
      data,
      MESSAGES["noCaseFieldFound"][LANGUAGE],
      400,
    );

    const existingCase = await this.ensureCaseBelongsToLawyer(lawyerId, caseId);

    if (data.caseNumber && data.caseNumber !== existingCase.caseNumber) {
      const duplicateCase = await this.caseRepository.findByCaseNumber(
        lawyerId,
        data.caseNumber,
      );

      if (duplicateCase) {
        throw new HttpException(400, MESSAGES.caseExsist[LANGUAGE]);
      }
    }

    const { court, ...caseData } = data;

    if (Object.keys(caseData).length > 0) {
      await this.caseRepository.updateByIdForLawyer(
        lawyerId,
        caseId,
        caseData as Partial<Case>,
      );
    }

    if (court && Object.keys(court).length > 0) {
      await this.caseRepository.updateCourt(lawyerId, caseId, court);
    }

    return this.getCaseById(lawyerId, caseId);
  }

  public async updateCaseState(
    lawyerId: string,
    caseId: string,
    state: string,
  ) {
    const updatedCase = await this.caseRepository.updateState(
      lawyerId,
      caseId,
      state,
    );

    if (!updatedCase) {
      throw new HttpException(404, MESSAGES.caseNotFound[LANGUAGE]);
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

  public async addClient(lawyerId: string, caseId: string, client: Client) {
    const updatedCase = await this.caseRepository.addClient(
      lawyerId,
      caseId,
      client,
    );

    if (!updatedCase) {
      throw new HttpException(404, MESSAGES.caseNotFound[LANGUAGE]);
    }

    return updatedCase;
  }

  public async updateClient(
    lawyerId: string,
    caseId: string,
    clientId: string,
    client: Partial<Client>,
  ) {
    this.ensureNotEmptyObject(
      client,
      MESSAGES["noClientFieldFound"][LANGUAGE],
      400,
    );

    const existingCase = await this.ensureCaseBelongsToLawyer(lawyerId, caseId);

    this.ensureSubDocumentExists(
      existingCase.clients,
      clientId,
      MESSAGES["clientNotFound"][LANGUAGE],
      404,
    );

    await this.caseRepository.updateClient(lawyerId, caseId, clientId, client);

    return this.getCaseById(lawyerId, caseId);
  }

  public async removeClient(
    lawyerId: string,
    caseId: string,
    clientId: string,
  ) {
    const existingCase = await this.ensureCaseBelongsToLawyer(lawyerId, caseId);

    this.ensureSubDocumentExists(
      existingCase.clients,
      clientId,
      MESSAGES["clientNotFound"][LANGUAGE],
      404,
    );

    if (existingCase.clients.length <= 1) {
      throw new HttpException(400, MESSAGES["caseNeedClient"][LANGUAGE]);
    }

    await this.caseRepository.removeClient(lawyerId, caseId, clientId);

    return this.getCaseById(lawyerId, caseId);
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
