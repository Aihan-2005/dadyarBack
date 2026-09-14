import mongoose from "mongoose";

import type {
  AdminClientListOptions,
  AdminCreateLawyerInput,
  AdminLawyerListOptions,
  AdminPublishClientLawyerInput,
  AdminUpdateClientLawyerInput,
} from "../interfaces/admin.interface";

import type {
  UserRole,
  UserStatus,
} from "../interfaces/user.interface";

import {
  UserRepository,
} from "../repositories/user.repository";

import {
  LawyerRepository,
} from "../repositories/lawyer.repository";

import {
  TicketRepository,
} from "../repositories/ticket.repository";

import {
  TokenService,
} from "./token.service";

import {
  PasswordUtils,
} from "../utils/password.util";

import {
  toPublicUserDTO,
} from "../dtos/user.dto";

import {
  toAdminClientDTO,
  toAdminLawyerDTO,
  toAdminLawyerListItemDTO,
} from "../dtos/admin.dto";

import {
  toClientLawyerPlacementDTO,
} from "../dtos/lawyerDirectory.dto";

import {
  env,
} from "../config/env";

import {
  MESSAGES,
} from "../constants/messages.constants";

import {
  HttpException,
} from "../exceptions/httpException";

import {
  LAWYER_STATUSES,
  type LawyerStatus,
} from "../constants/lawyer.constants";

const LANGUAGE =
  env.LANGUAGE;

export class AdminService {
  constructor(
    private readonly userRepository =
      new UserRepository(),

    private readonly lawyerRepository =
      new LawyerRepository(),

    private readonly ticketRepository =
      new TicketRepository(),

    private readonly tokenService =
      new TokenService(),

    private readonly passwordUtils =
      new PasswordUtils(),
  ) {}

  private normalizeEmail(
    email?: string,
  ): string | undefined {
    return (
      email
        ?.trim()
        .toLowerCase() ||
      undefined
    );
  }

  private normalizePhone(
    phone?: string,
  ): string | undefined {
    return (
      phone?.trim() ||
      undefined
    );
  }

