import { HttpException } from "../exceptions/httpException";
import type { UpdateClientProfileInput } from "../interfaces/clientProfile.interface";
import { ClientProfileRepository } from "../repositories/clientProfile.repository";
import { UserRepository } from "../repositories/user.repository";
import { toClientProfileDTO } from "../dtos/clientProfile.dto";

export class ClientProfileService {
  constructor(
    private readonly profileRepository = new ClientProfileRepository(),
    private readonly userRepository = new UserRepository(),
  ) {}

  private async requireClientUser(userId: string) {
    const user = await this.userRepository.findByIdAndRole(
      userId,
      "CLIENT",
    );

    if (!user) {
      throw new HttpException(
        404,
        "حساب موکل پیدا نشد",
        "CLIENT_ACCOUNT_NOT_FOUND",
      );
    }

    return user;
  }

  public async getMyProfile(userId: string) {
    const user = await this.requireClientUser(userId);

    const profile = await this.profileRepository.findByUserId(userId);

    if (!profile) {
      return null;
    }

    return toClientProfileDTO(
      profile,
      user,
    );
  }

  public async updateMyProfile(
    userId: string,
    input: UpdateClientProfileInput,
  ) {
    const user = await this.requireClientUser(userId);

    const profile = await this.profileRepository.upsertByUserId(
      userId,
      input.fullName.trim(),
    );

    if (!profile) {
      throw new HttpException(
        500,
        "ذخیره پروفایل موکل انجام نشد",
        "CLIENT_PROFILE_SAVE_FAILED",
      );
    }

    return toClientProfileDTO(
      profile,
      user,
    );
  }
}
