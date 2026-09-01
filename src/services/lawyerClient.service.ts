import type { ClientSession, UpdateQuery } from "mongoose";

import { env } from "../config/env";

import { MESSAGES } from "../constants/messages.constants";

import { HttpException } from "../exceptions/httpException";

import type {
  LawyerClient,
  LawyerClientCreatePayload,
  LawyerClientRecord,
  FindLawyerClientsOptions,
  UpdateLawyerClientInput,
  ManualCaseLawyerClientInput,
} from "../interfaces/lawyerClient.interface";

import { LawyerClientRepository } from "../repositories/lawyerClient.repository";
import { UserRepository } from "../repositories/user.repository";

const LANGUAGE = env.LANGUAGE;

export class LawyerClientService {
  constructor(
    private readonly repo = new LawyerClientRepository(),

    private readonly userRepo = new UserRepository(),
  ) {}

  private normalizeRequiredString(value: string): string {
    return value.trim();
  }

  private normalizeOptionalString(value?: string | null): string | undefined {
    return value?.trim() || undefined;
  }

  private normalizePhone(phone: string): string {
    return phone.trim();
  }

  private normalizeNationalId(nationalId?: string | null): string | undefined {
    return nationalId?.trim() || undefined;
  }

  private sameClient(
    recordId: unknown,

    clientId: string,
  ): boolean {
    return String(recordId) === clientId;
  }

  private ensureNotEmptyObject(data: Record<string, unknown>): void {
    const hasAtLeastOneEffectiveField = Object.values(data).some(
      (value) => value !== undefined,
    );

    if (!hasAtLeastOneEffectiveField) {
      throw new HttpException(
        400,

        MESSAGES.noClientFieldFound[LANGUAGE],

        "NO_CLIENT_FIELDS",
      );
    }
  }

  private async ensureClientBelongsToLawyer(
    lawyerId: string,

    clientId: string,

    session?: ClientSession,
  ): Promise<LawyerClientRecord> {
    const client = await this.repo.findByIdForLawyer(
      lawyerId,

      clientId,

      session,
    );

    if (!client) {
      throw new HttpException(
        404,

        MESSAGES.clientNotFound[LANGUAGE],

        "CLIENT_NOT_FOUND",
      );
    }

    return client;
  }

  private async ensureUniqueClientIdentity(
    lawyerId: string,

    phone: string,

    nationalId?: string,

    ignoredClientId?: string,

    session?: ClientSession,
  ): Promise<void> {
    const [phoneOwner, nationalIdOwner] = await Promise.all([
      this.repo.findByPhone(
        lawyerId,

        phone,

        session,
      ),

      nationalId
        ? this.repo.findByNationalId(
            lawyerId,

            nationalId,

            session,
          )
        : Promise.resolve(null),
    ]);

    if (
      phoneOwner &&
      (!ignoredClientId ||
        !this.sameClient(
          phoneOwner._id,

          ignoredClientId,
        ))
    ) {
      throw new HttpException(
        409,

        MESSAGES.phoneExsist[LANGUAGE],

        "CLIENT_PHONE_ALREADY_EXISTS",
      );
    }

    if (
      nationalIdOwner &&
      (!ignoredClientId ||
        !this.sameClient(
          nationalIdOwner._id,

          ignoredClientId,
        ))
    ) {
      throw new HttpException(
        409,

        MESSAGES.nationalIdExists[LANGUAGE],

        "CLIENT_NATIONAL_ID_ALREADY_EXISTS",
      );
    }
  }

  private async findLinkableClientUserId(
    phone: string,
    session?: ClientSession,
  ) {
    const user = await this.userRepo.findByPhone(phone, session);

    if (!user || user.role !== "CLIENT" || !user.phoneVerifiedAt) {
      return undefined;
    }

    return user._id;
  }

  public async createLawyerClient(
    lawyerId: string,

    input: LawyerClientCreatePayload,
  ): Promise<LawyerClientRecord> {
    const phone = this.normalizePhone(input.phone);

    const nationalId = this.normalizeNationalId(input.nationalId);

    await this.ensureUniqueClientIdentity(
      lawyerId,

      phone,

      nationalId,
    );

    const userId = await this.findLinkableClientUserId(phone);

    return this.repo.create(
      lawyerId,

      {
        fullName: this.normalizeRequiredString(input.fullName),

        phone,

        nationalId,

        homeNumber: this.normalizeOptionalString(input.homeNumber),

        represent: this.normalizeOptionalString(input.represent),

        birthday: input.birthday,

        homeAddress: this.normalizeOptionalString(input.homeAddress),

        description: this.normalizeOptionalString(input.description),

        personalPassword: input.personalPassword,

        userId,
      },
    );
  }

  public async getLawyerClientById(
    lawyerId: string,

    clientId: string,

    session?: ClientSession,
  ): Promise<LawyerClientRecord> {
    const client = await this.repo.findByIdForLawyerWithPersonalPassword(
      lawyerId,

      clientId,

      session,
    );

    if (!client) {
      throw new HttpException(
        404,

        MESSAGES.clientNotFound[LANGUAGE],

        "CLIENT_NOT_FOUND",
      );
    }

    return client;
  }

  public async findLawyerClientByPhone(
    lawyerId: string,

    phone: string,
  ) {
    return this.repo.findByPhone(
      lawyerId,

      this.normalizePhone(phone),
    );
  }

