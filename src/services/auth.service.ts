import bcrypt from "bcrypt";

import { env } from "../config/env";

import {
  LAWYER_ROLES,
  LAWYER_STATUSES,
  resolveLawyerRole,
  resolveLawyerStatus,
  type LawyerRole,
  type LawyerStatus,
} from "../constants/lawyer.constants";

import { MESSAGES } from "../constants/messages.constants";

import { toPublicLawyerDTO } from "../dtos/lawyer.dto";

import { HttpException } from "../exceptions/httpException";

import type {
  CreateLawyerInput,
  LawyerRecord,
  LoginDTO,
} from "../interfaces/lawyer.interface";

import { LawyerRepository } from "../repositories/lawyer.repository";

import { TokenService } from "./token.service";

import { OTP_PURPOSES } from "../constants/otp.constants";

import type {
  OtpLoginInput,
  RequestOtpLoginInput,
} from "../interfaces/auth.interface";

import { OtpService } from "./otp.service";

const LANGUAGE = env.LANGUAGE;

export class AuthService {
  private readonly tokenService = new TokenService();

  constructor(
    private readonly repo: LawyerRepository,

    private readonly otpService: OtpService = new OtpService(),
  ) {}

  private normalizeEmail(email?: string): string | undefined {
    return email?.trim().toLowerCase();
  }

  private normalizePhone(phone?: string): string | undefined {
    return phone?.trim();
  }

  private hashPassword(password: string) {
    return bcrypt.hash(password, 12);
  }

  private comparePassword(plainPassword: string, hashedPassword: string) {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  private assertAccountCanAuthenticate(
    role: LawyerRole,
    status: LawyerStatus,
  ): void {
    if (role !== LAWYER_ROLES.LAWYER) {
      throw new HttpException(
        403,
        MESSAGES.invalidAccountRole[LANGUAGE],
        "INVALID_ACCOUNT_ROLE",
      );
    }

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

  private async ensureLawyerDoesNotExist(
    input: CreateLawyerInput,
  ): Promise<void> {
    const email = this.normalizeEmail(input.email);

    const phone = this.normalizePhone(input.phone);

    const [emailOwner, phoneOwner] = await Promise.all([
      email ? this.repo.findByEmail(email) : Promise.resolve(null),

      phone ? this.repo.findByPhone(phone) : Promise.resolve(null),
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

  private normalizeSignupData(
    input: CreateLawyerInput,
    hashedPassword: string,
  ): CreateLawyerInput {
    return {
      firstName: input.firstName.trim(),

      lastName: input.lastName.trim(),

      email: this.normalizeEmail(input.email),

      phone: this.normalizePhone(input.phone),

      password: hashedPassword,
    };
  }

  private getOtpRequestMetadata() {
    return {
      expiresIn: env.OTP_TTL_SECONDS,

      resendAfter: env.OTP_RESEND_COOLDOWN_SECONDS,
    };
  }

  public async requestOtpLogin(input: RequestOtpLoginInput) {
    const phone = this.normalizePhone(input.phone)!;

    const account = await this.repo.findByPhone(phone);

    if (!account) {
      return this.getOtpRequestMetadata();
    }

    const role = resolveLawyerRole(account.role);

    const status = resolveLawyerStatus(account.status);

    if (
      role !== LAWYER_ROLES.LAWYER ||
      status === LAWYER_STATUSES.SUSPENDED ||
      status === LAWYER_STATUSES.REJECTED
    ) {
      return this.getOtpRequestMetadata();
    }

    return this.otpService.createOtp({
      phone,

      purpose: OTP_PURPOSES.OTP_LOGIN,
    });
  }

  public async loginWithOtp(input: OtpLoginInput) {
    const phone = this.normalizePhone(input.phone)!;

    await this.otpService.verifyOtp({
      phone,

      purpose: OTP_PURPOSES.OTP_LOGIN,

      code: input.code,
    });

    const authUser = await this.repo.findByPhone(phone);

    if (!authUser) {
      throw new HttpException(
        401,
        MESSAGES.invalidCredentials[LANGUAGE],
        "INVALID_CREDENTIALS",
      );
    }

    const role = resolveLawyerRole(authUser.role);

    const status = resolveLawyerStatus(authUser.status);

    this.assertAccountCanAuthenticate(role, status);

    const userId = authUser._id.toString();

    const lastLoginAt = new Date();

    await this.repo.updateLastLogin(userId, lastLoginAt);

    const tokenPair = await this.tokenService.issueTokenPair(userId);

    const user = toPublicLawyerDTO({
      ...authUser,

      role,

      status,

      lastLoginAt,
    });

    return {
      user,

      ...tokenPair,
    };
  }

  public async signup(input: CreateLawyerInput) {
    await this.ensureLawyerDoesNotExist(input);

    const hashedPassword = await this.hashPassword(input.password);

    const created = await this.repo.create(
      this.normalizeSignupData(input, hashedPassword),
    );

    const userId = created._id.toString();

    const tokenPair = await this.tokenService.issueTokenPair(userId);

    const user = toPublicLawyerDTO(
      created.toObject() as unknown as LawyerRecord,
    );

    return {
      user,

      ...tokenPair,
    };
  }

  public async login(input: LoginDTO) {
    const email = this.normalizeEmail(input.email);

    const phone = this.normalizePhone(input.phone);

    const authUser = email
      ? await this.repo.findAuthByEmail(email)
      : await this.repo.findAuthByPhone(phone!);

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

    const role = resolveLawyerRole(authUser.role);

    const status = resolveLawyerStatus(authUser.status);

    this.assertAccountCanAuthenticate(role, status);

    const userId = authUser._id.toString();

    const lastLoginAt = new Date();

    await this.repo.updateLastLogin(userId, lastLoginAt);

    const tokenPair = await this.tokenService.issueTokenPair(userId);

    const user = toPublicLawyerDTO({
      ...authUser,

      role,

      status,

      lastLoginAt,
    });

    return {
      user,

      ...tokenPair,
    };
  }

  public async refresh(refreshToken: string) {
    const userId = await this.tokenService.consumeRefreshToken(refreshToken);

    const account = await this.repo.findAccessContextById(userId);

    if (!account) {
      throw new HttpException(
        401,
        MESSAGES.unableToFindUser[LANGUAGE],
        "SESSION_USER_NOT_FOUND",
      );
    }

    const role = resolveLawyerRole(account.role);

    const status = resolveLawyerStatus(account.status);

    this.assertAccountCanAuthenticate(role, status);

    return this.tokenService.issueTokenPair(userId);
  }

  public async logout(refreshToken: string): Promise<void> {
    await this.tokenService.revokeRefreshToken(refreshToken);
  }

  public async me(lawyerId: string) {
    const lawyer = await this.repo.findById(lawyerId);

    if (!lawyer) {
      throw new HttpException(
        404,
        MESSAGES.noUserWithId[LANGUAGE],
        "USER_NOT_FOUND",
      );
    }

    return toPublicLawyerDTO(lawyer);
  }
}