  private clampOrder(
    order: number,

    min: number,

    max: number,
  ): number {
    return Math.min(
      Math.max(
        order,
        min,
      ),
      max,
    );
  }


  
  public async createLawyer(
    input:
      AdminCreateLawyerInput,
  ) {
    const email =
      this.normalizeEmail(
        input.email,
      );

    const phone =
      this.normalizePhone(
        input.phone,
      );

    const licenseNumber =
      input.licenseNumber
        ?.trim() ||
      undefined;

    const [
      emailOwner,
      phoneOwner,
      licenseOwner,
    ] =
      await Promise.all([
        email
          ? this.userRepository.findByEmail(
              email,
            )
          : Promise.resolve(
              null,
            ),

        phone
          ? this.userRepository.findByPhone(
              phone,
            )
          : Promise.resolve(
              null,
            ),

        licenseNumber
          ? this.lawyerRepository.findByLicenseNumber(
              licenseNumber,
            )
          : Promise.resolve(
              null,
            ),
      ]);

    if (
      emailOwner
    ) {
      throw new HttpException(
        409,

        MESSAGES.emailExsist[
          LANGUAGE
        ],

        "EMAIL_ALREADY_EXISTS",
      );
    }

    if (
      phoneOwner
    ) {
      throw new HttpException(
        409,

        MESSAGES.phoneExsist[
          LANGUAGE
        ],

        "PHONE_ALREADY_EXISTS",
      );
    }

    if (
      licenseOwner
    ) {
      throw new HttpException(
        409,

        MESSAGES.barExsist[
          LANGUAGE
        ],

        "LICENSE_NUMBER_ALREADY_EXISTS",
      );
    }

    const hashedPassword =
      await this.passwordUtils.hashPassword(
        input.password,
      );

    const session =
      await mongoose.startSession();

    try {
      const lawyerId =
        await session.withTransaction(
          async () => {
            const user =
              await this.userRepository.create(
                {
                  ...(email
                    ? {
                        email,
                      }
                    : {}),

                  ...(phone
                    ? {
                        phone,
                      }
                    : {}),

                  password:
                    hashedPassword,

                  role:
                    "LAWYER",
                },

                session,
              );

            await this.lawyerRepository.create(
              user._id,

              {
                firstName:
                  input.firstName.trim(),

                lastName:
                  input.lastName.trim(),
              },

              session,
            );

            const profileFields:
              Record<
                string,
                unknown
              > = {};

            if (
              input.specialization
            ) {
              profileFields.specialization =
                input.specialization.trim();
            }

            if (
              licenseNumber
            ) {
              profileFields.licenseNumber =
                licenseNumber;
            }

            if (
              Object.keys(
                profileFields,
              ).length >
              0
            ) {
              const updatedLawyer =
                await this.lawyerRepository.updateProfileById(
                  user._id.toString(),

                  {
                    $set:
                      profileFields,
                  },

                  session,
                );

              if (
                !updatedLawyer
              ) {
                throw new HttpException(
                  500,

                  MESSAGES.serverError[
                    LANGUAGE
                  ],

                  "ADMIN_CREATE_LAWYER_PROFILE_FAILED",
                );
              }
            }

            return user._id.toString();
          },
        );

      if (
        !lawyerId
      ) {
        throw new HttpException(
          500,

          MESSAGES.serverError[
            LANGUAGE
          ],

          "ADMIN_CREATE_LAWYER_FAILED",
        );
      }

      return this.getLawyerById(
        lawyerId,
      );
    } finally {
      await session.endSession();
    }
  }


  
  public async listClients(
    options:
      AdminClientListOptions,
  ) {
    const [
      clients,
      total,
    ] =
      await Promise.all([
        this.userRepository.findClientsForAdmin(
          options,
        ),

        this.userRepository.countClientsForAdmin(
          options,
        ),
      ]);

    return {
      items:
        clients.map(
          toAdminClientDTO,
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


  
  public async listLawyers(
    options:
      AdminLawyerListOptions,
  ) {
    const result =
      await this.lawyerRepository.findForAdmin(
        options,
      );

    return {
      items:
        result.items.map(
          (
            lawyer,
          ) =>
            toAdminLawyerListItemDTO(
              lawyer,

              lawyer.user,
            ),
        ),

      pagination: {
        page:
          options.page,

        limit:
          options.limit,

        total:
          result.total,

        totalPages:
          Math.ceil(
            result.total /
              options.limit,
          ),
      },
    };
  }

  public async getLawyerById(
    lawyerId:
      string,
  ) {
    const [
      user,
      lawyer,
    ] =
      await Promise.all([
        this.userRepository.findByIdAndRole(
          lawyerId,

          "LAWYER",
        ),

        this.lawyerRepository.findById(
          lawyerId,
        ),
      ]);

    if (
      !user ||
      !lawyer
    ) {
      throw new HttpException(
        404,

        MESSAGES.noUserWithId[
          LANGUAGE
        ],

        "LAWYER_NOT_FOUND",
      );
    }

    return toAdminLawyerDTO(
      lawyer,

      user,
    );
  }

  public async updateLawyerStatus(
    lawyerId:
      string,

    status:
      LawyerStatus,
  ) {
    const [
      user,
      lawyer,
    ] =
      await Promise.all([
        this.userRepository.findByIdAndRole(
          lawyerId,

          "LAWYER",
        ),

        this.lawyerRepository.findById(
          lawyerId,
        ),
      ]);

    if (
      !user ||
      !lawyer
    ) {
      throw new HttpException(
        404,

        MESSAGES.noUserWithId[
          LANGUAGE
        ],

        "LAWYER_NOT_FOUND",
      );
    }

    let licenseVerifiedAt:
      | Date
      | null
      | undefined;

    switch (
      status
    ) {
      case LAWYER_STATUSES.ACTIVE:
        licenseVerifiedAt =
          lawyer.licenseVerifiedAt ??
          new Date();

        break;

      case LAWYER_STATUSES.PENDING_VERIFICATION:
      case LAWYER_STATUSES.REJECTED:
        licenseVerifiedAt =
          null;

        break;

      case LAWYER_STATUSES.SUSPENDED:
        licenseVerifiedAt =
          undefined;

        break;
    }

    const updatedLawyer =
      await this.lawyerRepository.updateStatusById(
        lawyerId,

        status,

        licenseVerifiedAt,
      );

    if (
      !updatedLawyer
    ) {
      throw new HttpException(
        404,

        MESSAGES.noUserWithId[
          LANGUAGE
        ],

        "LAWYER_NOT_FOUND",
      );
    }

    return toAdminLawyerDTO(
      updatedLawyer,

      user,
    );
  }


  
  public async listClientLawyerPlacements() {
    const lawyers =
      await this.lawyerRepository.findClientDirectoryPlacements();

    return lawyers.map(
      toClientLawyerPlacementDTO,
    );
  }

  public async publishLawyerToClientDirectory(
    lawyerId:
      string,

    input:
      AdminPublishClientLawyerInput,
  ) {
    const [
      user,
      lawyer,
    ] =
      await Promise.all([
        this.userRepository.findByIdAndRole(
          lawyerId,

          "LAWYER",
        ),

        this.lawyerRepository.findById(
          lawyerId,
        ),
      ]);

    if (
      !user ||
      !lawyer
    ) {
      throw new HttpException(
        404,

        MESSAGES.noUserWithId[
          LANGUAGE
        ],

        "LAWYER_NOT_FOUND",
      );
    }

    if (
      user.status !==
        "ACTIVE" ||
      lawyer.status !==
        LAWYER_STATUSES.ACTIVE
    ) {
      throw new HttpException(
        409,

        "فقط وکیل دارای حساب فعال و وضعیت حرفه‌ای ACTIVE قابل انتشار است.",

        "LAWYER_NOT_ELIGIBLE_FOR_CLIENT_DIRECTORY",
      );
    }

    if (
      lawyer.clientDirectory
        ?.isVisible
    ) {
      throw new HttpException(
        409,

        "این وکیل قبلاً به بخش موکلین اضافه شده است.",

        "LAWYER_ALREADY_IN_CLIENT_DIRECTORY",
      );
    }

    const session =
      await mongoose.startSession();

    try {
      const updated =
        await session.withTransaction(
          async () => {
            const current =
              await this.lawyerRepository.findClientDirectoryStateById(
                lawyerId,

                session,
              );

            if (
              !current
            ) {
              throw new HttpException(
                404,

                MESSAGES.noUserWithId[
                  LANGUAGE
                ],

                "LAWYER_NOT_FOUND",
              );
            }

            if (
              current.status !==
              LAWYER_STATUSES.ACTIVE
            ) {
              throw new HttpException(
                409,

                "فقط وکیل دارای وضعیت حرفه‌ای ACTIVE قابل انتشار است.",

                "LAWYER_NOT_ELIGIBLE_FOR_CLIENT_DIRECTORY",
              );
            }

            if (
              current.clientDirectory
                ?.isVisible
            ) {
              throw new HttpException(
                409,

                "این وکیل قبلاً به بخش موکلین اضافه شده است.",

                "LAWYER_ALREADY_IN_CLIENT_DIRECTORY",
              );
            }

            const total =
              await this.lawyerRepository.countClientDirectoryPlacements(
                session,
              );

            const requestedOrder =
              input.displayOrder ??
              total + 1;

            const targetOrder =
              this.clampOrder(
                requestedOrder,

                1,

                total + 1,
              );

            await this.lawyerRepository.shiftClientDirectoryForInsert(
              targetOrder,

              session,
            );

            const result =
              await this.lawyerRepository.updateClientDirectoryById(
                lawyerId,

                {
                  $set: {
                    "clientDirectory.isVisible":
                      true,

                    "clientDirectory.isFeatured":
                      input.isFeatured,

                    "clientDirectory.displayOrder":
                      targetOrder,

                    "clientDirectory.publishedAt":
                      new Date(),
                  },
                },

                session,
              );

            if (
              !result
            ) {
              throw new HttpException(
                404,

                MESSAGES.noUserWithId[
                  LANGUAGE
                ],

                "LAWYER_NOT_FOUND",
              );
            }

            return result;
          },
        );

      if (
        !updated
      ) {
        throw new HttpException(
          500,

          MESSAGES.serverError[
            LANGUAGE
          ],

          "CLIENT_DIRECTORY_PUBLISH_FAILED",
        );
      }

      return toClientLawyerPlacementDTO(
        updated,
      );
    } finally {
      await session.endSession();
    }
  }

  public async updateClientLawyerPlacement(
    lawyerId:
      string,

    input:
      AdminUpdateClientLawyerInput,
  ) {
    const session =
      await mongoose.startSession();

    try {
      const updated =
        await session.withTransaction(
          async () => {
            const current =
              await this.lawyerRepository.findClientDirectoryStateById(
                lawyerId,

                session,
              );

            if (
              !current ||
              !current.clientDirectory
                ?.isVisible
            ) {
              throw new HttpException(
                404,

                "وکیل موردنظر در بخش موکلین وجود ندارد.",

                "CLIENT_DIRECTORY_ENTRY_NOT_FOUND",
              );
            }

            const setFields:
              Record<
                string,
                unknown
              > = {};

            if (
              input.isFeatured !==
              undefined
            ) {
              setFields[
                "clientDirectory.isFeatured"
              ] =
                input.isFeatured;
            }

            if (
              input.displayOrder !==
              undefined
            ) {
              const total =
                await this.lawyerRepository.countClientDirectoryPlacements(
                  session,
                );

              const currentOrder =
                this.clampOrder(
                  current
                    .clientDirectory
                    .displayOrder ??
                    total,

                  1,

                  Math.max(
                    total,
                    1,
                  ),
                );

              const targetOrder =
                this.clampOrder(
                  input.displayOrder,

                  1,

                  Math.max(
                    total,
                    1,
                  ),
                );

              if (
                targetOrder !==
                currentOrder
              ) {
                await this.lawyerRepository.shiftClientDirectoryForMove(
                  lawyerId,

                  currentOrder,

                  targetOrder,

                  session,
                );

                setFields[
                  "clientDirectory.displayOrder"
                ] =
                  targetOrder;
              }
            }

            if (
              Object.keys(
                setFields,
              ).length ===
              0
            ) {
              return current;
            }

            const result =
              await this.lawyerRepository.updateClientDirectoryById(
                lawyerId,

                {
                  $set:
                    setFields,
                },

                session,
              );

            if (
              !result
            ) {
              throw new HttpException(
                404,

                "وکیل موردنظر در بخش موکلین وجود ندارد.",

                "CLIENT_DIRECTORY_ENTRY_NOT_FOUND",
              );
            }

            return result;
          },
        );

      if (
        !updated
      ) {
        throw new HttpException(
          500,

          MESSAGES.serverError[
            LANGUAGE
          ],

          "CLIENT_DIRECTORY_UPDATE_FAILED",
        );
      }

      return toClientLawyerPlacementDTO(
        updated,
      );
    } finally {
      await session.endSession();
    }
  }

  public async removeLawyerFromClientDirectory(
    lawyerId:
      string,
  ) {
    const session =
      await mongoose.startSession();

    try {
      await session.withTransaction(
        async () => {
          const current =
            await this.lawyerRepository.findClientDirectoryStateById(
              lawyerId,

              session,
            );

          if (
            !current ||
            !current.clientDirectory
              ?.isVisible
          ) {
            throw new HttpException(
              404,

              "وکیل موردنظر در بخش موکلین وجود ندارد.",

              "CLIENT_DIRECTORY_ENTRY_NOT_FOUND",
            );
          }

          const total =
            await this.lawyerRepository.countClientDirectoryPlacements(
              session,
            );

          const currentOrder =
            this.clampOrder(
              current
                .clientDirectory
                .displayOrder ??
                total,

              1,

              Math.max(
                total,
                1,
              ),
            );

          const removed =
            await this.lawyerRepository.updateClientDirectoryById(
              lawyerId,

              {
                $set: {
                  "clientDirectory.isVisible":
                    false,

                  "clientDirectory.isFeatured":
                    false,

                  "clientDirectory.displayOrder":
                    null,

                  "clientDirectory.publishedAt":
                    null,
                },
              },

              session,
            );

          if (
            !removed
          ) {
            throw new HttpException(
              404,

              "وکیل موردنظر در بخش موکلین وجود ندارد.",

              "CLIENT_DIRECTORY_ENTRY_NOT_FOUND",
            );
          }

          await this.lawyerRepository.shiftClientDirectoryForRemoval(
            currentOrder,

            session,
          );
        },
      );
    } finally {
      await session.endSession();
    }
  }


  
  public async updateUserAccountStatus(
    userId:
      string,

    role:
      UserRole,

    status:
      UserStatus,
  ) {
    const user =
      await this.userRepository.updateStatusByIdAndRole(
        userId,

        role,

        status,
      );

    if (
      !user
    ) {
      throw new HttpException(
        404,

        MESSAGES.noUserWithId[
          LANGUAGE
        ],

        "USER_NOT_FOUND",
      );
    }

    return toPublicUserDTO(
      user,
    );
  }

  public async getClientById(
    clientId:
      string,
  ) {
    const client =
      await this.userRepository.findByIdAndRole(
        clientId,

        "CLIENT",
      );

    if (
      !client
    ) {
      throw new HttpException(
        404,

        MESSAGES.noUserWithId[
          LANGUAGE
        ],

        "CLIENT_NOT_FOUND",
      );
    }

    return toAdminClientDTO(
      client,
    );
  }


  
  public async getDashboard() {
    const [
      accountStats,
      lawyerStats,
      ticketStats,
    ] =
      await Promise.all([
        this.userRepository.getAdminDashboardStats(),

        this.lawyerRepository.getAdminDashboardStats(),

        this.ticketRepository.getAdminDashboardStats(),
      ]);

    return {
      accounts:
        accountStats,

      lawyerProfiles:
        lawyerStats,

      tickets:
        ticketStats,
    };
  }


  
  public async resetUserPassword(
    userId:
      string,

    role:
      UserRole,

    newPassword:
      string,
  ): Promise<void> {
    const hashedPassword =
      await this.passwordUtils.hashPassword(
        newPassword,
      );

    const session =
      await mongoose.startSession();

    try {
      await session.withTransaction(
        async () => {
          const result =
            await this.userRepository.updatePasswordByIdAndRole(
              userId,

              role,

              hashedPassword,

              session,
            );

          if (
            result.matchedCount ===
            0
          ) {
            throw new HttpException(
              404,

              MESSAGES.noUserWithId[
                LANGUAGE
              ],

              "USER_NOT_FOUND",
            );
          }

          await this.tokenService.revokeAllUserSessions(
            userId,

            session,
          );
        },
      );
    } finally {
      await session.endSession();
    }
  }
}