  public async listLawyerClients(
    lawyerId: string,

    options: FindLawyerClientsOptions = {},
  ) {
    const page = Math.max(
      options.page ?? 1,

      1,
    );

    const limit = Math.min(
      Math.max(
        options.limit ?? 10,

        1,
      ),

      100,
    );

    const safeOptions: FindLawyerClientsOptions = {
      ...options,

      search: options.search?.trim(),

      page,

      limit,
    };

    const [items, total] = await Promise.all([
      this.repo.findByLawyerId(
        lawyerId,

        safeOptions,
      ),

      this.repo.countByLawyerId(
        lawyerId,

        safeOptions,
      ),
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

  public async updateLawyerClient(
    lawyerId: string,

    clientId: string,

    input: UpdateLawyerClientInput,
  ): Promise<LawyerClientRecord> {
    this.ensureNotEmptyObject(input);

    const current = await this.ensureClientBelongsToLawyer(
      lawyerId,

      clientId,
    );

    const phone =
      input.phone !== undefined
        ? this.normalizePhone(input.phone)
        : current.phone;

    const nationalId =
      input.nationalId !== undefined
        ? this.normalizeNationalId(input.nationalId)
        : this.normalizeNationalId(current.nationalId);

    const phoneChanged = phone !== current.phone;

    const nationalIdChanged =
      nationalId !== this.normalizeNationalId(current.nationalId);

    if (phoneChanged || nationalIdChanged) {
      await this.ensureUniqueClientIdentity(
        lawyerId,

        phone,

        nationalId,

        clientId,
      );
    }

    const setFields: Record<string, unknown> = {};

    const unsetFields: Record<string, 1> = {};

    if (phoneChanged) {
      const userId = await this.findLinkableClientUserId(phone);

      if (userId) {
        setFields.userId = userId;
      } else {
        unsetFields.userId = 1;
      }
    }

    if (input.fullName !== undefined) {
      setFields.fullName = this.normalizeRequiredString(input.fullName);
    }

    if (input.phone !== undefined) {
      setFields.phone = phone;
    }

    if (input.represent !== undefined) {
      const represent = this.normalizeOptionalString(input.represent);

      if (represent) {
        setFields.represent = represent;
      } else {
        unsetFields.represent = 1;
      }
    }

    if (input.nationalId !== undefined) {
      if (nationalId) {
        setFields.nationalId = nationalId;
      } else {
        unsetFields.nationalId = 1;
      }
    }

    if (input.homeNumber !== undefined) {
      const homeNumber = this.normalizeOptionalString(input.homeNumber);

      if (homeNumber) {
        setFields.homeNumber = homeNumber;
      } else {
        unsetFields.homeNumber = 1;
      }
    }

    if (input.birthday !== undefined) {
      if (input.birthday) {
        setFields.birthday = input.birthday;
      } else {
        unsetFields.birthday = 1;
      }
    }

    if (input.homeAddress !== undefined) {
      const homeAddress = this.normalizeOptionalString(input.homeAddress);

      if (homeAddress) {
        setFields.homeAddress = homeAddress;
      } else {
        unsetFields.homeAddress = 1;
      }
    }

    if (input.description !== undefined) {
      const description = this.normalizeOptionalString(input.description);

      if (description) {
        setFields.description = description;
      } else {
        unsetFields.description = 1;
      }
    }

    if (input.personalPassword !== undefined) {
      if (input.personalPassword === null) {
        unsetFields.personalPassword = 1;
      } else {
        setFields.personalPassword = input.personalPassword;
      }
    }

    const update: UpdateQuery<LawyerClient> = {};

    if (Object.keys(setFields).length > 0) {
      update.$set = setFields;
    }

    if (Object.keys(unsetFields).length > 0) {
      update.$unset = unsetFields;
    }

    const updated = await this.repo.updateByIdForLawyer(
      lawyerId,

      clientId,

      update,
    );

    if (!updated) {
      throw new HttpException(
        404,

        MESSAGES.clientNotFound[LANGUAGE],

        "CLIENT_NOT_FOUND",
      );
    }

    return updated;
  }

  public async resolveLawyerClientForCase(
    lawyerId: string,

    input: ManualCaseLawyerClientInput,

    session: ClientSession,
  ): Promise<LawyerClientRecord> {
    const phone = this.normalizePhone(input.phone);

    const nationalId = this.normalizeNationalId(input.nationalId);

    const represent = this.normalizeOptionalString(input.represent);

    const existing = await this.repo.findByPhone(
      lawyerId,

      phone,

      session,
    );

    if (existing) {
      if (
        nationalId &&
        existing.nationalId &&
        nationalId !== existing.nationalId
      ) {
        throw new HttpException(
          409,

          MESSAGES.clientDataConflict[LANGUAGE],

          "CLIENT_DATA_CONFLICT",
        );
      }

      if (input.represent !== undefined && represent !== existing.represent) {
        const update: UpdateQuery<LawyerClient> = represent
          ? {
              $set: {
                represent,
              },
            }
          : {
              $unset: {
                represent: 1,
              },
            };

        const updated = await this.repo.updateByIdForLawyer(
          lawyerId,

          existing._id.toString(),

          update,

          session,
        );

        return updated ?? existing;
      }

      return existing;
    }

    const fullName = input.fullName?.trim();

    if (!fullName) {
      throw new HttpException(
        400,

        MESSAGES.clientFullNameRequired[LANGUAGE],

        "CLIENT_FULL_NAME_REQUIRED",
      );
    }

    if (nationalId) {
      const nationalIdOwner = await this.repo.findByNationalId(
        lawyerId,

        nationalId,

        session,
      );

      if (nationalIdOwner) {
        throw new HttpException(
          409,

          MESSAGES.nationalIdExists[LANGUAGE],

          "CLIENT_NATIONAL_ID_ALREADY_EXISTS",
        );
      }
    }

    const userId = await this.findLinkableClientUserId(phone, session);

    return this.repo.create(
      lawyerId,

      {
        fullName,

        phone,

        nationalId,

        birthday: input.birthDate,

        represent,

        userId,
      },

      session,
    );
  }
}
