import { toPublicUserDTO } from "../dtos/user.dto";
import type {
  AdminLawyerListOptions,
  AdminUserListOptions,
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

import { toAdminLawyerDTO, toAdminLawyerListItemDTO } from "../dtos/admin.dto";

const LANGUAGE = env.LANGUAGE;

export class AdminService {
  constructor(
    private readonly userRepository = new UserRepository(),
    private readonly lawyerRepository = new LawyerRepository(),
  ) {}

  public async listUsersByRole(role: UserRole, options: AdminUserListOptions) {
    const [users, total] = await Promise.all([
      this.userRepository.findByRole(role, options),
      this.userRepository.countByRole(role),
    ]);

    return {
      items: users.map(toPublicUserDTO),

      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages: Math.ceil(total / options.limit),
      },
    };
  }

  public async getUserByRole(userId: string, role: UserRole) {
    const user = await this.userRepository.findByIdAndRole(userId, role);

    if (!user) {
      throw new HttpException(
        404,

        MESSAGES.noUserWithId[LANGUAGE],

        "User_NOT_FOUND",
      );
    }

    return toPublicUserDTO(user);
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
}
