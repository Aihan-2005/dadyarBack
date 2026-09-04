import { toPublicUserDTO } from "../dtos/user.dto";
import type { AdminUserListOptions } from "../interfaces/admin.interface";
import type { UserRole } from "../interfaces/user.interface";
import { UserRepository } from "../repositories/user.repository";
import { AdminUserListQuerySchema } from "../validators/admin.validator";

import { env } from "../config/env";
import { MESSAGES } from "../constants/messages.constants";
import { HttpException } from "../exceptions/httpException";

const LANGUAGE = env.LANGUAGE;

export class AdminService {
  constructor(private readonly userRepository = new UserRepository()) {}

  public async listUsersByRole(role: UserRole, options: AdminUserListOptions) {
    const [users, total] = await Promise.all([
      this.userRepository.findByRole(role, options),
      this.userRepository.countByRole(role),
    ]);

    const { page, limit } = AdminUserListQuerySchema.parse(options);

    return {
      items: users.map(toPublicUserDTO),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
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
}
