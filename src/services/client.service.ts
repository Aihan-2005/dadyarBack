import type {
  ClientSession,
  UpdateQuery,
} from 'mongoose'

import { env } from '../config/env'

import { MESSAGES } from '../constants/messages.constants'

import { HttpException } from '../exceptions/httpException'

import type {
  Client,
  ClientCreatePayload,
  ClientRecord,
  FindClientsOptions,
  ManualCaseClientInput,
  UpdateClientInput,
} from '../interfaces/client.interface'

import { ClientRepository } from '../repositories/client.repository'

const LANGUAGE =
  env.LANGUAGE

export class ClientService {
  private readonly repo =
    new ClientRepository()

  

  private normalizeRequiredString(
    value: string
  ): string {
    return value.trim()
  }

  private normalizeOptionalString(
    value?:
      | string
      | null
  ): string | undefined {
    return (
      value?.trim() ||
      undefined
    )
  }

  private normalizePhone(
    phone: string
  ): string {
    return phone.trim()
  }

  private normalizeNationalId(
    nationalId?:
      | string
      | null
  ): string | undefined {
    return (
      nationalId?.trim() ||
      undefined
    )
  }

  private sameClient(
    recordId: unknown,
    clientId: string
  ): boolean {
    return (
      String(
        recordId
      ) === clientId
    )
  }

  private ensureNotEmptyObject(
    data:
      Record<
        string,
        unknown
      >
  ): void {
    if (
      Object.keys(
        data
      ).length ===
      0
    ) {
      throw new HttpException(
        400,

        MESSAGES.noClientFieldFound[
          LANGUAGE
        ],

        'NO_CLIENT_FIELDS'
      )
    }
  }

  private async ensureClientBelongsToLawyer(
    lawyerId: string,
    clientId: string
  ) {
    const client =
      await this.repo.findByIdForLawyer(
        lawyerId,
        clientId
      )

    if (!client) {
      throw new HttpException(
        404,

        MESSAGES.clientNotFound[
          LANGUAGE
        ],

        'CLIENT_NOT_FOUND'
      )
    }

    return client
  }

  private async ensureUniqueClientIdentity(
    lawyerId: string,
    phone: string,
    nationalId?: string,
    ignoredClientId?: string,
    session?:
      ClientSession
  ): Promise<void> {
    const [
      phoneOwner,
      nationalIdOwner,
    ] =
      await Promise.all([
        this.repo.findByPhone(
          lawyerId,
          phone,
          session
        ),

        nationalId
          ? this.repo.findByNationalId(
              lawyerId,
              nationalId,
              session
            )
          : Promise.resolve(
              null
            ),
      ])

    if (
      phoneOwner &&
      (
        !ignoredClientId ||
        !this.sameClient(
          phoneOwner._id,
          ignoredClientId
        )
      )
    ) {
      throw new HttpException(
        409,

        MESSAGES.phoneExsist[
          LANGUAGE
        ],

        'CLIENT_PHONE_ALREADY_EXISTS'
      )
    }

    if (
      nationalIdOwner &&
      (
        !ignoredClientId ||
        !this.sameClient(
          nationalIdOwner._id,
          ignoredClientId
        )
      )
    ) {
      throw new HttpException(
        409,

        MESSAGES.nationalIdExists[
          LANGUAGE
        ],

        'CLIENT_NATIONAL_ID_ALREADY_EXISTS'
      )
    }
  }

 

  public async createClient(
    lawyerId: string,
    input:
      ClientCreatePayload
  ) {
    const phone =
      this.normalizePhone(
        input.phone
      )

    const nationalId =
      this.normalizeNationalId(
        input.nationalId
      )

    await this.ensureUniqueClientIdentity(
      lawyerId,
      phone,
      nationalId
    )

    return this.repo.create(
      lawyerId,
      {
        fullName:
          this.normalizeRequiredString(
            input.fullName
          ),

        phone,

        nationalId,

        homeNumber:
          this.normalizeOptionalString(
            input.homeNumber
          ),

        represent:
          this.normalizeOptionalString(
            input.represent
          ),

        birthday:
          input.birthday,

        homeAddress:
          this.normalizeOptionalString(
            input.homeAddress
          ),
      }
    )
  }

  

  public async getClientById(
    lawyerId: string,
    clientId: string
  ) {
    return this.ensureClientBelongsToLawyer(
      lawyerId,
      clientId
    )
  }

  public async findClientByPhone(
    lawyerId: string,
    phone: string
  ) {
    return this.repo.findByPhone(
      lawyerId,
      this.normalizePhone(
        phone
      )
    )
  }

  public async listClients(
    lawyerId: string,
    options:
      FindClientsOptions = {}
  ) {
    const page =
      Math.max(
        options.page ??
          1,
        1
      )

    const limit =
      Math.min(
        Math.max(
          options.limit ??
            10,
          1
        ),
        100
      )

    const safeOptions:
      FindClientsOptions = {
        ...options,

        search:
          options.search?.trim(),

        page,

        limit,
      }

    const [
      items,
      total,
    ] =
      await Promise.all([
        this.repo.findByLawyerId(
          lawyerId,
          safeOptions
        ),

        this.repo.countByLawyerId(
          lawyerId,
          safeOptions
        ),
      ])

    return {
      items,

      pagination: {
        page,

        limit,

        total,

        totalPages:
          Math.ceil(
            total /
              limit
          ),
      },
    }
  }

 

