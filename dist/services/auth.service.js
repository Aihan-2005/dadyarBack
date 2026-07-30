"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const env_1 = require("../config/env");
const lawyer_constants_1 = require("../constants/lawyer.constants");
const messages_1 = require("../constants/messages");
const lawyer_dto_1 = require("../dtos/lawyer.dto");
const httpException_1 = require("../exceptions/httpException");
const token_service_1 = require("./token.service");
const LANGUAGE = env_1.env.LANGUAGE;
class AuthService {
  constructor(repo) {
    this.repo = repo;
    this.tokenService = new token_service_1.TokenService();
  }
  normalizeEmail(email) {
    return email?.trim().toLowerCase();
  }
  normalizePhone(phone) {
    return phone?.trim();
  }
  hashPassword(password) {
    return bcrypt_1.default.hash(password, 12);
  }
  comparePassword(plainPassword, hashedPassword) {
    return bcrypt_1.default.compare(plainPassword, hashedPassword);
  }
  assertAccountCanAuthenticate(role, status) {
    if (role !== lawyer_constants_1.LAWYER_ROLES.LAWYER) {
      throw new httpException_1.HttpException(
        403,
        messages_1.MESSAGES.invalidAccountRole[LANGUAGE],
        "INVALID_ACCOUNT_ROLE",
      );
    }
    if (status === lawyer_constants_1.LAWYER_STATUSES.SUSPENDED) {
      throw new httpException_1.HttpException(
        403,
        messages_1.MESSAGES.accountSuspended[LANGUAGE],
        "ACCOUNT_SUSPENDED",
      );
    }
    if (status === lawyer_constants_1.LAWYER_STATUSES.REJECTED) {
      throw new httpException_1.HttpException(
        403,
        messages_1.MESSAGES.accountRejected[LANGUAGE],
        "ACCOUNT_REJECTED",
      );
    }
  }
  async ensureLawyerDoesNotExist(input) {
    const email = this.normalizeEmail(input.email);
    const phone = this.normalizePhone(input.phone);
    const [emailOwner, phoneOwner] = await Promise.all([
      email ? this.repo.findByEmail(email) : Promise.resolve(null),
      phone ? this.repo.findByPhone(phone) : Promise.resolve(null),
    ]);
    if (emailOwner) {
      throw new httpException_1.HttpException(
        409,
        messages_1.MESSAGES.emailExsist[LANGUAGE],
        "EMAIL_ALREADY_EXISTS",
      );
    }
    if (phoneOwner) {
      throw new httpException_1.HttpException(
        409,
        messages_1.MESSAGES.phoneExsist[LANGUAGE],
        "PHONE_ALREADY_EXISTS",
      );
    }
  }
  normalizeSignupData(input, hashedPassword) {
    return {
      firstName: input.firstName.trim(),
      lastName: input.lastName.trim(),
      email: this.normalizeEmail(input.email),
      phone: this.normalizePhone(input.phone),
      password: hashedPassword,
    };
  }
  async signup(input) {
    await this.ensureLawyerDoesNotExist(input);
    const hashedPassword = await this.hashPassword(input.password);
    const created = await this.repo.create(
      this.normalizeSignupData(input, hashedPassword),
    );
    const userId = created._id.toString();
    const tokenPair = await this.tokenService.issueTokenPair(userId);
    const user = (0, lawyer_dto_1.toPublicLawyerDTO)(created.toObject());
    return {
      user,
      ...tokenPair,
    };
  }
  async login(input) {
    const email = this.normalizeEmail(input.email);
    const phone = this.normalizePhone(input.phone);
    const authUser = email
      ? await this.repo.findAuthByEmail(email)
      : await this.repo.findAuthByPhone(phone);
    if (!authUser) {
      throw new httpException_1.HttpException(
        401,
        messages_1.MESSAGES.invalidCredentials[LANGUAGE],
        "INVALID_CREDENTIALS",
      );
    }
    const passwordMatches = await this.comparePassword(
      input.password,
      authUser.password,
    );
    if (!passwordMatches) {
      throw new httpException_1.HttpException(
        401,
        messages_1.MESSAGES.invalidCredentials[LANGUAGE],
        "INVALID_CREDENTIALS",
      );
    }
    const role = (0, lawyer_constants_1.resolveLawyerRole)(authUser.role);
    const status = (0, lawyer_constants_1.resolveLawyerStatus)(authUser.status);
    this.assertAccountCanAuthenticate(role, status);
    const userId = authUser._id.toString();
    const lastLoginAt = new Date();
    await this.repo.updateLastLogin(userId, lastLoginAt);
    const tokenPair = await this.tokenService.issueTokenPair(userId);
    const user = (0, lawyer_dto_1.toPublicLawyerDTO)({
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
  async refresh(refreshToken) {
    const userId = await this.tokenService.consumeRefreshToken(refreshToken);
    const account = await this.repo.findAccessContextById(userId);
    if (!account) {
      throw new httpException_1.HttpException(
        401,
        messages_1.MESSAGES.unableToFindUser[LANGUAGE],
        "SESSION_USER_NOT_FOUND",
      );
    }
    const role = (0, lawyer_constants_1.resolveLawyerRole)(account.role);
    const status = (0, lawyer_constants_1.resolveLawyerStatus)(account.status);
    this.assertAccountCanAuthenticate(role, status);
    return this.tokenService.issueTokenPair(userId);
  }
  async logout(refreshToken) {
    await this.tokenService.revokeRefreshToken(refreshToken);
  }
  async me(lawyerId) {
    const lawyer = await this.repo.findById(lawyerId);
    if (!lawyer) {
      throw new httpException_1.HttpException(
        404,
        messages_1.MESSAGES.noUserWithId[LANGUAGE],
        "USER_NOT_FOUND",
      );
    }
    return (0, lawyer_dto_1.toPublicLawyerDTO)(lawyer);
  }
}
exports.AuthService = AuthService;
