import {
  HttpException,
} from "../exceptions/httpException";

import type {
  ClientPetitionListOptions,
  CreateClientPetitionInput,
  UpdateClientPetitionInput,
} from "../interfaces/clientPetition.interface";

import {
  ClientPetitionRepository,
} from "../repositories/clientPetition.repository";

import {
  toClientPetitionDTO,
} from "../dtos/clientPetition.dto";

import {
  SubmittableClientPetitionSchema,
} from "../validators/clientPetition.validator";


export class ClientPetitionService {
  constructor(
    private readonly repository =
      new ClientPetitionRepository(),
  ) {}


  private async requirePetition(
    clientId: string,

    petitionId: string,
  ) {
    const petition =
      await this.repository
        .findByIdForClient(
          clientId,

          petitionId,
        );

    if (!petition) {
      throw new HttpException(
        404,

        "لایحه موردنظر پیدا نشد",

        "CLIENT_PETITION_NOT_FOUND",
      );
    }

    return petition;
  }


  public async create(
    clientId: string,

    input:
      CreateClientPetitionInput,
  ) {
    const petition =
      await this.repository
        .createForClient(
          clientId,

          input,
        );

    return toClientPetitionDTO(
      petition,
    );
  }


  public async list(
    clientId: string,

    options:
      ClientPetitionListOptions,
  ) {
    const [
      items,
      total,
    ] =
      await Promise.all([
        this.repository
          .listForClient(
            clientId,

            options,
          ),

        this.repository
          .countForClient(
            clientId,

            options,
          ),
      ]);

    return {
      items:
        items.map(
          toClientPetitionDTO,
        ),

      pagination: {
        page:
          options.page,

        limit:
          options.limit,

        total,

        totalPages:
          Math.ceil(
            total /
              options.limit,
          ),
      },
    };
  }


  public async getById(
    clientId: string,

    petitionId: string,
  ) {
    const petition =
      await this.requirePetition(
        clientId,

        petitionId,
      );

    return toClientPetitionDTO(
      petition,
    );
  }


  public async update(
    clientId: string,

    petitionId: string,

    input:
      UpdateClientPetitionInput,
  ) {
    const current =
      await this.requirePetition(
        clientId,

        petitionId,
      );

    if (
      current.status !==
      "DRAFT"
    ) {
      throw new HttpException(
        409,

        "فقط پیش‌نویس لایحه قابل ویرایش است",

        "CLIENT_PETITION_NOT_EDITABLE",
      );
    }

    const updated =
      await this.repository
        .updateDraftForClient(
          clientId,

          petitionId,

          {
            $set: {
              ...(input.title !==
              undefined
                ? {
                    title:
                      input.title,
                  }
                : {}),

              ...(input.caseNumber !==
              undefined
                ? {
                    caseNumber:
                      input.caseNumber ??
                      "",
                  }
                : {}),

              ...(input.court !==
              undefined
                ? {
                    court:
                      input.court ??
                      "",
                  }
                : {}),

              ...(input.subject !==
              undefined
                ? {
                    subject:
                      input.subject ??
                      "",
                  }
                : {}),

              ...(input.facts !==
              undefined
                ? {
                    facts:
                      input.facts ??
                      "",
                  }
                : {}),

              ...(input.arguments !==
              undefined
                ? {
                    arguments:
                      input.arguments ??
                      "",
                  }
                : {}),

              ...(input.evidence !==
              undefined
                ? {
                    evidence:
                      input.evidence,
                  }
                : {}),

              ...(input.requestedRelief !==
              undefined
                ? {
                    requestedRelief:
                      input.requestedRelief ??
                      "",
                  }
                : {}),
            },
          },
        );

    if (!updated) {
      throw new HttpException(
        409,

        "لایحه دیگر قابل ویرایش نیست",

        "CLIENT_PETITION_NOT_EDITABLE",
      );
    }

    return toClientPetitionDTO(
      updated,
    );
  }


  public async submit(
    clientId: string,

    petitionId: string,
  ) {
    const current =
      await this.requirePetition(
        clientId,

        petitionId,
      );

    if (
      current.status !==
      "DRAFT"
    ) {
      throw new HttpException(
        409,

        "این لایحه قبلاً از حالت پیش‌نویس خارج شده است",

        "CLIENT_PETITION_ALREADY_SUBMITTED",
      );
    }


    const validation =
      SubmittableClientPetitionSchema
        .safeParse({
          title:
            current.title,

          subject:
            current.subject,

          facts:
            current.facts,

          requestedRelief:
            current.requestedRelief,
        });


    if (!validation.success) {
      throw new HttpException(
        422,

        "برای ارسال لایحه، اطلاعات الزامی را کامل کنید",

        "CLIENT_PETITION_INCOMPLETE",

        validation.error.flatten()
          .fieldErrors,
      );
    }


    const submitted =
      await this.repository
        .submitDraftForClient(
          clientId,

          petitionId,
        );

    if (!submitted) {
      throw new HttpException(
        409,

        "ارسال لایحه انجام نشد؛ وضعیت آن را دوباره بررسی کنید",

        "CLIENT_PETITION_SUBMIT_CONFLICT",
      );
    }

    return toClientPetitionDTO(
      submitted,
    );
  }


  public async archive(
    clientId: string,

    petitionId: string,
  ) {
    const current =
      await this.requirePetition(
        clientId,

        petitionId,
      );

    if (
      current.status !==
      "SUBMITTED"
    ) {
      throw new HttpException(
        409,

        "فقط لایحه ارسال‌شده قابل بایگانی است",

        "CLIENT_PETITION_NOT_ARCHIVABLE",
      );
    }

    const archived =
      await this.repository
        .archiveForClient(
          clientId,

          petitionId,
        );

    if (!archived) {
      throw new HttpException(
        409,

        "بایگانی لایحه انجام نشد",

        "CLIENT_PETITION_ARCHIVE_CONFLICT",
      );
    }

    return toClientPetitionDTO(
      archived,
    );
  }


  public async deleteDraft(
    clientId: string,

    petitionId: string,
  ) {
    const current =
      await this.requirePetition(
        clientId,

        petitionId,
      );

    if (
      current.status !==
      "DRAFT"
    ) {
      throw new HttpException(
        409,

        "فقط پیش‌نویس لایحه قابل حذف است",

        "CLIENT_PETITION_NOT_DELETABLE",
      );
    }

    const deleted =
      await this.repository
        .deleteDraftForClient(
          clientId,

          petitionId,
        );

    if (!deleted) {
      throw new HttpException(
        409,

        "حذف پیش‌نویس انجام نشد",

        "CLIENT_PETITION_DELETE_CONFLICT",
      );
    }

    return {
      id:
        deleted._id.toString(),
    };
  }
}