  public async updateClient(
    lawyerId: string,
    clientId: string,
    input:
      UpdateClientInput
  ) {
    this.ensureNotEmptyObject(
      input
    )

    const current =
      await this.ensureClientBelongsToLawyer(
        lawyerId,
        clientId
      )

    const phone =
      input.phone !==
      undefined
        ? this.normalizePhone(
            input.phone
          )
        : current.phone

    const nationalId =
      input.nationalId !==
      undefined
        ? this.normalizeNationalId(
            input.nationalId
          )
        : this.normalizeNationalId(
            current.nationalId
          )

    const phoneChanged =
      phone !==
      current.phone

    const nationalIdChanged =
      nationalId !==
      this.normalizeNationalId(
        current.nationalId
      )

    if (
      phoneChanged ||
      nationalIdChanged
    ) {
      await this.ensureUniqueClientIdentity(
        lawyerId,
        phone,
        nationalId,
        clientId
      )
    }

    const setFields:
      Record<
        string,
        unknown
      > = {}

    const unsetFields:
      Record<
        string,
        1
      > = {}

    if (
      input.fullName !==
      undefined
    ) {
      setFields.fullName =
        this.normalizeRequiredString(
          input.fullName
        )
    }

    if (
      input.phone !==
      undefined
    ) {
      setFields.phone =
        phone
    }

   

    if (
      input.represent !==
      undefined
    ) {
      const represent =
        this.normalizeOptionalString(
          input.represent
        )

      if (represent) {
        setFields.represent =
          represent
      } else {
        unsetFields.represent =
          1
      }
    }

  

    if (
      input.nationalId !==
      undefined
    ) {
      if (nationalId) {
        setFields.nationalId =
          nationalId
      } else {
        unsetFields.nationalId =
          1
      }
    }

    

    if (
      input.homeNumber !==
      undefined
    ) {
      const homeNumber =
        this.normalizeOptionalString(
          input.homeNumber
        )

      if (homeNumber) {
        setFields.homeNumber =
          homeNumber
      } else {
        unsetFields.homeNumber =
          1
      }
    }

  

    if (
      input.birthday !==
      undefined
    ) {
      if (
        input.birthday
      ) {
        setFields.birthday =
          input.birthday
      } else {
        unsetFields.birthday =
          1
      }
    }

    

    if (
      input.homeAddress !==
      undefined
    ) {
      const homeAddress =
        this.normalizeOptionalString(
          input.homeAddress
        )

      if (homeAddress) {
        setFields.homeAddress =
          homeAddress
      } else {
        unsetFields.homeAddress =
          1
      }
    }

    const update:
      UpdateQuery<Client> = {}

    if (
      Object.keys(
        setFields
      ).length > 0
    ) {
      update.$set =
        setFields
    }

    if (
      Object.keys(
        unsetFields
      ).length > 0
    ) {
      update.$unset =
        unsetFields
    }

    const updated =
      await this.repo.updateByIdForLawyer(
        lawyerId,
        clientId,
        update
      )

    if (!updated) {
      throw new HttpException(
        404,

        MESSAGES.clientNotFound[
          LANGUAGE
        ],

        'CLIENT_NOT_FOUND'
      )
    }

    return updated
  }

  

  public async resolveClientForCase(
    lawyerId: string,
    input:
      ManualCaseClientInput,
    session:
      ClientSession
  ): Promise<ClientRecord> {
    const phone =
      this.normalizePhone(
        input.phone
      )

    const nationalId =
      this.normalizeNationalId(
        input.nationalId
      )

    const represent =
      this.normalizeOptionalString(
        input.represent
      )

    const existing =
      await this.repo.findByPhone(
        lawyerId,
        phone,
        session
      )

    if (existing) {
      if (
        nationalId &&
        existing.nationalId &&
        nationalId !==
          existing.nationalId
      ) {
        throw new HttpException(
          409,

          MESSAGES.clientDataConflict[
            LANGUAGE
          ],

          'CLIENT_DATA_CONFLICT'
        )
      }

      if (
        input.represent !==
          undefined &&
        represent !==
          existing.represent
      ) {
        const update:
          UpdateQuery<Client> =
          represent
            ? {
                $set: {
                  represent,
                },
              }
            : {
                $unset: {
                  represent:
                    1,
                },
              }

        const updated =
          await this.repo.updateByIdForLawyer(
            lawyerId,
            existing._id.toString(),
            update,
            session
          )

        return (
          updated ??
          existing
        )
      }

      return existing
    }

    const fullName =
      input.fullName?.trim()

    if (!fullName) {
      throw new HttpException(
        400,

        MESSAGES.clientFullNameRequired[
          LANGUAGE
        ],

        'CLIENT_FULL_NAME_REQUIRED'
      )
    }

    if (nationalId) {
      const nationalIdOwner =
        await this.repo.findByNationalId(
          lawyerId,
          nationalId,
          session
        )

      if (
        nationalIdOwner
      ) {
        throw new HttpException(
          409,

          MESSAGES.nationalIdExists[
            LANGUAGE
          ],

          'CLIENT_NATIONAL_ID_ALREADY_EXISTS'
        )
      }
    }

    return this.repo.create(
      lawyerId,
      {
        fullName,

        phone,

        nationalId,

        represent,
      },
      session
    )
  }
}