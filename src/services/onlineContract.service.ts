import {
  randomBytes,
  randomUUID,
} from "node:crypto";

import {
  ONLINE_CONTRACT_STATUSES,
} from "../constants/onlineContract.constants";

import {
  getOnlineContractTemplateSnapshot,
} from "../constants/onlineContractTemplates.constants";

import {
  toOnlineContractDTO,
} from "../dtos/onlineContract.dto";

import {
  HttpException,
} from "../exceptions/httpException";

import type {
  CreateOnlineContractInput,
  OnlineContractAuditEventData,
  OnlineContractDraftData,
  OnlineContractListOptions,
  RejectOnlineContractInput,
  RequestOnlineContractChangesInput,
  ReviewOnlineContractInput,
} from "../interfaces/onlineContract.interface";

import {
  ClientProfileRepository,
} from "../repositories/clientProfile.repository";

import {
  LawyerRepository,
} from "../repositories/lawyer.repository";

import {
  OnlineContractRepository,
} from "../repositories/onlineContract.repository";

import {
  UserRepository,
} from "../repositories/user.repository";

export class OnlineContractService {
  constructor(
    private readonly repository =
      new OnlineContractRepository(),

    private readonly userRepository =
      new UserRepository(),

    private readonly lawyerRepository =
      new LawyerRepository(),

    private readonly clientProfileRepository =
      new ClientProfileRepository(),
  ) {}

  private createReference(): string {
    const time =
      Date.now()
        .toString(
          36,
        )
        .toUpperCase();

    const random =
      randomBytes(
        4,
      )
        .toString(
          "hex",
        )
        .toUpperCase();

    return `DY-OC-${time}-${random}`;
  }

  private createAuditEvent(
    action:
      OnlineContractAuditEventData["action"],

    actor:
      OnlineContractAuditEventData["actor"],

    label:
      string,

    createdAt =
      new Date(),
  ): OnlineContractAuditEventData {
    return {
      id:
        randomUUID(),

      action,

      actor,

      label,

      createdAt,
    };
  }

  private normalizeFullPaymentDetails(
    value:
      string,
  ): string {
    return (
      value.trim() ||
      "پرداخت کامل طبق توافق طرفین."
    );
  }

  private async requireClientContract(
    clientId:
      string,

    contractId:
      string,
  ) {
    const contract =
      await this.repository
        .findByIdForClient(
          clientId,
          contractId,
        );

    if (
      !contract
    ) {
      throw new HttpException(
        404,
        "قرارداد موردنظر پیدا نشد",
        "ONLINE_CONTRACT_NOT_FOUND",
      );
    }

    return contract;
  }

  private async requireLawyerContract(
    lawyerId:
      string,

    contractId:
      string,
  ) {
    const contract =
      await this.repository
        .findByIdForLawyer(
          lawyerId,
          contractId,
        );

    if (
      !contract
    ) {
      throw new HttpException(
        404,
        "قرارداد موردنظر پیدا نشد",
        "ONLINE_CONTRACT_NOT_FOUND",
      );
    }

    return contract;
  }

  private conflict(
    message:
      string,

    code:
      string,
  ): never {
    throw new HttpException(
      409,
      message,
      code,
    );
  }

