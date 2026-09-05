import { toPublicUserDTO } from "../dtos/user.dto";
import type {
  AdminClientListOptions,
  AdminLawyerListOptions,
} from "../interfaces/admin.interface";
import type { UserRole, UserStatus } from "../interfaces/user.interface";
import { UserRepository } from "../repositories/user.repository";

import { env } from "../config/env";
import { MESSAGES } from "../constants/messages.constants";
import { HttpException } from "../exceptions/httpException";
import {
  LAWYER_STATUSES,
  type LawyerStatus,
} from "../constants/lawyer.constants";

import { LawyerRepository } from "../repositories/lawyer.repository";

import {
  toAdminClientDTO,
  toAdminLawyerDTO,
  toAdminLawyerListItemDTO,
} from "../dtos/admin.dto";
import { TicketRepository } from "../repositories/ticket.repository";

const LANGUAGE = env.LANGUAGE;

export class AdminService {
  constructor(
    private readonly userRepository = new UserRepository(),

    private readonly lawyerRepository = new LawyerRepository(),

    private readonly ticketRepository = new TicketRepository(),
  ) {}

  public async listClients(options: AdminClientListOptions) {
    const [clients, total] = await Promise.all([
      this.userRepository.findClientsForAdmin(options),
      this.userRepository.countClientsForAdmin(options),
    ]);

    return {
      items: clients.map(toAdminClientDTO),

      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  }

  public async listLawyers(options: AdminLawyerListOptions) {
    const result = await this.lawyerRepository.findForAdmin(options);

    return {
      items: result.items.map((lawyer) =>
        toAdminLawyerListItemDTO(lawyer, lawyer.user),
      ),

      pagination: {
        page: options.page,

        limit: options.limit,

        total: result.total,

        totalPages: Math.ceil(result.total / options.limit),
      },
    };
  }

  public async getLawyerById(lawyerId: string) {
    const [user, lawyer] = await Promise.all([
      this.userRepository.findByIdAndRole(lawyerId, "LAWYER"),

      this.lawyerRepository.findById(lawyerId),
    ]);

    if (!user || !lawyer) {
      throw new HttpException(
        404,
        MESSAGES.noUserWithId[LANGUAGE],
        "LAWYER_NOT_FOUND",
      );
    }

    return toAdminLawyerDTO(lawyer, user);
  }

  public async updateLawyerStatus(lawyerId: string, status: LawyerStatus) {
    const [user, lawyer] = await Promise.all([
      this.userRepository.findByIdAndRole(lawyerId, "LAWYER"),

      this.lawyerRepository.findById(lawyerId),
    ]);

    if (!user || !lawyer) {
      throw new HttpException(
        404,
        MESSAGES.noUserWithId[LANGUAGE],
        "LAWYER_NOT_FOUND",
      );
    }

    let licenseVerifiedAt: Date | null | undefined;

    switch (status) {
      case LAWYER_STATUSES.ACTIVE:
        licenseVerifiedAt = lawyer.licenseVerifiedAt ?? new Date();
        break;

      case LAWYER_STATUSES.PENDING_VERIFICATION:
      case LAWYER_STATUSES.REJECTED:
        licenseVerifiedAt = null;
        break;

      case LAWYER_STATUSES.SUSPENDED:
        licenseVerifiedAt = undefined;
        break;
    }

    const updatedLawyer = await this.lawyerRepository.updateStatusById(
      lawyerId,
      status,
      licenseVerifiedAt,
    );

    if (!updatedLawyer) {
      throw new HttpException(
        404,
        MESSAGES.noUserWithId[LANGUAGE],
        "LAWYER_NOT_FOUND",
      );
    }

    return toAdminLawyerDTO(updatedLawyer, user);
  }

  public async updateUserAccountStatus(
    userId: string,
    role: UserRole,
    status: UserStatus,
  ) {
    const user = await this.userRepository.updateStatusByIdAndRole(
      userId,
      role,
      status,
    );

    if (!user) {
      throw new HttpException(
        404,
        MESSAGES.noUserWithId[LANGUAGE],
        "USER_NOT_FOUND",
      );
    }

    return toPublicUserDTO(user);
  }

  public async getClientById(clientId: string) {
    const client = await this.userRepository.findByIdAndRole(
      clientId,
      "CLIENT",
    );

    if (!client) {
      throw new HttpException(
        404,
        MESSAGES.noUserWithId[LANGUAGE],
        "CLIENT_NOT_FOUND",
      );
    }

    return toAdminClientDTO(client);
  }

  public async getDashboard() {
    const [accountStats, lawyerStats, ticketStats] = await Promise.all([
      this.userRepository.getAdminDashboardStats(),

      this.lawyerRepository.getAdminDashboardStats(),

      this.ticketRepository.getAdminDashboardStats(),
    ]);

    return {
      accounts: accountStats,

      lawyerProfiles: lawyerStats,

      tickets: ticketStats,
    };
  }
}
