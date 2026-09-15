import mongoose from "mongoose";

import type {
  ClientSession,
} from "mongoose";

import {
  toClientLawyerInquiryDTO,
  toLawyerClientInquiryDTO,
} from "../dtos/clientLawyerInquiry.dto";

import {
  HttpException,
} from "../exceptions/httpException";

import type {
  ClientLawyerInquiryListOptions,
  ClientLawyerInquiryRecord,
  CreateClientLawyerInquiryInput,
  LawyerInquiryDecisionInput,
} from "../interfaces/clientLawyerInquiry.interface";

import {
  ClientLawyerInquiryRepository,
} from "../repositories/clientLawyerInquiry.repository";

import {
  ClientProfileRepository,
} from "../repositories/clientProfile.repository";

import {
  LawyerRepository,
} from "../repositories/lawyer.repository";

import {
  UserRepository,
} from "../repositories/user.repository";

import {
  LawyerClientService,
} from "./lawyerClient.service";


export class ClientLawyerInquiryService {
  constructor(
    private readonly inquiryRepository =
      new ClientLawyerInquiryRepository(),

    private readonly lawyerRepository =
      new LawyerRepository(),

    private readonly userRepository =
      new UserRepository(),

    private readonly clientProfileRepository =
      new ClientProfileRepository(),

    private readonly lawyerClientService =
      new LawyerClientService(),
  ) {}


  private async requireDirectoryLawyer(
    lawyerId:
      string,
  ) {
    const lawyer =
      await this.lawyerRepository
        .findClientDirectoryById(
          lawyerId,
        );

    if (
      !lawyer
    ) {
      throw new HttpException(
        404,

        "وکیل انتخاب‌شده در فهرست فعال موکلین پیدا نشد",

        "CLIENT_DIRECTORY_LAWYER_NOT_FOUND",
      );
    }

    return lawyer;
  }


  private async requireClientInquiry(
    clientId:
      string,

    inquiryId:
      string,
  ) {
    const inquiry =
      await this.inquiryRepository
        .findByIdForClient(
          clientId,

          inquiryId,
        );

    if (
      !inquiry
    ) {
      throw new HttpException(
        404,

        "درخواست بررسی پیدا نشد",

        "CLIENT_LAWYER_INQUIRY_NOT_FOUND",
      );
    }

    return inquiry;
  }


  private async requireLawyerInquiry(
    lawyerId:
      string,

    inquiryId:
      string,

    session?:
      ClientSession,
  ) {
    const inquiry =
      await this.inquiryRepository
        .findByIdForLawyer(
          lawyerId,

          inquiryId,

          session,
        );

    if (
      !inquiry
    ) {
      throw new HttpException(
        404,

        "درخواست بررسی پیدا نشد",

        "LAWYER_CLIENT_INQUIRY_NOT_FOUND",
      );
    }

    return inquiry;
  }


  private getAllowedCurrentStatuses(
    status:
      LawyerInquiryDecisionInput[
        "status"
      ],
  ): string[] {
    const allowedCurrentStatuses:
      Record<
        LawyerInquiryDecisionInput[
          "status"
        ],
        string[]
      > = {
        IN_REVIEW: [
          "SUBMITTED",
        ],

        ACCEPTED: [
          "SUBMITTED",
          "IN_REVIEW",
        ],

        REJECTED: [
          "SUBMITTED",
          "IN_REVIEW",
        ],

        CLOSED: [
          "ACCEPTED",
          "REJECTED",
        ],
      };


    return allowedCurrentStatuses[
      status
    ];
  }


  private assertTransitionAllowed(
    currentStatus:
      string,

    input:
      LawyerInquiryDecisionInput,
  ): void {
    const allowed =
      this.getAllowedCurrentStatuses(
        input.status,
      );


    if (
      !allowed.includes(
        currentStatus,
      )
    ) {
      throw new HttpException(
        409,

        "تغییر وضعیت درخواست با وضعیت فعلی آن مجاز نیست",

        "LAWYER_CLIENT_INQUIRY_INVALID_TRANSITION",
      );
    }
  }


  
  private async toLawyerInquiryResult(
    inquiry:
      | ClientLawyerInquiryRecord
      | null
      | undefined,
  ) {
    if (
      !inquiry
    ) {
      throw new HttpException(
        500,

        "اطلاعات درخواست پس از بروزرسانی پیدا نشد",

        "LAWYER_CLIENT_INQUIRY_RESULT_NOT_FOUND",
      );
    }


    const clientId =
      inquiry.clientId
        .toString();


    const [
      client,
      profile,
    ] =
      await Promise.all([
        this.userRepository
          .findById(
            clientId,
          ),

        this.clientProfileRepository
          .findByUserId(
            clientId,
          ),
      ]);


    if (
      !client
    ) {
      throw new HttpException(
        500,

        "اطلاعات موکل درخواست پیدا نشد",

        "INQUIRY_CLIENT_NOT_FOUND",
      );
    }


    return toLawyerClientInquiryDTO(
      inquiry,

      client,

      profile,
    );
  }