  public async createForClient(
    clientId:
      string,

    input:
      CreateOnlineContractInput,
  ) {
    const [
      clientUser,
      clientProfile,
      lawyer,
    ] =
      await Promise.all([
        this.userRepository
          .findByIdAndRole(
            clientId,
            "CLIENT",
          ),

        this.clientProfileRepository
          .findByUserId(
            clientId,
          ),

        this.lawyerRepository
          .findClientDirectoryById(
            input.lawyerId,
          ),
      ]);

    if (
      !clientUser
    ) {
      throw new HttpException(
        404,
        "حساب موکل پیدا نشد",
        "CLIENT_ACCOUNT_NOT_FOUND",
      );
    }

    const clientPhone =
      clientUser.phone?.trim();

    if (
      !clientPhone
    ) {
      throw new HttpException(
        409,
        "برای ثبت قرارداد، شماره موبایل موکل باید در حساب کاربری موجود باشد",
        "CLIENT_PHONE_REQUIRED",
      );
    }

    const clientFullName =
      clientProfile
        ?.fullName
        ?.trim();

    if (
      !clientFullName
    ) {
      throw new HttpException(
        409,
        "برای ثبت قرارداد، ابتدا نام و نام خانوادگی را در پروفایل موکل ثبت کنید",
        "CLIENT_PROFILE_REQUIRED",
      );
    }

    if (
      !lawyer
    ) {
      throw new HttpException(
        404,
        "این وکیل برای ثبت قرارداد آنلاین در دسترس نیست",
        "ONLINE_CONTRACT_LAWYER_NOT_AVAILABLE",
      );
    }

    const now =
      new Date();

    const templateSnapshot =
      getOnlineContractTemplateSnapshot(
        input.templateKey,
      );

    const draft:
      OnlineContractDraftData = {
        templateKey:
          input.templateKey,

        client: {
          fullName:
            clientFullName,

          phone:
            clientPhone,

          nationalId:
            input.nationalId,

          address:
            input.address ??
            "",
        },

        lawyer: {
          id:
            lawyer._id.toString(),

          fullName:
            `${lawyer.firstName} ${lawyer.lastName}`.trim(),

          specialization:
            lawyer.specialization ??
            "",

          licenseNumber:
            lawyer.licenseNumber ??
            "",

          address:
            lawyer.address ??
            "",
        },

        subject:
          input.subject,

        scope:
          input.scope,

        feeToman:
          input.feeToman,

        paymentMode:
          input.paymentMode,

        paymentDetails:
          input.paymentMode ===
          "full"
            ? this.normalizeFullPaymentDetails(
                input.paymentDetails,
              )
            : input.paymentDetails,

        startDate:
          input.startDate,

        servicePeriod:
          input.servicePeriod,

        additionalTerms:
          input.additionalTerms ??
          "",
      };

    const created =
      await this.repository
        .createContract({
          clientId,

          lawyerId:
            input.lawyerId,

          reference:
            this.createReference(),

          status:
            ONLINE_CONTRACT_STATUSES.WAITING_LAWYER_REVIEW,

          templateSnapshot,

          draft,

          version:
            1,

          versions: [
            {
              version:
                1,

              draft,

              createdBy:
                "client",

              createdAt:
                now,

              summary:
                "نسخه اولیه موکل",
            },
          ],

          auditTrail: [
            this.createAuditEvent(
              "created_by_client",
              "client",
              "قرارداد برای بررسی وکیل ارسال شد.",
              now,
            ),
          ],
        });

    return toOnlineContractDTO(
      created,
    );
  }

  public async listForClient(
    clientId:
      string,

    options:
      OnlineContractListOptions,
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
          toOnlineContractDTO,
        ),

