import bcrypt from "bcrypt";

import { env } from "../config/env";

import type {
  ChangePasswordInput,
  LoginInput,
  OtpLoginInput,
  RequestOtpLoginInput,
  SignupInput,
} from "../interfaces/auth.interface";

import {
  LAWYER_STATUSES,
  resolveLawyerStatus,
} from "../constants/lawyer.constants";

import { MESSAGES } from "../constants/messages.constants";

import { toPublicLawyerDTO } from "../dtos/lawyer.dto";

import { HttpException } from "../exceptions/httpException";

import { LawyerRepository } from "../repositories/lawyer.repository";

import { TokenService } from "./token.service";

import { OTP_PURPOSES } from "../constants/otp.constants";

import { OtpService } from "./otp.service";
import mongoose from "mongoose";
import { UserRepository } from "../repositories/user.repository";
import { UserRecord, UserRole, UserStatus } from "../interfaces/user.interface";
import { LawyerRecord } from "../interfaces/lawyer.interface";
import { toPublicUserDTO } from "../dtos/user.dto";

const LANGUAGE = env.LANGUAGE;

export class AuthService {
  private readonly tokenService = new TokenService();

  constructor(
    private readonly userRepo: UserRepository,

    private readonly lawyerRepo: LawyerRepository,

    private readonly otpService: OtpService,
  ) {}

  private normalizeEmail(email?: string | null): string | undefined {
    return email?.trim().toLowerCase();
  }

  private normalizePhone(phone?: string | null): string | undefined {
    return phone?.trim();
  }