  public async create(
    clientId:
      string,

    input:
      CreateClientLawyerInquiryInput,
  ) {
 
    
    const lawyer =
      await this.requireDirectoryLawyer(
        input.lawyerId,
      );



      
    const profile =
      await this.clientProfileRepository
        .findByUserId(
          clientId,
        );


    if (
      !profile
        ?.fullName
        ?.trim()
    ) {
      throw new HttpException(
        409,

        "برای ارسال درخواست به وکیل، ابتدا نام و نام خانوادگی را در پروفایل موکل ثبت کنید",

        "CLIENT_PROFILE_REQUIRED",
      );
    }


    const created =
      await this.inquiryRepository
        .createForClient(
          clientId,

          input,
        );


    return toClientLawyerInquiryDTO(
      created,

      lawyer,
    );
  }


  public async listForClient(
    clientId:
      string,

    options:
      ClientLawyerInquiryListOptions,
  ) {
    const [
      items,
      total,
    ] =
      await Promise.all([
        this.inquiryRepository
          .listForClient(
            clientId,

            options,
          ),

        this.inquiryRepository
          .countForClient(
            clientId,

            options,
          ),
      ]);


    const lawyerIds =
      Array.from(
        new Set(
          items.map(
            (
              item,
            ) =>
              item.lawyerId
                .toString(),
          ),
        ),
      );


    const lawyers =
      await this.lawyerRepository
        .findByIds(
          lawyerIds,
        );


    const lawyersById =
      new Map(
        lawyers.map(
          (
            lawyer,
          ) => [
            lawyer._id
              .toString(),

            lawyer,
          ],
        ),
      );


    return {
      items:
        items.map(
          (
            item,
          ) => {
            const lawyer =
              lawyersById.get(
                item.lawyerId
                  .toString(),
              );


            if (
              !lawyer
            ) {
              throw new HttpException(
                500,

                "اطلاعات وکیل درخواست پیدا نشد",

                "INQUIRY_LAWYER_NOT_FOUND",
              );
            }


            return toClientLawyerInquiryDTO(
              item,

              lawyer,
            );
          },
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


  public async getForClient(
    clientId:
      string,

    inquiryId:
      string,
  ) {
    const inquiry =
      await this.requireClientInquiry(
        clientId,

        inquiryId,
      );


    const lawyer =
      await this.lawyerRepository
        .findById(
          inquiry.lawyerId
            .toString(),
        );


    if (
      !lawyer
    ) {
      throw new HttpException(
        500,

        "اطلاعات وکیل درخواست پیدا نشد",

        "INQUIRY_LAWYER_NOT_FOUND",
      );
    }


    return toClientLawyerInquiryDTO(
      inquiry,

      lawyer,
    );
  }


  public async cancelForClient(
    clientId:
      string,

    inquiryId:
      string,
  ) {
    const current =
      await this.requireClientInquiry(
        clientId,

        inquiryId,
      );


    if (
      ![
        "SUBMITTED",
        "IN_REVIEW",
      ].includes(
        current.status,
      )
    ) {
      throw new HttpException(
        409,

        "این درخواست دیگر قابل لغو نیست",

        "CLIENT_LAWYER_INQUIRY_NOT_CANCELLABLE",
      );
    }


    const cancelled =
      await this.inquiryRepository
        .cancelForClient(
          clientId,

          inquiryId,
        );


    if (
      !cancelled
    ) {
      throw new HttpException(
        409,

        "لغو درخواست انجام نشد؛ وضعیت درخواست تغییر کرده است",

        "CLIENT_LAWYER_INQUIRY_CANCEL_CONFLICT",
      );
    }


    const lawyer =
      await this.lawyerRepository
        .findById(
          cancelled.lawyerId
            .toString(),
        );


    if (
      !lawyer
    ) {
      throw new HttpException(
        500,

        "اطلاعات وکیل درخواست پیدا نشد",

        "INQUIRY_LAWYER_NOT_FOUND",
      );
    }


    return toClientLawyerInquiryDTO(
      cancelled,

      lawyer,
    );
  }


  public async listForLawyer(
    lawyerId:
      string,

    options:
      ClientLawyerInquiryListOptions,
  ) {
    const [
      items,
      total,
    ] =
      await Promise.all([
        this.inquiryRepository
          .listForLawyer(
            lawyerId,

            options,
          ),

        this.inquiryRepository
          .countForLawyer(
            lawyerId,

            options,
          ),
      ]);


    const clientIds =
      Array.from(
        new Set(
          items.map(
            (
              item,
            ) =>
              item.clientId
                .toString(),
          ),
        ),
      );


    const [
      clients,
      profiles,
    ] =
      await Promise.all([
        Promise.all(
          clientIds.map(
            (
              clientId,
            ) =>
              this.userRepository
                .findById(
                  clientId,
                ),
          ),
        ),

        this.clientProfileRepository
          .findByUserIds(
            clientIds,
          ),
      ]);


    const existingClients =
      clients.filter(
        (
          client,
        ): client is NonNullable<
          typeof client
        > =>
          Boolean(
            client,
          ),
      );


    const clientsById =
      new Map(
        existingClients.map(
          (
            client,
          ) => [
            client._id
              .toString(),

            client,
          ],
        ),
      );


    const profilesByUserId =
      new Map(
        profiles.map(
          (
            profile,
          ) => [
            profile.userId
              .toString(),

            profile,
          ],
        ),
      );


    return {
      items:
        items.map(
          (
            item,
          ) => {
            const clientId =
              item.clientId
                .toString();


            const client =
              clientsById.get(
                clientId,
              );


            if (
              !client
            ) {
              throw new HttpException(
                500,

                "اطلاعات موکل درخواست پیدا نشد",

                "INQUIRY_CLIENT_NOT_FOUND",
              );
            }


            return toLawyerClientInquiryDTO(
              item,

              client,

              profilesByUserId.get(
                clientId,
              ),
            );
          },
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


  public async getForLawyer(
    lawyerId:
      string,

    inquiryId:
      string,
  ) {
    const inquiry =
      await this.requireLawyerInquiry(
        lawyerId,

        inquiryId,
      );


    const clientId =
      inquiry.clientId
        .toString();


    const [
      client,
      profile,
    ] =
      await Promise.all([
        this.userRepository
          .findById(
            clientId,
          ),

        this.clientProfileRepository
          .findByUserId(
            clientId,
          ),
      ]);


    if (
      !client
    ) {
      throw new HttpException(
        500,

        "اطلاعات موکل درخواست پیدا نشد",

        "INQUIRY_CLIENT_NOT_FOUND",
      );
    }


    return toLawyerClientInquiryDTO(
      inquiry,

      client,

      profile,
    );
  }


  public async decideForLawyer(
    lawyerId:
      string,

    inquiryId:
      string,

    input:
      LawyerInquiryDecisionInput,
  ) {
    const allowedCurrentStatuses =
      this.getAllowedCurrentStatuses(
        input.status,
      );


    
    if (
      input.status ===
      "ACCEPTED"
    ) {
      const session =
        await mongoose
          .startSession();


      try {
        const updated =
          await session
            .withTransaction(
              async () => {
                /*
                 * Read again INSIDE transaction.
                 *
                 * This prevents us from making a decision based on a
                 * stale status that changed between requests.
                 */
                const current =
                  await this.requireLawyerInquiry(
                    lawyerId,

                    inquiryId,

                    session,
                  );


                this.assertTransitionAllowed(
                  current.status,

                  input,
                );


                
                const lawyerClient =
                  await this.lawyerClientService
                    .ensureClientConnection(
                      lawyerId,

                      current.clientId
                        .toString(),

                      session,
                    );


                const accepted =
                  await this.inquiryRepository
                    .updateForLawyer(
                      lawyerId,

                      inquiryId,

                      allowedCurrentStatuses,

                      {
                        $set: {
                          status:
                            "ACCEPTED",

                          lawyerClientId:
                            lawyerClient._id,

                          ...(
                            input.response !==
                            undefined
                              ? {
                                  lawyerResponse:
                                    input.response,
                                }
                              : {}
                          ),

                          ...(
                            input.response
                              ?.trim()
                              ? {
                                  respondedAt:
                                    new Date(),
                                }
                              : {}
                          ),
                        },
                      },

                      session,
                    );


                if (
                  !accepted
                ) {
                  throw new HttpException(
                    409,

                    "ویرایش درخواست انجام نشد؛ وضعیت درخواست تغییر کرده است",

                    "LAWYER_CLIENT_INQUIRY_UPDATE_CONFLICT",
                  );
                }


                return accepted;
              },
            );


            
        return this.toLawyerInquiryResult(
          updated,
        );
      } finally {
        await session
          .endSession();
      }
    }



    
    const current =
      await this.requireLawyerInquiry(
        lawyerId,

        inquiryId,
      );


    this.assertTransitionAllowed(
      current.status,

      input,
    );


    const updated =
      await this.inquiryRepository
        .updateForLawyer(
          lawyerId,

          inquiryId,

          allowedCurrentStatuses,

          {
            $set: {
              status:
                input.status,

              ...(
                input.response !==
                undefined
                  ? {
                      lawyerResponse:
                        input.response,
                    }
                  : {}
              ),

              ...(
                input.response
                  ?.trim()
                  ? {
                      respondedAt:
                        new Date(),
                    }
                  : {}
              ),

              ...(
                input.status ===
                "CLOSED"
                  ? {
                      closedAt:
                        new Date(),
                    }
                  : {}
              ),
            },
          },
        );


    if (
      !updated
    ) {
      throw new HttpException(
        409,

        "ویرایش درخواست انجام نشد؛ وضعیت درخواست تغییر کرده است",

        "LAWYER_CLIENT_INQUIRY_UPDATE_CONFLICT",
      );
    }


    return this.toLawyerInquiryResult(
      updated,
    );
  } }