      pagination: {
        page:
          options.page,

        limit:
          options.limit,

        total,

        totalPages:
          Math.max(
            1,

            Math.ceil(
              total /
              options.limit,
            ),
          ),
      },
    };
  }

  public async listForLawyer(
    lawyerId:
      string,

    options:
      OnlineContractListOptions,
  ) {
    const [
      items,
      total,
    ] =
      await Promise.all([
        this.repository
          .listForLawyer(
            lawyerId,
            options,
          ),

        this.repository
          .countForLawyer(
            lawyerId,
            options,
          ),
      ]);

    return {
      items:
        items.map(
          toOnlineContractDTO,
        ),

      pagination: {
        page:
          options.page,

        limit:
          options.limit,

        total,

        totalPages:
          Math.max(
            1,

            Math.ceil(
              total /
              options.limit,
            ),
          ),
      },
    };
  }

  public async getForClient(
    clientId:
      string,

    contractId:
      string,
  ) {
    return toOnlineContractDTO(
      await this.requireClientContract(
        clientId,
        contractId,
      ),
    );
  }

  public async getForLawyer(
    lawyerId:
      string,

    contractId:
      string,
  ) {
    return toOnlineContractDTO(
      await this.requireLawyerContract(
        lawyerId,
        contractId,
      ),
    );
  }

  public async reviewForLawyer(
    lawyerId:
      string,

    contractId:
      string,

    input:
      ReviewOnlineContractInput,
  ) {
    const current =
      await this.requireLawyerContract(
        lawyerId,
        contractId,
      );

    if (
      current.status !==
      ONLINE_CONTRACT_STATUSES.WAITING_LAWYER_REVIEW
    ) {
      this.conflict(
        "این قرارداد در وضعیت قابل بررسی نیست",
        "ONLINE_CONTRACT_NOT_REVIEWABLE",
      );
    }

    const nextVersion =
      current.version +
      1;

    const now =
      new Date();

    const nextDraft:
      OnlineContractDraftData = {
        templateKey:
          current.draft.templateKey,

        client: {
          fullName:
            current.draft.client.fullName,

          phone:
            current.draft.client.phone,

          nationalId:
            current.draft.client.nationalId,

          address:
            current.draft.client.address ??
            "",
        },

        lawyer: {
          id:
            current.draft.lawyer.id,

          fullName:
            current.draft.lawyer.fullName,

          specialization:
            current.draft.lawyer.specialization ??
            "",

          licenseNumber:
            current.draft.lawyer.licenseNumber ??
            "",

          address:
            current.draft.lawyer.address ??
            "",
        },

        subject:
          input.subject,

        scope:
          input.scope,

        feeToman:
          input.feeToman,

        paymentMode:
          input.paymentMode,

        paymentDetails:
          input.paymentMode ===
          "full"
            ? this.normalizeFullPaymentDetails(
                input.paymentDetails,
              )
            : input.paymentDetails,

        startDate:
          current.draft.startDate,

        servicePeriod:
          input.servicePeriod,

        additionalTerms:
          input.additionalTerms ??
          "",
      };

    const updated =
      await this.repository
        .reviewForLawyer(
          lawyerId,
          contractId,
          current.version,
          nextDraft,

          {
            version:
              nextVersion,

            draft:
              nextDraft,

            createdBy:
              "lawyer",

            createdAt:
              now,

            summary:
              "نسخه بررسی‌شده توسط وکیل",
          },

          [
            this.createAuditEvent(
              "reviewed_by_lawyer",
              "lawyer",
              "قرارداد توسط وکیل بررسی شد.",
              now,
            ),

            this.createAuditEvent(
              "updated_by_lawyer",
              "lawyer",
              `نسخه ${nextVersion.toLocaleString(
                "fa-IR",
              )} قرارداد ایجاد شد.`,
              now,
            ),

            this.createAuditEvent(
              "sent_to_client",
              "lawyer",
              `نسخه ${nextVersion.toLocaleString(
                "fa-IR",
              )} برای تأیید موکل ارسال شد.`,
              now,
            ),
          ],
        );

    if (
      !updated
    ) {
      this.conflict(
        "قرارداد هم‌زمان تغییر کرده است؛ صفحه را بروزرسانی و دوباره تلاش کنید",
        "ONLINE_CONTRACT_CONCURRENT_UPDATE",
      );
    }

    return toOnlineContractDTO(
      updated,
    );
  }

  public async approveForClient(
    clientId:
      string,

    contractId:
      string,
  ) {
    const current =
      await this.requireClientContract(
        clientId,
        contractId,
      );

    if (
      current.status !==
      ONLINE_CONTRACT_STATUSES.WAITING_CLIENT_APPROVAL
    ) {
      this.conflict(
        "این نسخه در وضعیت قابل تأیید نیست",
        "ONLINE_CONTRACT_NOT_APPROVABLE",
      );
    }

    const now =
      new Date();

    const updated =
      await this.repository
        .approveForClient(
          clientId,
          contractId,
          current.version,

          this.createAuditEvent(
            "approved_by_client",
            "client",
            `نسخه ${current.version.toLocaleString(
              "fa-IR",
            )} توسط موکل تأیید شد.`,
            now,
          ),
        );

    if (
      !updated
    ) {
      this.conflict(
        "قرارداد هم‌زمان تغییر کرده است؛ صفحه را بروزرسانی و دوباره تلاش کنید",
        "ONLINE_CONTRACT_CONCURRENT_UPDATE",
      );
    }

    return toOnlineContractDTO(
      updated,
    );
  }

  public async requestChangesForClient(
    clientId:
      string,

    contractId:
      string,

    input:
      RequestOnlineContractChangesInput,
  ) {
    const current =
      await this.requireClientContract(
        clientId,
        contractId,
      );

    if (
      current.status !==
      ONLINE_CONTRACT_STATUSES.WAITING_CLIENT_APPROVAL
    ) {
      this.conflict(
        "در این مرحله امکان درخواست اصلاح وجود ندارد",
        "ONLINE_CONTRACT_CHANGES_NOT_ALLOWED",
      );
    }

    const now =
      new Date();

    const updated =
      await this.repository
        .requestChangesForClient(
          clientId,
          contractId,
          current.version,
          input.feedback,

          this.createAuditEvent(
            "changes_requested_by_client",
            "client",
            `موکل درخواست اصلاح قرارداد را ثبت کرد: ${input.feedback}`,
            now,
          ),
        );

    if (
      !updated
    ) {
      this.conflict(
        "قرارداد هم‌زمان تغییر کرده است؛ صفحه را بروزرسانی و دوباره تلاش کنید",
        "ONLINE_CONTRACT_CONCURRENT_UPDATE",
      );
    }

    return toOnlineContractDTO(
      updated,
    );
  }

  public async signForLawyer(
    lawyerId:
      string,

    contractId:
      string,
  ) {
    const current =
      await this.requireLawyerContract(
        lawyerId,
        contractId,
      );

    if (
      current.status !==
      ONLINE_CONTRACT_STATUSES.WAITING_LAWYER_SIGNATURE
    ) {
      this.conflict(
        "این قرارداد در وضعیت قابل تأیید نهایی نیست",
        "ONLINE_CONTRACT_NOT_SIGNABLE",
      );
    }

    const now =
      new Date();

    const updated =
      await this.repository
        .signForLawyer(
          lawyerId,
          contractId,
          current.version,
          now,

          this.createAuditEvent(
            "signed_by_lawyer",
            "lawyer",
            `نسخه ${current.version.toLocaleString(
              "fa-IR",
            )} توسط وکیل تأیید نهایی شد و قرارداد تکمیل شد.`,
            now,
          ),
        );

    if (
      !updated
    ) {
      this.conflict(
        "قرارداد هم‌زمان تغییر کرده است؛ صفحه را بروزرسانی و دوباره تلاش کنید",
        "ONLINE_CONTRACT_CONCURRENT_UPDATE",
      );
    }

    return toOnlineContractDTO(
      updated,
    );
  }

  public async rejectForLawyer(
    lawyerId:
      string,

    contractId:
      string,

    input:
      RejectOnlineContractInput,
  ) {
    const current =
      await this.requireLawyerContract(
        lawyerId,
        contractId,
      );

    if (
      current.status !==
      ONLINE_CONTRACT_STATUSES.WAITING_LAWYER_REVIEW
    ) {
      this.conflict(
        "این قرارداد در وضعیت قابل رد شدن نیست",
        "ONLINE_CONTRACT_NOT_REJECTABLE",
      );
    }

    const now =
      new Date();

    const updated =
      await this.repository
        .rejectForLawyer(
          lawyerId,
          contractId,
          current.version,
          input.reason,

          this.createAuditEvent(
            "rejected_by_lawyer",
            "lawyer",
            `قرارداد توسط وکیل رد شد: ${input.reason}`,
            now,
          ),
        );

    if (
      !updated
    ) {
      this.conflict(
        "قرارداد هم‌زمان تغییر کرده است؛ صفحه را بروزرسانی و دوباره تلاش کنید",
        "ONLINE_CONTRACT_CONCURRENT_UPDATE",
      );
    }

    return toOnlineContractDTO(
      updated,
    );
  }
}