  private hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }

  private comparePassword(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private assertUserCanAuthenticate(user: { status: UserStatus }): void {
    if (user.status === "SUSPENDED") {
      throw new HttpException(
        403,

        MESSAGES.accountSuspended[LANGUAGE],

        "ACCOUNT_SUSPENDED",
      );
    }
  }

  private assertLawyerCanAuthenticate(lawyer: LawyerRecord): void {
    const status = resolveLawyerStatus(lawyer.status);

    if (status === LAWYER_STATUSES.SUSPENDED) {
      throw new HttpException(
        403,

        MESSAGES.accountSuspended[LANGUAGE],

        "ACCOUNT_SUSPENDED",
      );
    }

    if (status === LAWYER_STATUSES.REJECTED) {
      throw new HttpException(
        403,

        MESSAGES.accountRejected[LANGUAGE],

        "ACCOUNT_REJECTED",
      );
    }
  }

  private async assertRoleCanAuthenticate(user: {
    _id: { toString(): string };

    role: UserRole;

    status: UserStatus;
  }): Promise<LawyerRecord | null> {
    this.assertUserCanAuthenticate(user);

    if (user.role !== "LAWYER") {
      return null;
    }

    const lawyer = await this.lawyerRepo.findById(user._id.toString());

    if (!lawyer) {
      throw new HttpException(
        401,

        MESSAGES.unableToFindUser[LANGUAGE],

        "LAWYER_PROFILE_NOT_FOUND",
      );
    }

    this.assertLawyerCanAuthenticate(lawyer);

    return lawyer;
  }

  private async buildAuthUserDTO(user: UserRecord) {
    const lawyer = await this.assertRoleCanAuthenticate(user);

    if (user.role === "LAWYER" && lawyer) {
      return toPublicLawyerDTO(lawyer, user);
    }

    return toPublicUserDTO(user);
  }

  private async ensureUserDoesNotExist(input: SignupInput): Promise<void> {
    const email = this.normalizeEmail(input.email);

    const phone = this.normalizePhone(input.phone);

    const [emailOwner, phoneOwner] = await Promise.all([
      email ? this.userRepo.findByEmail(email) : Promise.resolve(null),

      phone ? this.userRepo.findByPhone(phone) : Promise.resolve(null),
    ]);

    if (emailOwner) {
      throw new HttpException(
        409,

        MESSAGES.emailExsist[LANGUAGE],

        "EMAIL_ALREADY_EXISTS",
      );
    }

    if (phoneOwner) {
      throw new HttpException(
        409,

        MESSAGES.phoneExsist[LANGUAGE],

        "PHONE_ALREADY_EXISTS",
      );
    }
  }

  private async getPasswordChangeAccount(userId: string) {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new HttpException(
        404,

        MESSAGES.noUserWithId[LANGUAGE],

        "USER_NOT_FOUND",
      );
    }

    await this.assertRoleCanAuthenticate(user);

    return {
      user,

      phone: this.normalizePhone(user.phone),

      email: this.normalizeEmail(user.email),
    };
  }

  public async requestOtpLogin(input: RequestOtpLoginInput) {
    const email = this.normalizeEmail(input.email);

    const phone = this.normalizePhone(input.phone);

    const channel = email ? "email" : "phone";

    const destination = email ?? phone!;

    const account = email
      ? await this.userRepo.findByEmail(email)
      : await this.userRepo.findByPhone(phone!);

    let canReceiveOtp = false;

    if (account && account.status !== "SUSPENDED") {
      if (account.role === "LAWYER") {
        const lawyer = await this.lawyerRepo.findById(account._id.toString());

        if (lawyer) {
          const status = resolveLawyerStatus(lawyer.status);

          canReceiveOtp =
            status !== LAWYER_STATUSES.SUSPENDED &&
            status !== LAWYER_STATUSES.REJECTED;
        }
      } else {
        canReceiveOtp = true;
      }
    }

    return this.otpService.createOtp(
      {
        channel,

        destination,

        purpose: OTP_PURPOSES.OTP_LOGIN,
      },

      {
        deliver: canReceiveOtp,
      },
    );
  }

  public async loginWithOtp(input: OtpLoginInput) {
    const email = this.normalizeEmail(input.email);

    const phone = this.normalizePhone(input.phone);

    const channel = email ? "email" : "phone";

    const destination = email ?? phone!;

    await this.otpService.verifyOtp({
      channel,

      destination,

      purpose: OTP_PURPOSES.OTP_LOGIN,

      code: input.code,
    });

    const authUser = email
      ? await this.userRepo.findByEmail(email)
      : await this.userRepo.findByPhone(phone!);

    if (!authUser) {
      throw new HttpException(
        401,

        MESSAGES.invalidCredentials[LANGUAGE],

        "INVALID_CREDENTIALS",
      );
    }
    const userId = authUser._id.toString();

    const lawyer = await this.assertRoleCanAuthenticate(authUser);

    const lastLoginAt = new Date();

    await this.userRepo.updateLastLogin(userId, lastLoginAt);

    const updatedUser = {
      ...authUser,

      lastLoginAt,
    };

    const user =
      authUser.role === "LAWYER" && lawyer
        ? toPublicLawyerDTO(lawyer, updatedUser)
        : toPublicUserDTO(updatedUser);

    const tokenPair = await this.tokenService.issueTokenPair(
      userId,
      authUser.role,
    );

    return {
      user,

      ...tokenPair,
    };
  }

  public async signup(input: SignupInput) {
    await this.ensureUserDoesNotExist(input);

    const hashedPassword = await this.hashPassword(input.password);

    const session = await mongoose.startSession();

    try {
      const result = await session.withTransaction(async () => {
        const user = await this.userRepo.create(
          {
            email: this.normalizeEmail(input.email),

            phone: this.normalizePhone(input.phone),

            password: hashedPassword,

            role: "LAWYER",
          },

          session,
        );

        const lawyer = await this.lawyerRepo.create(
          user._id,

          {
            firstName: input.firstName.trim(),

            lastName: input.lastName.trim(),
          },

          session,
        );

        const tokenPair = await this.tokenService.issueTokenPair(
          user._id.toString(),

          user.role,

          session,
        );

        return {
          user: toPublicLawyerDTO(
            lawyer.toObject() as LawyerRecord,
            user.toObject() as UserRecord,
          ),

          ...tokenPair,
        };
      });

      if (!result) {
        throw new HttpException(
          500,

          MESSAGES.serverError[LANGUAGE],

          "SIGNUP_FAILED",
        );
      }

      return result;
    } finally {
      await session.endSession();
    }
  }

  public async login(input: LoginInput) {
    const email = this.normalizeEmail(input.email);

    const phone = this.normalizePhone(input.phone);

    const authUser = email
      ? await this.userRepo.findAuthByEmail(email)
      : await this.userRepo.findAuthByPhone(phone!);

    if (!authUser) {
      throw new HttpException(
        401,
        MESSAGES.invalidCredentials[LANGUAGE],
        "INVALID_CREDENTIALS",
      );
    }

    const passwordMatches = await this.comparePassword(
      input.password,
      authUser.password,
    );

    if (!passwordMatches) {
      throw new HttpException(
        401,
        MESSAGES.invalidCredentials[LANGUAGE],
        "INVALID_CREDENTIALS",
      );
    }

    const userId = authUser._id.toString();

    const lawyer = await this.assertRoleCanAuthenticate(authUser);

    const lastLoginAt = new Date();

    await this.userRepo.updateLastLogin(userId, lastLoginAt);

    const updatedUser = {
      ...authUser,

      lastLoginAt,
    };

    const user =
      authUser.role === "LAWYER" && lawyer
        ? toPublicLawyerDTO(lawyer, updatedUser)
        : toPublicUserDTO(updatedUser);

    const tokenPair = await this.tokenService.issueTokenPair(
      userId,
      authUser.role,
    );

    return {
      user,

      ...tokenPair,
    };
  }

  public async refresh(refreshToken: string) {
    const userId = await this.tokenService.consumeRefreshToken(refreshToken);

    const account = await this.userRepo.findAccessContextById(userId);

    if (!account) {
      throw new HttpException(
        401,

        MESSAGES.unableToFindUser[LANGUAGE],

        "SESSION_USER_NOT_FOUND",
      );
    }

    await this.assertRoleCanAuthenticate(account);

    return this.tokenService.issueTokenPair(userId, account.role);
  }

  public async logout(refreshToken: string): Promise<void> {
    await this.tokenService.revokeRefreshToken(refreshToken);
  }

  public async me(userId: string) {
    const user = await this.userRepo.findById(userId);

    if (!user) {
      throw new HttpException(
        404,

        MESSAGES.noUserWithId[LANGUAGE],

        "USER_NOT_FOUND",
      );
    }

    return this.buildAuthUserDTO(user);
  }

  public async requestPasswordChange(
    lawyerId: string,
    channel: "phone" | "email",
  ) {
    const { phone, email } = await this.getPasswordChangeAccount(lawyerId);

    const destination = channel === "phone" ? phone : email;

    if (!destination) {
      throw new HttpException(
        400,
        "Verification channel is unavailable",
        "OTP_CHANNEL_UNAVAILABLE",
      );
    }

    return this.otpService.createOtp({
      channel,

      destination,

      purpose: OTP_PURPOSES.PASSWORD_CHANGE,
    });
  }

  public async changePassword(userId: string, input: ChangePasswordInput) {
    const { user, phone, email } = await this.getPasswordChangeAccount(userId);

    const destination = input.channel === "phone" ? phone : email;

    if (!destination) {
      throw new HttpException(
        400,

        "Verification channel is unavailable",

        "OTP_CHANNEL_UNAVAILABLE",
      );
    }

    await this.otpService.verifyOtp({
      channel: input.channel,

      destination,

      purpose: OTP_PURPOSES.PASSWORD_CHANGE,

      code: input.code,
    });

    const hashedPassword = await this.hashPassword(input.newPassword);

    const session = await mongoose.startSession();

    try {
      const tokenPair = await session.withTransaction(async () => {
        const result = await this.userRepo.updatePasswordById(
          userId,

          hashedPassword,

          session,
        );

        if (result.matchedCount === 0) {
          throw new HttpException(
            404,

            MESSAGES.noUserWithId[LANGUAGE],

            "USER_NOT_FOUND",
          );
        }

        await this.tokenService.revokeAllUserSessions(userId, session);

        return this.tokenService.issueTokenPair(
          userId,

          user.role,

          session,
        );
      });

      if (!tokenPair) {
        throw new HttpException(
          500,

          MESSAGES.serverError[LANGUAGE],

          "PASSWORD_CHANGE_FAILED",
        );
      }

      return tokenPair;
    } finally {
      await session.endSession();
    }
  }
}
